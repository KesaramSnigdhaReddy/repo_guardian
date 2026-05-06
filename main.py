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
from github import Github
from pydantic import BaseModel
import subprocess
import os
class PRRequest(BaseModel):
    risk: str
    fix: str
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
from fastapi.responses import StreamingResponse
import io

@app.get("/api/report/{pr_id}")
def get_report(pr_id: int):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.enums import TA_LEFT, TA_CENTER

    result = review_results.get(pr_id)
    if not result:
        raise HTTPException(status_code=404, detail="PR not found")

    policy = getattr(result, "policy", {})
    final_score = min(result.score, policy.get("score", 100))

    # ── Buffer ──
    buffer = io.BytesIO()
    doc    = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20*mm, leftMargin=20*mm,
        topMargin=20*mm,   bottomMargin=20*mm,
    )

    # ── Styles ──
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("title",
        fontSize=22, fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0d1117"),
        spaceAfter=4)

    subtitle_style = ParagraphStyle("subtitle",
        fontSize=11, fontName="Helvetica",
        textColor=colors.HexColor("#656d76"),
        spaceAfter=16)

    section_style = ParagraphStyle("section",
        fontSize=13, fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0d1117"),
        spaceBefore=14, spaceAfter=6)

    body_style = ParagraphStyle("body",
        fontSize=10, fontName="Helvetica",
        textColor=colors.HexColor("#24292f"),
        spaceAfter=4, leading=15)

    mono_style = ParagraphStyle("mono",
        fontSize=9, fontName="Courier",
        textColor=colors.HexColor("#0550ae"),
        spaceAfter=2)

    # ── Score color ──
    if final_score >= 80:
        score_color = colors.HexColor("#1a7f37")
        verdict     = "APPROVED"
        verdict_bg  = colors.HexColor("#dafbe1")
    elif final_score >= 50:
        score_color = colors.HexColor("#9a6700")
        verdict     = "NEEDS WORK"
        verdict_bg  = colors.HexColor("#fff8c5")
    else:
        score_color = colors.HexColor("#cf222e")
        verdict     = "BLOCKED"
        verdict_bg  = colors.HexColor("#ffebe9")

    severity_colors = {
        "critical": colors.HexColor("#cf222e"),
        "high":     colors.HexColor("#bc4c00"),
        "medium":   colors.HexColor("#9a6700"),
        "low":      colors.HexColor("#1a7f37"),
    }

    elements = []

    # ── Header ──
    elements.append(Paragraph("RepoGuardian", title_style))
    elements.append(Paragraph("Automated Security Review Report", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#d0d7de")))
    elements.append(Spacer(1, 8))

    # ── Meta info table ──
    meta_data = [
        ["Repository",  result.repo_name],
        ["PR Number",   f"#{result.pr_number}"],
        ["Reviewed At", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
        ["Verdict",     verdict],
    ]
    meta_table = Table(meta_data, colWidths=[45*mm, 130*mm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",    (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",    (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE",    (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",   (0, 0), (0, -1), colors.HexColor("#656d76")),
        ("TEXTCOLOR",   (1, 0), (1, -1), colors.HexColor("#24292f")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#f6f8fa"), colors.white]),
        ("TOPPADDING",  (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0,0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("GRID",        (0, 0), (-1, -1), 0.5, colors.HexColor("#d0d7de")),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # ── Score card ──
    score_data = [[
        Paragraph(f'<font size="32" color="{score_color.hexval()}">'
                  f'<b>{final_score}</b></font><font size="14" color="#656d76">/100</font>', body_style),
        Paragraph(f'<font size="13"><b>{verdict}</b></font>', body_style),
        Paragraph(f'<font size="10" color="#656d76">'
                  f'{len(result.comments)} LLM findings<br/>'
                  f'{len(policy.get("violations",[]))} policy violation(s)<br/>'
                  f'{len(policy.get("warnings",[]))} warning(s)</font>', body_style),
    ]]
    score_table = Table(score_data, colWidths=[50*mm, 60*mm, 65*mm])
    score_table.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), verdict_bg),
        ("BOX",          (0, 0), (-1, -1), 1, colors.HexColor("#d0d7de")),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",   (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 10),
        ("LEFTPADDING",  (0, 0), (-1, -1), 10),
    ]))
    elements.append(score_table)
    elements.append(Spacer(1, 12))

    # ── Summary ──
    elements.append(Paragraph("Summary", section_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#d0d7de")))
    elements.append(Spacer(1, 4))
    summary_text = result.summary or "No summary available."
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 8))

    # ── Policy violations ──
    if policy.get("violations") or policy.get("warnings"):
        elements.append(Paragraph("Policy Results", section_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#d0d7de")))
        elements.append(Spacer(1, 4))

        if policy.get("blocked"):
            elements.append(Paragraph(
                '<font color="#cf222e"><b>🚫 PR BLOCKED BY POLICY</b></font>', body_style))
            elements.append(Spacer(1, 4))

        for v in policy.get("violations", []):
            elements.append(Paragraph(
                f'<font color="#cf222e"><b>VIOLATION:</b></font> {v.get("rule", "")} — {v.get("message", "")}',
                body_style))

        for w in policy.get("warnings", []):
            elements.append(Paragraph(
                f'<font color="#9a6700"><b>WARNING:</b></font> {w.get("rule", "")} — {w.get("message", "")}',
                body_style))

        elements.append(Spacer(1, 8))

    # ── Findings table ──
    if result.comments:
        elements.append(Paragraph(f"Code Review Findings ({len(result.comments)})", section_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#d0d7de")))
        elements.append(Spacer(1, 4))

        findings_header = [
            Paragraph("<b>Severity</b>", body_style),
            Paragraph("<b>File</b>",     body_style),
            Paragraph("<b>Line</b>",     body_style),
            Paragraph("<b>Finding</b>",  body_style),
        ]
        findings_rows = [findings_header]

        for c in result.comments:
            sev_color = severity_colors.get(c.severity, colors.HexColor("#656d76"))
            findings_rows.append([
                Paragraph(f'<font color="{sev_color.hexval()}"><b>{c.severity.upper()}</b></font>', body_style),
                Paragraph(c.path, mono_style),
                Paragraph(str(c.line), body_style),
                Paragraph(c.body[:120] + ("..." if len(c.body) > 120 else ""), body_style),
            ])

        findings_table = Table(findings_rows, colWidths=[22*mm, 40*mm, 12*mm, 96*mm])
        findings_table.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0),  colors.HexColor("#f6f8fa")),
            ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, -1), 9),
            ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#d0d7de")),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f8fa")]),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ]))
        elements.append(findings_table)
        elements.append(Spacer(1, 12))

    # ── Footer ──
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#d0d7de")))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        f'Generated by RepoGuardian • {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")} • '
        f'Powered by Groq + Llama3',
        ParagraphStyle("footer", fontSize=8, textColor=colors.HexColor("#656d76"), alignment=TA_CENTER)
    ))

    # ── Build PDF ──
    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=repoguardian-pr{pr_id}-report.pdf"
        }
    )


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

