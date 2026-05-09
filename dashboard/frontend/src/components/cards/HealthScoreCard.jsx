export default function HealthScoreCard({ score }) {
  const color =
    score > 80
      ? "#ff7a00"
      : score > 50
      ? "#ff9d2e"
      : "#ff3c00";

  const glow =
    score > 80
      ? "0 0 25px rgba(255,122,0,0.35)"
      : score > 50
      ? "0 0 20px rgba(255,157,46,0.30)"
      : "0 0 25px rgba(255,60,0,0.35)";

  const label =
    score > 80
      ? "PROTECTED"
      : score > 50
      ? "AT RISK"
      : "CRITICAL";

  const pct = score;

  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, #0a0a0a 0%, #111111 55%, #161616 100%)",
        border: "1px solid rgba(255,122,0,0.18)",
        borderRadius: "18px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow:
          "0 0 0 1px rgba(255,122,0,0.08), 0 10px 40px rgba(0,0,0,0.65)",
        transition: "0.3s ease",
      }}
    >
      {/* Neon top line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${color} ${pct}%, #1a1a1a ${pct}%)`,
          boxShadow: glow,
        }}
      />

      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "180px",
          height: "180px",
          background: "rgba(255,122,0,0.10)",
          borderRadius: "50%",
          filter: "blur(50px)",
        }}
      />

      <div
        style={{
          fontSize: "11px",
          color: "#ffb066",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          marginBottom: "16px",
          fontWeight: 700,
        }}
      >
        Security Health
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color,
            lineHeight: 1,
            textShadow: glow,
            letterSpacing: "-2px",
          }}
        >
          {score}
        </span>

        <span
          style={{
            fontSize: "22px",
            color: "#5e5e5e",
            fontWeight: 500,
          }}
        >
          /100
        </span>
      </div>

      {/* Progress */}
      <div
        style={{
          marginTop: "20px",
          height: "8px",
          width: "100%",
          background: "#1b1b1b",
          borderRadius: "999px",
          overflow: "hidden",
          border: "1px solid rgba(255,122,0,0.08)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, #ffb347)`,
            borderRadius: "999px",
            boxShadow: glow,
          }}
        />
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: "18px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,122,0,0.08)",
          border: "1px solid rgba(255,122,0,0.22)",
          borderRadius: "999px",
          padding: "6px 14px",
          backdropFilter: "blur(6px)",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: color,
            boxShadow: glow,
            display: "inline-block",
          }}
        />

        <span
          style={{
            fontSize: "11px",
            color,
            fontWeight: 800,
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}