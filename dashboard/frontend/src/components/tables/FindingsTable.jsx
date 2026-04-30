const SEVERITY_CONFIG = {
  critical: { color: "#da3633", bg: "#da363318", label: "Critical" },
  high:     { color: "#e3b341", bg: "#e3b34118", label: "High" },
  medium:   { color: "#d29922", bg: "#d2992218", label: "Medium" },
  low:      { color: "#2ea043", bg: "#2ea04318", label: "Low" },
};

export default function FindingsTable({ findings = [] }) {
  if (findings.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#484f58", fontSize: "13px" }}>
        No findings detected
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #21262d" }}>
            {["Severity", "Agent", "File", "Message"].map(h => (
              <th key={h} style={{
                textAlign: "left",
                padding: "8px 16px",
                color: "#8b949e",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => {
            const cfg = SEVERITY_CONFIG[f.severity] || { color: "#8b949e", bg: "#8b949e18", label: f.severity };
            return (
              <tr key={i} style={{
                borderBottom: "1px solid #161b22",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#161b22"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "10px 16px" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: cfg.bg,
                    color: cfg.color,
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    border: `1px solid ${cfg.color}30`,
                  }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg.color }} />
                    {cfg.label}
                  </span>
                </td>
                <td style={{ padding: "10px 16px", color: "#8b949e", fontFamily: "monospace", fontSize: "12px" }}>{f.agent}</td>
                <td style={{ padding: "10px 16px", color: "#58a6ff", fontFamily: "monospace", fontSize: "12px" }}>{f.file}</td>
                <td style={{ padding: "10px 16px", color: "#e6edf3" }}>{f.message}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}