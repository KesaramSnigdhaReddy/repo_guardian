import random
from datetime import datetime

def security_agent():

    findings = []

    vulnerabilities = [

        {
            "risk": "Hardcoded Secret",
            "severity": "Critical",
            "file": "config/auth.js",
            "message": "Hardcoded API secret detected"
        },

        {
            "risk": "SQL Injection",
            "severity": "High",
            "file": "db/query.py",
            "message": "Unsafe SQL query concatenation detected"
        },

        {
            "risk": "Open API Access",
            "severity": "Medium",
            "file": "api/routes.js",
            "message": "Unauthenticated admin endpoint exposed"
        }
    ]

    total = random.randint(1, 3)

    for i in range(total):

        findings.append({

            "agent": "Security Agent",

            "timestamp": datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

            "risk": vulnerabilities[i]["risk"],

            "severity": vulnerabilities[i]["severity"],

            "file": vulnerabilities[i]["file"],

            "message": vulnerabilities[i]["message"],

            "status": "ACTIVE"
        })

    return findings