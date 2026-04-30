"""
RepoGuardian — History Scanner Agent
Scans full git log for secrets and feeds trend data
"""

import os
import re
import json
import logging
from datetime import datetime
from github import Github

log = logging.getLogger(__name__)

SECRET_PATTERNS = [
    r'(?i)(api_key|secret_key|password|token|passwd)\s*=\s*["\']?[\w\-]+',
    r'(?i)aws_access_key_id\s*=\s*[A-Z0-9]{20}',
    r'(?i)github_token\s*=\s*ghp_[a-zA-Z0-9]+',
    r'(?i)-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----',
]

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "..", "history_findings.json")


def scan_repo_history(repo_name: str, token: str, max_commits: int = 100) -> list:
    g    = Github(token)
    repo = g.get_repo(repo_name)

    findings = []
    log.info(f"Scanning history of {repo_name} (last {max_commits} commits)...")

    for i, commit in enumerate(repo.get_commits()):
        if i >= max_commits:
            break

        try:
            for f in commit.files:
                if not f.patch:
                    continue
                for pattern in SECRET_PATTERNS:
                    if re.search(pattern, f.patch):
                        findings.append({
                            "commit":  commit.sha[:7],
                            "file":    f.filename,
                            "author":  commit.author.login if commit.author else "unknown",
                            "date":    commit.commit.author.date.isoformat(),
                            "type":    "secret_in_history",
                            "severity": "high",
                        })
                        break
        except Exception as e:
            log.warning(f"Skipping commit {commit.sha[:7]}: {e}")
            continue

    log.info(f"History scan complete — {len(findings)} issue(s) found")
    return findings


def build_score_history(findings: list) -> list:
    """Build a score-over-time array from findings dates."""
    from collections import defaultdict
    import datetime as dt

    # Group findings by date
    by_date = defaultdict(int)
    for f in findings:
        try:
            date = f["date"][:10]  # YYYY-MM-DD
            by_date[date] += 1
        except Exception:
            continue

    # Build score timeline — start at 100, deduct per finding
    score_history = []
    running_score = 100
    for date in sorted(by_date.keys()):
        running_score = max(0, running_score - by_date[date] * 5)
        score_history.append({"date": date, "score": running_score})

    return score_history


def save_findings(findings: list, score_history: list):
    data = {
        "scanned_at":    datetime.utcnow().isoformat(),
        "findings":      findings,
        "score_history": score_history,
    }
    with open(HISTORY_FILE, "w") as f:
        json.dump(data, f, indent=2)
    log.info(f"History saved to {HISTORY_FILE}")


def load_findings() -> dict:
    try:
        with open(HISTORY_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"scanned_at": None, "findings": [], "score_history": []}


def run_history_scan():
    token = os.getenv("GITHUB_TOKEN")
    repo  = os.getenv("GITHUB_REPO", "muski630346/repo_guardian")

    if not token:
        log.error("GITHUB_TOKEN not set")
        return

    findings      = scan_repo_history(repo, token)
    score_history = build_score_history(findings)
    save_findings(findings, score_history)
    return {"findings": findings, "score_history": score_history}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = run_history_scan()
    print(f"Found {len(result['findings'])} issues")
    print(f"Score history: {result['score_history']}")