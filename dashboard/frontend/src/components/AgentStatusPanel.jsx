export default function AgentStatusPanel({ agents = [] }) {

  if (agents.length === 0) {
    return (
      <p
        style={{
          color: "#ff9d5c",
          fontSize: "13px",
        }}
      >
        No active security agents detected.
      </p>
    );
  }

  const statusConfig = {

    running: {
      color: "#ff8c42",
      glow: "0 0 14px rgba(255,140,66,0.55)",
      bg: "rgba(255,140,66,0.08)",
      border: "rgba(255,140,66,0.22)",
      icon: "⚡",
    },

    done: {
      color: "#ffb347",
      glow: "0 0 12px rgba(255,179,71,0.45)",
      bg: "rgba(255,179,71,0.08)",
      border: "rgba(255,179,71,0.22)",
      icon: "🛡️",
    },

    error: {
      color: "#ff5a1f",
      glow: "0 0 14px rgba(255,90,31,0.55)",
      bg: "rgba(255,90,31,0.08)",
      border: "rgba(255,90,31,0.22)",
      icon: "🚨",
    },

    idle: {
      color: "#6b7280",
      glow: "none",
      bg: "rgba(255,255,255,0.02)",
      border: "rgba(255,255,255,0.05)",
      icon: "○",
    },

  };

  return (

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "14px",
      }}
    >

      {agents.map((a) => {

        const cfg =
          statusConfig[a.status] || statusConfig.idle;

        return (

          <div
            key={a.name}
            style={{

              display: "flex",
              alignItems: "center",
              gap: "10px",

              background:
                "linear-gradient(145deg,#080808,#121212)",

              border: `1px solid ${cfg.border}`,

              borderRadius: "14px",

              padding: "12px 16px",

              minWidth: "210px",

              boxShadow:
                "0 0 18px rgba(0,0,0,0.45)",

              transition: "0.3s ease",
            }}
          >

            {/* Glow Dot */}

            <span
              style={{
                width: "10px",
                height: "10px",

                borderRadius: "50%",

                background: cfg.color,

                boxShadow: cfg.glow,

                display: "inline-block",
              }}
            />

            {/* Agent Info */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >

              <span
                style={{
                  color: "#f3f4f6",

                  fontFamily: "monospace",

                  fontSize: "13px",

                  fontWeight: "700",

                  letterSpacing: "0.3px",
                }}
              >
                {a.name}
              </span>

              <span
                style={{
                  color: cfg.color,

                  fontSize: "11px",

                  fontWeight: "700",

                  textTransform: "uppercase",

                  letterSpacing: "0.08em",
                }}
              >
                {cfg.icon} {a.status}
              </span>

            </div>

          </div>
        );
      })}

    </div>
  );
}