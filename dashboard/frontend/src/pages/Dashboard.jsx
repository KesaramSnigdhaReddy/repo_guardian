import { useEffect, useState } from "react";
import { getAgentStatus } from "../api/client";
import HealthScoreCard from "../components/cards/HealthScoreCard";
import StatCard from "../components/cards/StatCard";
import AgentStatusPanel from "../components/AgentStatusPanel";
import TrendChart from "../components/charts/TrendChart";
import FindingsTable from "../components/tables/FindingsTable";

export default function Dashboard() {
  const [data, setData]         = useState(null);
  const [agents, setAgents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [scanning, setScanning] = useState(false);

  const fetchDashboard = () => {
    fetch("http://localhost:8000/api/dashboard")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => { setData(d); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
    const poll = () => getAgentStatus().then(setAgents).catch(() => {});
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, []);

  const handleScanHistory = () => {
    setScanning(true);
    fetch("http://localhost:8000/api/scan-history", { method: "POST" })
      .then(() => { setScanning(false); fetchDashboard(); })
      .catch(() => setScanning(false));
  };

  if (loading) return (
    <div style={{ color: "#8b949e", padding: "40px", fontSize: "14px" }}>
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div style={{ color: "#da3633", padding: "40px", fontSize: "14px" }}>
      ❌ Error: {error} — is the backend running on port 8000?
    </div>
  );

  if (!data) return (
    <div style={{ color: "#8b949e", padding: "40px" }}>No data returned.</div>
  );

  const S = {
    section: {
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: "6px",
      overflow: "hidden",
    },
    sectionHeader: {
      padding: "14px 20px",
      borderBottom: "1px solid #21262d",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#e6edf3",
    },
    btn: (color) => ({
      background: color === "green" ? "#238636" : "#21262d",
      border: `1px solid ${color === "green" ? "#2ea043" : "#30363d"}`,
      color: "white",
      padding: "6px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: "12px" }}>
        <HealthScoreCard score={data.health_score ?? 0} />
        <StatCard title="Open Findings" value={data.open_findings ?? 0} />
        <StatCard title="PRs Reviewed"  value={data.pr_count ?? 0} />
        <StatCard title="Active Agents" value={data.active_agents ?? 0} unit="/ 4" />
      </div>

      {/* Agent Status */}
      <div style={S.section}>
        <div style={S.sectionHeader}>
          <span style={S.sectionTitle}>Agent Status</span>
          <span style={{ fontSize: "11px", color: "#484f58" }}>live • polls every 3s</span>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <AgentStatusPanel agents={agents} />
        </div>
      </div>

      {/* Trend + Findings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "12px" }}>

        <div style={S.section}>
          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Score Trend</span>
            <span style={{ fontSize: "11px", color: "#484f58" }}>
              {(data.score_history || []).length} data points
            </span>
          </div>
          <div style={{ padding: "16px 8px 8px 8px" }}>
            <TrendChart data={data.score_history || []} />
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Recent Findings</span>
            <span style={{ fontSize: "11px", color: "#484f58" }}>
              {(data.findings || []).length} shown · {data.open_findings} total
            </span>
          </div>
          <FindingsTable findings={data.findings || []} />
        </div>

      </div>

      {/* Compliance */}
<div style={S.section}>
  <div style={S.sectionHeader}>
    <span style={S.sectionTitle}>Compliance & Security</span>
    <span style={{ fontSize: "11px", color: "#484f58" }}>one-click export</span>
  </div>
  <div style={{ padding: "16px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
    <button
      style={S.btn("green")}
      onClick={() => window.open("http://localhost:8000/api/compliance/soc2")}
    >
      📋 SOC 2 Report
    </button>
    <button
      style={S.btn()}
      onClick={() => window.open("http://localhost:8000/api/compliance/sbom")}
    >
      📦 SBOM Export
    </button>
    <button
      style={S.btn()}
      onClick={() => {
        setScanning(true);
        fetch("http://localhost:8000/api/scan-history", { method: "POST" })
          .then(r => r.json())
          .then(d => {
            setScanning(false);
            alert(`✅ Scan complete! Found ${d.findings} issues.`);
            fetchDashboard();
          })
          .catch(e => {
            setScanning(false);
            alert("❌ Scan failed — check backend");
          });
      }}
      disabled={scanning}
    >
      {scanning ? "⏳ Scanning..." : "🔍 Scan Git History"}
    </button>
    <button
      style={S.btn()}
      onClick={() => {
        fetchDashboard();
        alert("✅ Dashboard refreshed!");
      }}
    >
      🔄 Refresh
    </button>
  </div>
</div>

    </div>
  );
}