@app.post("/api/simulate")
def simulate_attack(data: dict):
    t = data.get("type", "generic")

    if "auth" in t:
        return {
            "title": "Authentication Bypass Risk",
            "risk": "CRITICAL",
            "impact": [
                "Attackers can log in without credentials",
                "User accounts can be hijacked",
                "Admin privileges may be escalated"
            ],
            "cost": "₹5,00,000/month",
            "detected_in": "2 seconds"
        }

    if "config" in t:
        return {
            "title": "Configuration Exposure",
            "risk": "HIGH",
            "impact": [
                "Sensitive system settings exposed",
                "Environment secrets may leak",
                "Attackers can reconfigure system behavior"
            ],
            "cost": "₹2,00,000/month",
            "detected_in": "3 seconds"
        }

    if "db" in t:
        return {
            "title": "Database Access Risk",
            "risk": "CRITICAL",
            "impact": [
                "Full database access possible",
                "Customer data leakage",
                "Data manipulation or deletion"
            ],
            "cost": "₹7,00,000/month",
            "detected_in": "2 seconds"
        }

    if "api" in t:
        return {
            "title": "API Exploitation Risk",
            "risk": "HIGH",
            "impact": [
                "Unauthorized API usage",
                "Data exposure via endpoints",
                "Service abuse or rate exhaustion"
            ],
            "cost": "₹3,50,000/month",
            "detected_in": "4 seconds"
        }

    if "security" in t:
        return {
            "title": "Security Logic Failure",
            "risk": "CRITICAL",
            "impact": [
                "Core protections can be bypassed",
                "Attackers gain deep system control",
                "High chance of full compromise"
            ],
            "cost": "₹10,00,000/month",
            "detected_in": "1 second"
        }

    return {
        "title": "General Vulnerability",
        "risk": "MEDIUM",
        "impact": [
            "Unexpected system behavior",
            "Potential exploit path",
            "Requires further review"
        ],
        "cost": "₹1,00,000/month",
        "detected_in": "5 seconds"
    }
