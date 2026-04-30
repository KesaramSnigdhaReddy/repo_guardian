import { useEffect, useState } from "react";
import { getDashboard } from "../api/client";
import FindingsTable from "../components/tables/FindingsTable";

export default function Findings() {
  const [findings, setFindings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [severity, setSeverity] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((data) => {
        const allFindings = data.findings || [];
        setFindings(allFindings);
        setFiltered(allFindings);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (severity === "all") {
      setFiltered(findings);
    } else {
      setFiltered(findings.filter((f) => f.severity === severity));
    }
  }, [severity, findings]);

  if (loading) {
    return <div className="text-gray-400">Loading findings...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* 🔥 Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">All Findings</h1>

        {/* Filter */}
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="bg-gray-900 border border-gray-700 px-3 py-2 rounded text-sm"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* 📊 Table */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <FindingsTable findings={filtered} />
      </div>
    </div>
  );
}