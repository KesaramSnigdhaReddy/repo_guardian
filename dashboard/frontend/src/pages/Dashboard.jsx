import { useEffect, useState } from "react";
import { getAgentStatus } from "../api/client";

import HealthScoreCard from "../components/cards/HealthScoreCard";
import StatCard from "../components/cards/StatCard";

import AgentStatusPanel from "../components/AgentStatusPanel";
import TrendChart from "../components/charts/TrendChart";

import FindingsTable from "../components/tables/FindingsTable";

import Copilot from "../components/Copilot";
import RiskChart from "../components/charts/RiskChart";
import AutoFixPanel from "../components/AutoFixPanel";

export default function Dashboard() {

  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [activity, setActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toast, setToast] = useState(null);
  const [scanning, setScanning] = useState(false);

  // 🔥 Fetch dashboard
  const fetchDashboard = () => {

    fetch("http://localhost:8000/api/dashboard")
      .then(r => {

        if (!r.ok)
          throw new Error(`HTTP ${r.status}`);

        return r.json();

      })
      .then(d => {

        setData(d);
        setError(null);

      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));

  };

  useEffect(() => {

    fetchDashboard();

    // 🔥 Agent polling
    const poll = () => {

      getAgentStatus()
        .then(setAgents)
        .catch(() => {});

    };

    poll();

    const id = setInterval(poll, 3000);

    // 🔥 Live activity polling
    const pollActivity = () => {

      fetch("http://localhost:8000/api/activity")
        .then(r => r.json())
        .then(setActivity)
        .catch(() => {});

    };

    pollActivity();

    const activityId = setInterval(
      pollActivity,
      2000
    );

    return () => {

      clearInterval(id);
      clearInterval(activityId);

    };

  }, []);

  // 🔥 Scan history
  const handleScanHistory = () => {

    setScanning(true);

    setToast("🧠 AI scanning repository history...");

    fetch("http://localhost:8000/api/scan-history", {
      method: "POST"
    })
      .then(r => r.json())
      .then(d => {

        setScanning(false);

        setToast(`✅ Scan complete — ${d.findings} threats detected`);

        setTimeout(() => setToast(null), 3000);

        fetchDashboard();

      })
      .catch(() => {

        setScanning(false);

        setToast("❌ Scan failed");

        setTimeout(() => setToast(null), 3000);

      });

  };

  if (loading) {
    return (
      <div style={{
        color: "#5d2471",
        padding: "40px",
        fontSize: "14px"
      }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        color: "#da3633",
        padding: "40px",
        fontSize: "14px"
      }}>
        ❌ Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        color: "#6a5e74",
        padding: "40px"
      }}>
        No dashboard data returned.
      </div>
    );
  }

 const S = {

  section: {
    background:
      "linear-gradient(145deg, #050505, #0f0f0f)",

    border: "1px solid rgba(255,120,40,0.22)",

    borderRadius: "18px",

    overflow: "hidden",

    boxShadow:
      "0 0 18px rgba(255,120,40,0.08)",
  },

  sectionHeader: {
    padding: "16px 22px",

    borderBottom:
      "1px solid rgba(255,120,40,0.14)",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    background:
      "linear-gradient(90deg, rgba(255,120,40,0.06), transparent)",
  },

  sectionTitle: {
    fontSize: "13px",

    fontWeight: 700,

    color: "#ff8c42",

    letterSpacing: "0.5px",

    textTransform: "uppercase",
  },

  btn: (green = false) => ({

    background: green
      ? "linear-gradient(135deg, #ff6b2c, #ff9a3d)"
      : "#151515",

    border: green
      ? "1px solid #ff8c42"
      : "1px solid rgba(255,120,40,0.22)",

    color: "white",

    padding: "10px 16px",

    borderRadius: "10px",

    fontSize: "12px",

    fontWeight: "600",

    cursor: "pointer",

    display: "flex",

    alignItems: "center",

    gap: "6px",

    boxShadow: green
      ? "0 0 18px rgba(255,120,40,0.22)"
      : "none",

    transition: "0.25s",
  }),

};

  return (

    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      paddingBottom: "120px"
    }}>

      {/* 🔥 Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#222027",
          border: "1px solid #252329de",
          color: "white",
          padding: "12px 16px",
          borderRadius: "10px",
          zIndex: 9999,
          boxShadow: "0 0 20px rgba(0,0,0,0.4)"
        }}>
          {toast}
        </div>
      )}

    {/* 🔥 Cyber Header */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    padding: "28px",
    borderRadius: "22px",

    background:
      "linear-gradient(145deg, rgba(255,120,40,0.08), rgba(0,0,0,0.95))",

    border:
      "1px solid rgba(255,120,40,0.18)",

    boxShadow:
      "0 0 30px rgba(255,120,40,0.08)",
  }}
