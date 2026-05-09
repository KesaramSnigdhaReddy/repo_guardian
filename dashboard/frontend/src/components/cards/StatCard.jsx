export default function StatCard({
  title,
  value,
  delta,
  unit
}) {

  const getAccent = () => {

    if (title?.toLowerCase().includes("finding")) {
      return "#ff5a1f";
    }

    if (title?.toLowerCase().includes("agent")) {
      return "#ff9d2e";
    }

    if (title?.toLowerCase().includes("pr")) {
      return "#ffb347";
    }

    return "#ff8c42";
  };

  const accent = getAccent();

  return (

    <div
      style={{
        background:
          "linear-gradient(145deg,#080808,#121212)",

        border:
          `1px solid ${accent}22`,

        borderRadius: "18px",

        padding: "22px 24px",

        position: "relative",

        overflow: "hidden",

        boxShadow:
          "0 0 18px rgba(0,0,0,0.45)",

        transition: "0.3s ease",
      }}
    >

      {/* Glow Background */}

      <div
        style={{
          position: "absolute",

          top: "-50px",
          right: "-50px",

          width: "140px",
          height: "140px",

          background: `${accent}12`,

          borderRadius: "50%",

          filter: "blur(40px)",
        }}
      />

      {/* Accent Line */}

      <div
        style={{
          position: "absolute",

          top: 0,
          left: 0,
          right: 0,

          height: "3px",

          background:
            `linear-gradient(90deg, ${accent}, transparent)`,

          boxShadow:
            `0 0 16px ${accent}66`,
        }}
      />

      {/* Title */}

      <div
        style={{
          fontSize: "11px",

          color: "#ffb066",

          textTransform: "uppercase",

          letterSpacing: "0.14em",

          marginBottom: "16px",

          fontWeight: "700",
        }}
      >
        {title}
      </div>

      {/* Value */}

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
        }}
      >

        <span
          style={{
            fontSize: "48px",

            fontWeight: "800",

            color: "#ffffff",

            lineHeight: 1,

            letterSpacing: "-1px",

            textShadow:
              `0 0 12px ${accent}22`,
          }}
        >
          {value ?? "—"}
        </span>

        {unit && (
          <span
            style={{
              fontSize: "14px",

              color: "#5e5e5e",

              fontWeight: "600",
            }}
          >
            {unit}
          </span>
        )}

      </div>

      {/* Delta */}

      {delta !== undefined && (

        <div
          style={{
            marginTop: "14px",

            display: "inline-flex",

            alignItems: "center",

            gap: "6px",

            background:
              delta >= 0
                ? "rgba(255,140,66,0.08)"
                : "rgba(255,90,31,0.08)",

            border:
              delta >= 0
                ? "1px solid rgba(255,140,66,0.18)"
                : "1px solid rgba(255,90,31,0.18)",

            borderRadius: "999px",

            padding: "6px 12px",
          }}
        >

          <span
            style={{
              color:
                delta >= 0
                  ? "#ff9d2e"
                  : "#ff5a1f",

              fontSize: "11px",

              fontWeight: "700",

              letterSpacing: "0.05em",
            }}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
            from last week
          </span>

        </div>
      )}

    </div>
  );
}