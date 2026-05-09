import { useState } from "react";

const SEVERITY_CONFIG = {

  critical: {
    color: "#ff5a1f",
    bg: "rgba(255,90,31,0.10)",
    border: "rgba(255,90,31,0.28)",
    glow: "0 0 12px rgba(255,90,31,0.35)",
    label: "Critical",
  },

  high: {
    color: "#ff8c42",
    bg: "rgba(255,140,66,0.10)",
    border: "rgba(255,140,66,0.24)",
    glow: "0 0 10px rgba(255,140,66,0.30)",
    label: "High",
  },

  medium: {
    color: "#ffb347",
    bg: "rgba(255,179,71,0.10)",
    border: "rgba(255,179,71,0.24)",
    glow: "0 0 8px rgba(255,179,71,0.25)",
    label: "Medium",
  },

  low: {
    color: "#ffcf85",
    bg: "rgba(255,207,133,0.10)",
    border: "rgba(255,207,133,0.24)",
    glow: "0 0 6px rgba(255,207,133,0.20)",
    label: "Low",
  },

};

// 🔥 Business-readable affected area
const getArea = (file = "") => {
  const f = file.toLowerCase();

  if (f.includes("auth")) return "Authentication System";
  if (f.includes("config")) return "Configuration Layer";
  if (f.includes("db")) return "Database";
  if (f.includes("api")) return "API Gateway";
  if (f.includes("security")) return "Security Module";
  if (f.includes("agent")) return "AI Agent Engine";

  return "Core System";
};

// 🔥 Human-readable risk type
const getRiskType = (file = "") => {
  const f = file.toLowerCase();

  if (f.includes("auth")) return "Authentication Risk";
  if (f.includes("config")) return "Misconfiguration";
  if (f.includes("db")) return "Data Exposure";
  if (f.includes("api")) return "API Vulnerability";
  if (f.includes("security")) return "Security Failure";
  if (f.includes("agent")) return "AI Logic Risk";

  return "General Risk";
};

// 🔥 Better descriptions
const getDescription = (msg = "", file = "") => {
  const f = file.toLowerCase();

  if (f.includes("auth"))
    return "Login system can be bypassed, allowing unauthorized users to access accounts.";

  if (f.includes("config"))
    return "System configuration may expose sensitive settings or internal secrets.";

  if (f.includes("db"))
    return "Database protections are weak and could expose customer records.";

  if (f.includes("api"))
    return "API endpoints may allow unauthorized requests or abuse.";

  if (f.includes("security"))
    return "Core security protections are not properly enforced.";

  if (f.includes("agent"))
    return "AI agent execution logic may perform unsafe automated actions.";

  return "Unexpected system behavior detected that could lead to security vulnerabilities.";
};