@app.post("/api/copilot")
def copilot(data: dict):
    question = data.get("question", "").strip().lower()

    if not question:
        return {"answer": ""}  # 🔥 DON'T auto answer

    if "why" in question:
        return {
            "answer": "This vulnerability exposes internal logic that attackers can exploit to gain unauthorized access or escalate privileges."
        }

    if "fix" in question:
        return {
            "answer": "Recommended Fix:\n- Move sensitive logic to secure modules\n- Use environment variables for secrets\n- Add validation and access control checks"
        }

    if "impact" in question or "risk" in question:
        return {
            "answer": "Impact:\n- Data leakage possible\n- Unauthorized system access\n- Financial loss due to exploitation"
        }

    return {
        "answer": "Ask things like: 'Why is this risky?', 'How to fix this?', or 'What is the impact?'"
    }
@app.post("/api/autofix")
def autofix(data: dict):

    t = data.get("type", "")

    if "auth" in t:
        return {
            "fix": [
                "Enable JWT validation",
                "Add MFA authentication",
                "Implement session expiration",
                "Restrict unauthorized token reuse"
            ]
        }

    if "api" in t:
        return {
            "fix": [
                "Add API authentication",
                "Enable request validation",
                "Implement rate limiting",
                "Restrict public endpoint access"
            ]
        }

    if "db" in t:
        return {
            "fix": [
                "Encrypt database credentials",
                "Restrict public DB access",
                "Enable row-level permissions",
                "Rotate exposed secrets"
            ]
        }

    return {
        "fix": [
            "Apply least privilege access",
            "Rotate exposed secrets",
            "Add validation checks",
            "Enable security monitoring"
        ]
    }
@app.get("/api/executive-summary")
def executive_summary():
    return {
        "estimated_loss": "₹18,50,000",
        "risk_reduction": "63%",
        "compliance_score": 82,
        "mean_detection_time": "3 sec",
        "critical_systems": 4,
        "summary": "Critical vulnerabilities detected across authentication, API, and configuration systems. Immediate remediation recommended for high-risk modules."
    }
@app.post("/api/create-pr")
def create_pr(req: PRRequest):

    try:

        token = os.getenv("GITHUB_TOKEN")
        repo_name = os.getenv("GITHUB_REPO")

        g = Github(token)

        repo = g.get_repo(repo_name)

        # 🔥 unique branch name
        branch_name = (
            f"ai-fix-{req.risk.lower().replace(' ', '-')}"
        )

        # checkout new branch
        subprocess.run(
            ["git", "checkout", "-b", branch_name],
            check=True
        )

        # 🔥 create AI fix file
        with open("ai_security_fix.txt", "w") as f:
            f.write(req.fix)

        # git add
        subprocess.run(
            ["git", "add", "."],
            check=True
        )

        # commit
        subprocess.run(
            [
                "git",
                "commit",
                "-m",
                f"fix(security): remediate {req.risk}"
            ],
            check=True
        )

        # push
        subprocess.run(
            [
                "git",
                "push",
                "origin",
                branch_name
            ],
            check=True
        )

        # 🔥 create PR
        pr = repo.create_pull(
            title=f"fix(security): remediate {req.risk}",
            body=(
                "AI-generated remediation PR "
                "created by RepoGuardian"
            ),
            head=branch_name,
            base="main"
        )

        return {
            "success": True,
            "url": pr.html_url,
            "number": pr.number,
            "title": pr.title
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
# ─────────────────────────────────────────
# Run
# ─────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)