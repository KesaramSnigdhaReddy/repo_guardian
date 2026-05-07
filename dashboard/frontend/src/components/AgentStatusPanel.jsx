export default function AgentStatusPanel({ agents = {} }) {

  return (

    <div
      style={{
        background: "#111827",
        padding: "20px",
        borderRadius: "16px",
        color: "white",
        marginTop: "20px",
        border: "1px solid #1e293b"
      }}
    >

      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px"
        }}
      >
        Autonomous AI Agents
      </h2>

      <div
        style={{
          display: "grid",
          gap: "16px"
        }}
      >

        {Object.entries(agents || {}).map(([name, status]) => (

          <div
            key={name}
            style={{
              background: "#0f172a",
              padding: "16px",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >

            <div>

              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "6px"
                }}
              >
                {name}
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "14px"
                }}
              >
                {status}
              </div>

            </div>

            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                background:
                  status === "ACTIVE"
                    ? "#22c55e"
                    : "#64748b"
              }}
            />

          </div>

        ))}

      </div>

    </div>

  );
}