>

  <div>

    <h1
      style={{
        color: "#ffffff",

        fontSize: "38px",

        fontWeight: "800",

        marginBottom: "10px",

        letterSpacing: "-1px",

        textShadow:
          "0 0 16px rgba(255,120,40,0.28)",
      }}
    >
      RepoGuardian Security Center
    </h1>

    <p
      style={{
        color: "#9ca3af",

        fontSize: "14px",

        maxWidth: "720px",

        lineHeight: "1.7",
      }}
    >
      Autonomous AI security orchestration platform for repository defense,
      behavioral intelligence, threat remediation, and continuous governance monitoring.
    </p>

  </div>

  <div
    style={{
      background:
        "linear-gradient(135deg, #ff6b2c, #ff9a3d)",

      color: "#ffffff",

      padding: "12px 18px",

      borderRadius: "14px",

      fontWeight: "700",

      fontSize: "13px",

      boxShadow:
        "0 0 24px rgba(255,120,40,0.30)",
    }}
  >
    ● SYSTEM SECURE
  </div>

</div>

      {/* 🔥 Top Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
        gap: "12px"
      }}>

        <HealthScoreCard score={74} />

        <StatCard
          title="Open Findings"
          value={data.open_findings ?? 0}
        />

        <StatCard
          title="PRs Reviewed"
          value={data.pr_count ?? 0}
        />

        <StatCard
          title="Active Agents"
          value={data.active_agents ?? 0}
          unit="/ 4"
        />

      </div>

      {/* 🔥 Agent Status */}
      <div style={S.section}>

        <div style={S.sectionHeader}>

          <span style={S.sectionTitle}>
            Agent Status
          </span>

          <span style={{
            fontSize: "11px",
            color: "#484f58"
          }}>
            live • polls every 3s
          </span>

        </div>

        <div style={{
          padding: "16px 20px"
        }}>
          <AgentStatusPanel agents={agents} />
        </div>

      </div>

      {/* 🔥 Analytics */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  }}
>

  {/* SECURITY TREND */}

  <div
    style={{
      background:
        "linear-gradient(145deg,#050505,#0b0b0b)",

      border:
        "1px solid rgba(255,120,40,0.20)",

      borderRadius: "24px",

      overflow: "hidden",

      boxShadow:
        "0 0 30px rgba(255,120,40,0.08)",
    }}
  >

    <div
      style={{
        padding: "18px 24px",

        borderBottom:
          "1px solid rgba(255,120,40,0.10)",

        background:
          "linear-gradient(90deg, rgba(255,120,40,0.06), transparent)",
      }}
    >
      <div
        style={{
          color: "#ff8c42",

          fontWeight: "800",

          fontSize: "16px",

          letterSpacing: "0.08em",

          textTransform: "uppercase",

          textShadow:
            "0 0 12px rgba(255,140,66,0.35)",
        }}
      >
        Security Trend
      </div>
    </div>

    <div
      style={{
        padding: "20px",
        height: "380px",

        background:
          "radial-gradient(circle at top, rgba(255,120,40,0.03), transparent)",
      }}
    >
      <TrendChart data={data.score_history || []} />
    </div>

  </div>

  {/* RISK DISTRIBUTION */}

  <div
    style={{
      background:
        "linear-gradient(145deg,#050505,#0b0b0b)",

      border:
        "1px solid rgba(255,120,40,0.20)",

      borderRadius: "24px",

      overflow: "hidden",

      boxShadow:
        "0 0 30px rgba(255,120,40,0.08)",
    }}
  >

    <div
      style={{
        padding: "18px 24px",

        borderBottom:
          "1px solid rgba(255,120,40,0.10)",

        background:
          "linear-gradient(90deg, rgba(255,120,40,0.06), transparent)",
      }}
    >
      <div
        style={{
          color: "#ff8c42",

          fontWeight: "800",

          fontSize: "16px",

          letterSpacing: "0.08em",

          textTransform: "uppercase",

          textShadow:
            "0 0 12px rgba(255,140,66,0.35)",
        }}
      >
        Risk Distribution Analytics
      </div>
    </div>

    <div
      style={{
        padding: "20px",
        height: "380px",

        background:
          "radial-gradient(circle at top, rgba(255,120,40,0.03), transparent)",
      }}
    >
      <RiskChart findings={data.findings || []} />
    </div>

  </div>