export default function FindingsTable({ findings = [] }) {

  const [simulation, setSimulation] = useState(null);
  const [fixData, setFixData] = useState(null);

  // 🔥 Attack Simulation
  const handleSimulate = async (finding) => {

    try {

      const res = await fetch(
        "http://localhost:8000/api/simulate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: finding.file || "generic"
          })
        }
      );

      const data = await res.json();

      setSimulation(data);

    } catch (e) {

      console.error(e);

    }
  };

  // 🔥 AutoFix
  const handleAutoFix = async (finding) => {

    try {

      const res = await fetch(
        "http://localhost:8000/api/autofix",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: finding.file || "generic"
          })
        }
      );

      const data = await res.json();

      setFixData(data);

    } catch (e) {

      console.error(e);

    }
  };

  // 🔥 Empty state
  if (findings.length === 0) {
    return (
      <div
        style={{
          padding: "36px",
          textAlign: "center",
          color: "#ffb066",
          background:
            "linear-gradient(145deg,#080808,#101010)",
          borderRadius: "18px",
          border:
            "1px solid rgba(255,120,40,0.12)",
        }}
      >
        No active threats detected
      </div>
    );
  }

  return (

    <div>

      {/* 🔥 Risk Banner */}

      <div
        style={{
          marginBottom: "18px",

          background:
            "linear-gradient(145deg,#120707,#1a0d08)",

          border:
            "1px solid rgba(255,90,31,0.22)",

          borderRadius: "14px",

          padding: "14px 18px",

          color: "#ff8c42",

          fontSize: "13px",

          fontWeight: "700",

          letterSpacing: "0.04em",

          boxShadow:
            "0 0 20px rgba(255,90,31,0.08)",
        }}
      >
        ⚠️ ACTIVE THREAT INTELLIGENCE • {findings.length} RISKS DETECTED
      </div>

      {/* 🔥 Table */}

      <div
        style={{
          overflowX: "auto",

          background:
            "linear-gradient(145deg,#070707,#101010)",

          border:
            "1px solid rgba(255,120,40,0.12)",

          borderRadius: "18px",

          boxShadow:
            "0 0 24px rgba(0,0,0,0.45)",
        }}
      >

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px"
          }}
        >

          <thead>

            <tr
              style={{
                borderBottom:
                  "1px solid rgba(255,120,40,0.14)",

                background:
                  "linear-gradient(90deg, rgba(255,120,40,0.06), transparent)",
              }}
            >

              {[
                "Severity",
                "Risk Type",
                "Affected Area",
                "Description",
                "Action"
              ].map(h => (

                <th
                  key={h}
                  style={{
                    textAlign: "left",

                    padding: "14px 18px",

                    color: "#ffb066",

                    fontSize: "11px",

                    fontWeight: 700,

                    textTransform: "uppercase",

                    letterSpacing: "0.08em",
                  }}
                >
                  {h}
                </th>
              ))}

            </tr>

          </thead>

          <tbody>

            {findings.map((f, i) => {

              const cfg =
                SEVERITY_CONFIG[f.severity] || {

                  color: "#ffb066",

                  bg: "rgba(255,120,40,0.08)",

                  border: "rgba(255,120,40,0.18)",

                  glow: "none",

                  label: f.severity
                };

              return (

                <tr
                  key={i}
                  style={{
                    borderBottom:
                      "1px solid rgba(255,120,40,0.08)"
                  }}
                >

                  {/* Severity */}

                  <td style={{ padding: "14px 18px" }}>

                    <span
                      style={{
                        background: cfg.bg,

                        color: cfg.color,

                        padding: "6px 12px",

                        borderRadius: "999px",

                        fontSize: "11px",

                        fontWeight: "700",

                        border:
                          `1px solid ${cfg.border}`,

                        boxShadow: cfg.glow,

                        letterSpacing: "0.04em",
                      }}
                    >
                      {cfg.label}

                      {cfg.label === "Critical" && " 🔥"}
                      {cfg.label === "High" && " ⚠️"}

                    </span>

                  </td>

                  {/* Risk Type */}

                  <td
                    style={{
                      padding: "14px 18px",
                      color: "#ff9d2e",
                      fontWeight: "600",
                    }}
                  >
                    {getRiskType(f.file)}
                  </td>

                  {/* Area */}

                  <td
                    style={{
                      padding: "14px 18px",
                      color: "#9ca3af"
                    }}
                  >
                    {getArea(f.file)}
                  </td>

                  {/* Description */}

                  <td
                    style={{
                      padding: "14px 18px",

                      color: "#f3f4f6",

                      maxWidth: "350px",

                      lineHeight: "1.7",
                    }}
                  >
                    {getDescription(f.message, f.file)}
                  </td>

                  {/* Actions */}

                  <td
                    style={{
                      padding: "14px 18px",

                      display: "flex",

                      flexDirection: "column",

                      gap: "8px"
                    }}
                  >

                    {/* Simulate */}

                    <button
                      onClick={() => handleSimulate(f)}
                      style={{
                        background:
                          "linear-gradient(135deg,#ff5a1f,#ff8c42)",

                        color: "white",

                        border: "none",

                        padding: "8px 12px",

                        borderRadius: "10px",

                        cursor: "pointer",

                        fontSize: "11px",

                        fontWeight: "700",

                        boxShadow:
                          "0 0 14px rgba(255,90,31,0.25)",
                      }}
                    >
                      🚨 Simulate Attack
                    </button>

                    {/* Auto Fix */}

                    <button
                      onClick={() => handleAutoFix(f)}
                      style={{
                        background:
                          "linear-gradient(135deg,#ff9d2e,#ffb347)",

                        color: "#111",

                        border: "none",

                        padding: "8px 12px",

                        borderRadius: "10px",

                        cursor: "pointer",

                        fontSize: "11px",

                        fontWeight: "700",

                        boxShadow:
                          "0 0 14px rgba(255,179,71,0.22)",
                      }}
                    >
                      🛠️ Auto Fix
                    </button>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}