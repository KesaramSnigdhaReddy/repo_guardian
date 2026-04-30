"""
RepoGuardian — Policy-as-Code Agent
Checks PRs against YAML-defined org rules
"""

import yaml
import re
import os
import logging

log = logging.getLogger(__name__)


class PolicyAgent:
    def __init__(self, policy_path=None):
        if policy_path is None:
            policy_path = os.path.join(
                os.path.dirname(__file__), "..", "policy.yaml"
            )
        with open(policy_path) as f:
            self.rules = yaml.safe_load(f)["rules"]
        log.info(f"PolicyAgent loaded {len(self.rules)} rules from {policy_path}")

    def run(self, pr_data: dict) -> dict:
        """
        pr_data = {
            files_changed: [list of filenames],
            file_patches:  {filename: patch_text},
            approvals:     int
        }
        """
        violations = []   # action: block → PR gets blocked
        warnings   = []   # action: warn  → comment only

        files_changed = pr_data.get("files_changed", [])
        file_patches  = pr_data.get("file_patches", {})

        for rule in self.rules:
            rtype  = rule["type"]
            action = rule.get("action", "warn")
            target = violations if action == "block" else warnings

            # ── forbidden_files ──
            if rtype == "forbidden_files":
                for pattern in rule["patterns"]:
                    if pattern.startswith("*."):
                        ext = pattern[1:]  # e.g. ".pem"
                        matches = [f for f in files_changed if f.endswith(ext)]
                    else:
                        matches = [f for f in files_changed
                                   if os.path.basename(f) == pattern]
                    if matches:
                        target.append({
                            "rule":    rule["name"],
                            "message": f"Forbidden file(s) found: {', '.join(matches)}",
                            "files":   matches,
                        })

            # ── forbidden_patterns ──
            elif rtype == "forbidden_patterns":
                allowed_exts = rule.get("file_types", [])
                for fname, patch in file_patches.items():
                    ext = "." + fname.rsplit(".", 1)[-1] if "." in fname else ""
                    if allowed_exts and ext not in allowed_exts:
                        continue
                    if re.search(rule["regex"], patch):
                        target.append({
                            "rule":    rule["name"],
                            "message": f"Forbidden pattern in {fname}",
                            "file":    fname,
                        })

            # ── branch_protection ──
            elif rtype == "branch_protection":
                approvals = pr_data.get("approvals", 0)
                required  = rule.get("min_approvals", 2)
                if approvals < required:
                    target.append({
                        "rule":    rule["name"],
                        "message": f"Only {approvals} approval(s), need {required}",
                        "got":     approvals,
                        "required": required,
                    })

        blocked     = len(violations) > 0
        score       = 0 if blocked else (80 if warnings else 100)
        total_issues = len(violations) + len(warnings)

        log.info(
            f"PolicyAgent: {len(violations)} violation(s), "
            f"{len(warnings)} warning(s), blocked={blocked}"
        )

        return {
            "agent":      "policy",
            "score":      score,
            "blocked":    blocked,
            "violations": violations,
            "warnings":   warnings,
            "summary":    (
                f"Policy check: {len(violations)} blocking violation(s), "
                f"{len(warnings)} warning(s)."
            ),
        }


# ── Standalone test ──
if __name__ == "__main__":
    agent = PolicyAgent()
    test_data = {
        "files_changed": [".env", "main.py", "app.js"],
        "file_patches": {
            "main.py": "api_key = 'abc123'\nprint('hello')\n",
            "app.js":  "const token = 'ghp_secret'\n",
        },
        "approvals": 1,
    }
    result = agent.run(test_data)
    import json
    print(json.dumps(result, indent=2))