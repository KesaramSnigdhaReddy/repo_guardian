def repo_health_agent(findings):

    score = 100

    critical = 0
    high = 0
    medium = 0
    low = 0

    for finding in findings:

        severity = finding["severity"]

        if severity == "Critical":

            critical += 1
            score -= 15

        elif severity == "High":

            high += 1
            score -= 8

        elif severity == "Medium":

            medium += 1
            score -= 4

        elif severity == "Low":

            low += 1
            score -= 1

    return {

        "score": max(score, 0),

        "summary": {

            "critical": critical,

            "high": high,

            "medium": medium,

            "low": low
        }
    }