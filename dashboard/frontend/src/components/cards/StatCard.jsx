export default function StatCard({ title, value, delta, unit }) {
  return (
    <div style={{
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: "6px",
      padding: "20px 24px",
    }}>
      <div style={{ fontSize: "11px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span style={{ fontSize: "36px", fontWeight: 300, color: "#e6edf3", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {value ?? "—"}
        </span>
        {unit && <span style={{ fontSize: "13px", color: "#484f58" }}>{unit}</span>}
      </div>
      {delta !== undefined && (
        <div style={{ marginTop: "8px", fontSize: "11px", color: delta >= 0 ? "#2ea043" : "#da3633" }}>
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}% from last week
        </div>
      )}
    </div>
  );
}