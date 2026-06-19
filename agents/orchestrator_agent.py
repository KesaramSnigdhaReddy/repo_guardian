from agents.security_agent import security_agent
from agents.repo_health_agent import repo_health_agent

from tools.memory import run_memory_agent


def orchestrator_agent():

    print(
        "[Orchestrator Agent] Dispatching security workflow..."
    )

    findings = security_agent()

    health = repo_health_agent(findings)

    # Memory Agent
    memory_result = run_memory_agent(
        repo_name="muski630346/repo_guardian",
        pr_number=1,
        findings=findings,
        health_score=health["score"]
    )

    return {

        "agent": "Orchestrator Agent",

        "findings": findings,

        "health_score": health["score"],

        "summary": health["summary"],

        "memory": {

            "developer": memory_result.developer,

            "alerts": [
                {
                    "category": a.category,
                    "count": a.count,
                    "trend": a.trend,
                    "message": a.message,
                }
                for a in memory_result.recurring_alerts
            ],

            "profile_summary": memory_result.profile_summary
        }
    }