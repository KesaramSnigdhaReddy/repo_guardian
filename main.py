"""
RepoGuardian — FastAPI Backend
"""

import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

# Must load before any agent imports
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from github import Github

from agents.pr_review import run_pr_review_agent, PRReviewResult, ReviewComment
from agents.policy_agent import PolicyAgent
from agents.history_scanner import load_findings, run_history_scan

logging.basicConfig(level=logging.INFO, format="%(asctime)s [PR_AGENT] %(message)s")
log = logging.getLogger(__name__)

app = FastAPI(title="RepoGuardian API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory store ──
review_results = {}
agent_status   = {}

STORE_FILE = os.path.join(os.path.dirname(__file__), "review_store.json")


# ─────────────────────────────────────────
# Persistence
# ─────────────────────────────────────────

def save_store():
    try:
        data = {}
        for pr_num, result in review_results.items():
            data[str(pr_num)] = {
                "pr_number": result.pr_number,
                "repo_name": result.repo_name,
                "score":     result.score,
                "summary":   result.summary,
                "policy":    getattr(result, "policy", {}),
                "comments": [
                    {
                        "path":     c.path,
                        "line":     c.line,
                        "body":     c.body,
                        "severity": c.severity,
                        "category": c.category,
                    }
                    for c in result.comments
                ],
            }
        with open(STORE_FILE, "w") as f:
            json.dump(data, f, indent=2)
        log.info(f"Store saved — {len(data)} review(s)")
    except Exception as e:
        log.error(f"Save store failed: {e}")


def load_store():
    try:
        with open(STORE_FILE) as f:
            data = json.load(f)
        for pr_num, d in data.items():
            comments = [
                ReviewComment(
                    path=c["path"], line=c["line"],
                    body=c["body"], severity=c["severity"],
                    category=c["category"],
                )
                for c in d.get("comments", [])
            ]
            result = PRReviewResult(
                repo_name=d["repo_name"],
                pr_number=d["pr_number"],
                summary=d["summary"],
                comments=comments,
                score=d["score"],
            )
            result.policy = d.get("policy", {})
            review_results[int(pr_num)] = result
        log.info(f"Store loaded — {len(review_results)} review(s)")
    except FileNotFoundError:
        log.info("No store file found — starting fresh")
    except Exception as e:
        log.error(f"Load store failed: {e}")


# Load persisted data on startup
load_store()


# ─────────────────────────────────────────
# Request Models
# ─────────────────────────────────────────

class ReviewRequest(BaseModel):
    repo: str
    pr_number: int


# ─────────────────────────────────────────
# Health check
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "RepoGuardian API running"}


# ─────────────────────────────────────────
# /api/dashboard
# ─────────────────────────────────────────

