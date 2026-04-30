export default function HealthScoreCard({ score }) {
  const color = score > 80 ? "#2ea043" : score > 50 ? "#d29922" : "#da3633";
  const label = score > 80 ? "Healthy" : score > 50 ? "At Risk" : "Critical";
  const pct = score;

  return (
    <div style={{
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: "6px",
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle accent bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, ${color} ${pct}%, #21262d ${pct}%)`,
      }} />

      <div style={{ fontSize: "11px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
        Security Health
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "42px", fontWeight: 300, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {score}
        </span>
        <span style={{ fontSize: "18px", color: "#484f58", fontWeight: 300 }}>/100</span>
      </div>

      <div style={{
        marginTop: "10px",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: "12px",
        padding: "2px 8px",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }} />
        <span style={{ fontSize: "11px", color, fontWeight: 600 }}>{label}</span>
      </div>
    </div>
  );
}