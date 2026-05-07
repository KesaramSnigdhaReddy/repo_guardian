import json
import os
from datetime import datetime

MEMORY_FILE = "developer_memory.json"

def memory_agent(developer, issue):

    memory = []

    if os.path.exists(MEMORY_FILE):

        with open(MEMORY_FILE, "r") as f:
            memory = json.load(f)

    found = False

    for item in memory:

        if (
            item["developer"] == developer
            and item["issue"] == issue
        ):

            item["count"] += 1

            item["last_seen"] = datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )

            found = True

    if not found:

        memory.append({

            "developer": developer,

            "issue": issue,

            "count": 1,

            "first_seen": datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

            "last_seen": datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        })

    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=4)

    return memory