@app.get("/api/dashboard")
def get_dashboard():
    all_findings    = []
    total_deduction = 0
    pr_count        = len(review_results)

    for pr_num, result in review_results.items():
        policy     = getattr(result, "policy", {})
        real_score = policy.get("score", result.score) if policy.get("blocked") else result.score
        total_deduction += max(0, 100 - real_score)

        # LLM findings
        for c in result.comments:
            all_findings.append({
                "severity": c.severity,
                "agent":    "pr_review",
                "file":     c.path,
                "message":  c.body[:80],
            })

        # Policy violations
        for v in policy.get("violations", []):
            all_findings.append({
                "severity": "high",
                "agent":    "policy",
                "file":     ", ".join(v.get("files", [v.get("file", "unknown")])),
                "message":  v.get("message", f"Policy violation: {v.get('rule')}"),
            })

        # Policy warnings
        for w in policy.get("warnings", []):
            all_findings.append({
                "severity": "medium",
                "agent":    "policy",
                "file":     w.get("file", "unknown"),
                "message":  w.get("message", f"Policy warning: {w.get('rule')}"),
            })

    # ── History scanner findings ──
    history_data     = load_findings()
    score_history    = history_data.get("score_history", [])
    history_findings = history_data.get("findings", [])

    for f in history_findings:
        all_findings.append({
            "severity": f.get("severity", "high"),
            "agent":    "secret_scanner",
            "file":     f.get("file", "unknown"),
            "message":  f"Secret in git history — commit {f.get('commit', '?')} by {f.get('author', '?')}",
        })

    # Adjust health score to include history findings
    history_deduction = len(history_findings) * 3
    health_score  = max(0, 100 - (total_deduction // max(pr_count, 1)) - history_deduction)
    open_findings = len(all_findings)
    active_agents = sum(1 for s in agent_status.values() if s == "running")

    return {
        "health_score":  health_score,
        "open_findings": open_findings,
        "pr_count":      pr_count,
        "active_agents": active_agents,
        "findings":      all_findings[:10],
        "score_history": score_history,
    }


# ─────────────────────────────────────────
# /api/prs
# ─────────────────────────────────────────

@app.get("/api/prs")
def get_prs():
    prs = []
    for pr_num, result in review_results.items():
        policy = getattr(result, "policy", {
            "blocked": False, "violations": [], "warnings": [], "score": 100
        })

        findings = []
        for c in result.comments:
            findings.append({
                "severity": c.severity,
                "message":  c.body[:80],
                "file":     c.path,
            })
        for v in policy.get("violations", []):
            findings.append({
                "severity": "high",
                "message":  v.get("message", f"Policy: {v.get('rule')}"),
                "file":     ", ".join(v.get("files", [])),
            })
        for w in policy.get("warnings", []):
            findings.append({
                "severity": "medium",
                "message":  w.get("message", f"Warning: {w.get('rule')}"),
                "file":     w.get("file", ""),
            })

        real_score = min(result.score, policy.get("score", 100))

        prs.append({
            "id":         result.pr_number,
            "title":      f"PR #{result.pr_number} — {result.repo_name}",
            "repo":       result.repo_name,
            "score":      real_score,
            "blocked":    policy.get("blocked", False),
            "findings":   findings,
            "fix_pr_url": None,
            "policy":     policy,
            "created_at": "just now",
        })
    return prs


# ─────────────────────────────────────────
# /api/users
# ─────────────────────────────────────────

@app.get("/api/users")
def get_users():
    devs = {}
    for pr_num, result in review_results.items():
        owner = result.repo_name.split("/")[0]
        if owner not in devs:
            devs[owner] = {
                "name":             owner,
                "health_score":     result.score,
                "pr_count":         1,
                "last_active":      "just now",
                "recurring_alerts": [],
            }
        else:
            devs[owner]["pr_count"]    += 1
            devs[owner]["health_score"] = (
                devs[owner]["health_score"] + result.score
            ) // 2
    return list(devs.values())


# ─────────────────────────────────────────
# /api/agent-status
# ─────────────────────────────────────────

@app.get("/api/agent-status")
def get_agent_status():
    return [
        {"name": "pr_review",      "status": agent_status.get("pr_review",      "idle")},
        {"name": "policy",         "status": agent_status.get("policy",         "idle")},
        {"name": "secret_scanner", "status": agent_status.get("secret_scanner", "idle")},
        {"name": "autofix",        "status": agent_status.get("autofix",        "idle")},
    ]


# ─────────────────────────────────────────
# /api/review — trigger PR review
# ─────────────────────────────────────────

@app.post("/api/review")
def trigger_review(req: ReviewRequest):
    log.info(f"Triggering review: {req.repo} PR #{req.pr_number}")
    agent_status["pr_review"] = "running"
    agent_status["policy"]    = "running"

    try:
        g    = Github(os.getenv("GITHUB_TOKEN"))
        repo = g.get_repo(req.repo)
        pr   = repo.get_pull(req.pr_number)

        files_changed = [f.filename for f in pr.get_files()]
        file_patches  = {f.filename: (f.patch or "") for f in pr.get_files()}
        approvals     = pr.get_reviews().totalCount

        pr_data = {
            "files_changed": files_changed,
            "file_patches":  file_patches,
            "approvals":     approvals,
        }

        policy_agent  = PolicyAgent()
        policy_result = policy_agent.run(pr_data)
        agent_status["policy"] = "done"
        log.info(f"Policy: blocked={policy_result['blocked']}, violations={len(policy_result['violations'])}")

        result = run_pr_review_agent(req.repo, req.pr_number)
        review_results[req.pr_number] = result
        agent_status["pr_review"] = "done"

        result.policy = policy_result
        final_score   = min(result.score, policy_result["score"])

        save_store()

        return {
            "status":  "success",
            "score":   final_score,
            "summary": result.summary,
            "issues":  len(result.comments),
            "policy":  policy_result,
        }

    except Exception as e:
        agent_status["pr_review"] = "error"
        agent_status["policy"]    = "error"
        log.error(f"Review failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# /api/report/{pr_id}
# ─────────────────────────────────────────

@app.get("/api/report/{pr_id}")
def get_report(pr_id: int):
    result = review_results.get(pr_id)
    if not result:
        raise HTTPException(status_code=404, detail="PR not found")

    findings = [
        {
            "file":     c.path,
            "line":     c.line,
            "severity": c.severity,
            "category": c.category,
            "message":  c.body,
        }
        for c in result.comments
    ]

    return {
        "pr_number": result.pr_number,
        "repo":      result.repo_name,
        "score":     result.score,
        "summary":   result.summary,
        "findings":  findings,
        "policy":    getattr(result, "policy", {}),
    }


# ─────────────────────────────────────────
# /api/history
# ─────────────────────────────────────────

@app.get("/api/history")
def get_history():
    return load_findings()


# ─────────────────────────────────────────
# /api/scan-history
# ─────────────────────────────────────────

@app.post("/api/scan-history")
def trigger_history_scan():
    agent_status["secret_scanner"] = "running"
    try:
        result = run_history_scan()
        agent_status["secret_scanner"] = "done"
        return {
            "status":   "success",
            "findings": len(result["findings"]),
            "history":  len(result["score_history"]),
        }
    except Exception as e:
        agent_status["secret_scanner"] = "error"
        log.error(f"History scan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# /api/compliance/soc2
# ─────────────────────────────────────────

@app.get("/api/compliance/soc2")
def get_soc2_report():
    history  = load_findings()
    findings = history.get("findings", [])

    controls = {
        "CC6.1": "Logical and Physical Access Controls",
        "CC6.6": "Restriction of Access to Information",
        "CC7.1": "Configuration Management",
        "CC7.2": "Monitoring of Infrastructure",
        "CC8.1": "Change Management",
    }

    control_findings = {k: [] for k in controls}

    for f in findings:
        ftype = f.get("type", "")
        fname = f.get("file", "").lower()
        if "secret" in ftype or "token" in ftype:
            control_findings["CC6.1"].append(f)
            control_findings["CC6.6"].append(f)
        if "config" in fname or "settings" in fname:
            control_findings["CC7.1"].append(f)
        control_findings["CC8.1"].append(f)

    return {
        "report_type":    "SOC 2 Type II Evidence",
        "generated_at":   datetime.utcnow().isoformat(),
        "repo":           os.getenv("GITHUB_REPO", "muski630346/repo_guardian"),
        "controls": [
            {
                "id":       cid,
                "name":     controls[cid],
                "findings": len(control_findings[cid]),
                "status":   "Pass" if len(control_findings[cid]) == 0 else "Findings",
                "evidence": control_findings[cid][:3],
            }
            for cid in controls
        ],
        "total_findings": len(findings),
        "score_history":  history.get("score_history", []),
    }


# ─────────────────────────────────────────
# /api/compliance/sbom
# ─────────────────────────────────────────

@app.get("/api/compliance/sbom")
def get_sbom():
    req_file   = os.path.join(os.path.dirname(__file__), "requirements.txt")
    components = []

    try:
        with open(req_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    parts   = line.split("==")
                    name    = parts[0].strip()
                    version = parts[1].strip() if len(parts) > 1 else "latest"
                    components.append({
                        "type":    "library",
                        "name":    name,
                        "version": version,
                        "purl":    f"pkg:pypi/{name.lower()}@{version}",
                    })
    except FileNotFoundError:
        log.warning("requirements.txt not found")

    return {
        "bomFormat":   "CycloneDX",
        "specVersion": "1.4",
        "version":     1,
        "metadata": {
            "timestamp": datetime.utcnow().isoformat(),
            "component": {
                "type": "application",
                "name": "repo-guardian",
            }
        },
        "components": components,
    }


# ─────────────────────────────────────────
# /api/github-user
# ─────────────────────────────────────────

@app.get("/api/github-user")
def get_github_user():
    try:
        g    = Github(os.getenv("GITHUB_TOKEN"))
        user = g.get_user()
        return {
            "login":        user.login,
            "name":         user.name,
            "avatar_url":   user.avatar_url,
            "public_repos": user.public_repos,
            "followers":    user.followers,
            "following":    user.following,
            "html_url":     user.html_url,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Run
# ─────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)