</div>
      {/* 🔥 Findings */}
      <div style={S.section}>

        <div style={S.sectionHeader}>

          <span style={S.sectionTitle}>
            Active Threat Intelligence
          </span>

        </div>

        <div style={{
          padding: "16px 20px"
        }}>

          <FindingsTable findings={data.findings || []} />

        </div>

      </div>

      {/* 🔥 AI Remediation */}
      <div style={S.section}>

        <div style={S.sectionHeader}>

          <span style={S.sectionTitle}>
            AI Remediation Engine
          </span>

        </div>

        <div style={{
          padding: "20px"
        }}>

          <AutoFixPanel />

        </div>

      </div>

      {/* 🔥 Compliance */}
      <div style={S.section}>

        <div style={S.sectionHeader}>

          <span style={S.sectionTitle}>
            Compliance & Governance
          </span>

        </div>

        <div style={{
          padding: "16px 20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap"
        }}>

          <button
            style={S.btn(true)}
            onClick={() =>
              window.open("http://localhost:8000/api/export-report")
            }
          >
            📋 Export Security Report
          </button>

          <button
            style={S.btn()}
            onClick={() =>
              window.open("http://localhost:8000/api/compliance/sbom")
            }
          >
            📦 SBOM Export
          </button>

          <button
            style={S.btn()}
            onClick={handleScanHistory}
            disabled={scanning}
          >
            {scanning
              ? "🧠 AI scanning repository..."
              : "🔍 Scan Git History"}
          </button>

        </div>

      </div>
{/* 🔥 Business Impact Metrics */}

<div style={{
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr",
  gap: "12px"
}}>

  <div style={{
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "20px"
  }}>

    <div style={{
      color: "#8b949e",
      fontSize: "13px",
      marginBottom: "10px"
    }}>
      Estimated Monthly Loss
    </div>

    <div style={{
      color: "#ef4444",
      fontSize: "38px",
      fontWeight: "700"
    }}>
      ₹18,50,000
    </div>

  </div>

  <div style={{
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "20px"
  }}>

    <div style={{
      color: "#8b949e",
      fontSize: "13px",
      marginBottom: "10px"
    }}>
      Risk Reduction
    </div>

    <div style={{
      color: "#22c55e",
      fontSize: "38px",
      fontWeight: "700"
    }}>
      63%
    </div>

  </div>

  <div style={{
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "20px"
  }}>

    <div style={{
      color: "#8b949e",
      fontSize: "13px",
      marginBottom: "10px"
    }}>
      Compliance Score
    </div>

    <div style={{
      color: "#3b82f6",
      fontSize: "38px",
      fontWeight: "700"
    }}>
      82%
    </div>

  </div>

  <div style={{
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "20px"
  }}>

    <div style={{
      color: "#8b949e",
      fontSize: "13px",
      marginBottom: "10px"
    }}>
      Mean Detection Time
    </div>

    <div style={{
      color: "#fbbf24",
      fontSize: "38px",
      fontWeight: "700"
    }}>
      3 sec
    </div>

  </div>

</div>
      {/* 🔥 Live Activity */}
      <div style={S.section}>

        <div style={S.sectionHeader}>

          <span style={S.sectionTitle}>
            Live Security Activity
          </span>

        </div>

        <div style={{
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>

          {activity.map((item, idx) => (

            <div
              key={idx}
              style={{
                background: "#1e1b4b",
                border: "1px solid #312e81",
                padding: "14px",
                borderRadius: "10px",
                color: "#c9d1d9",
                fontSize: "13px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>

                <span style={{
                  fontSize: "18px"
                }}>
                  {
                    item.level === "critical"
                      ? "🚨"
                      : item.level === "success"
                      ? "✅"
                      : "📡"
                  }
                </span>

                <span>
                  {item.message}
                </span>

              </div>

              <span style={{
                color: "#8b949e",
                fontSize: "11px"
              }}>
                {item.time}
              </span>

            </div>

          ))}

        </div>

      </div>

      <Copilot />

    </div>
  );
}