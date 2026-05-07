from agents.security_agent import security_agent
from agents.repo_health_agent import repo_health_agent

def orchestrator_agent():

    print(
        "[Orchestrator Agent] Dispatching security workflow..."
    )

    findings = security_agent()

    health = repo_health_agent(findings)

    return {

        "agent": "Orchestrator Agent",

        "findings": findings,

        "health_score": health["score"],

        "summary": health["summary"]
    }