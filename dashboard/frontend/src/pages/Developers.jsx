import { useEffect, useState } from "react";

export default function Developers() {

  const [developers, setDevelopers] = useState([]);

  useEffect(() => {

    fetch("http://localhost:8000/api/developers")
      .then((r) => r.json())
      .then(setDevelopers)
      .catch(console.error);

  }, []);

  return (

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "28px",
      }}
    >

      {/* Header */}

      <div
        style={{
          background:
            "linear-gradient(145deg, rgba(255,120,40,0.08), rgba(0,0,0,0.95))",

          border:
            "1px solid rgba(255,140,66,0.16)",

          borderRadius: "24px",

          padding: "32px",

          boxShadow:
            "0 0 40px rgba(255,120,40,0.08)",
        }}
      >

        <h1
          style={{
            color: "#ffffff",

            fontSize: "38px",

            fontWeight: "800",

            marginBottom: "12px",

            letterSpacing: "-1px",

            textShadow:
              "0 0 16px rgba(255,140,66,0.20)",
          }}
        >
          Developer Security Intelligence
        </h1>

        <div
          style={{
            color: "#b6b6b6",

            fontSize: "15px",

            lineHeight: "1.8",

            maxWidth: "850px",
          }}
        >
          AI-powered behavioral cyber risk engine monitoring
          contributor patterns, recurring security mistakes,
          remediation consistency, trust posture, and
          repository governance behavior.
        </div>

      </div>

      {/* Developer Cards */}

      {developers.map((dev, i) => (

        <div
          key={i}
          style={{
            background:
              "linear-gradient(145deg,#070707,#121212)",

            border:
              "1px solid rgba(255,140,66,0.14)",

            borderRadius: "24px",

            padding: "30px",

            boxShadow:
              "0 0 32px rgba(0,0,0,0.45)",

            overflow: "hidden",

            position: "relative",
          }}
        >

          {/* Glow */}

          <div
            style={{
              position: "absolute",

              top: "-80px",
              right: "-80px",

              width: "180px",
              height: "180px",

              background:
                "rgba(255,140,66,0.08)",

              borderRadius: "50%",

              filter: "blur(50px)",
            }}
          />

          {/* Header */}

          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

              marginBottom: "28px",
            }}
          >

            {/* Left */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "18px",
              }}
            >

              {/* Avatar */}

              <div
                style={{
                  width: "72px",
                  height: "72px",

                  borderRadius: "50%",

                  background:
                    "linear-gradient(135deg,#ff7a00,#ffb347)",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  color: "white",

                  fontSize: "28px",

                  fontWeight: "800",

                  boxShadow:
                    "0 0 24px rgba(255,140,66,0.28)",
                }}
              >
                {dev.name?.charAt(0)?.toUpperCase()}
              </div>

              {/* Info */}

              <div>

                <div
                  style={{
                    color: "#ffffff",

                    fontSize: "28px",

                    fontWeight: "800",

                    letterSpacing: "-0.5px",
                  }}
                >
                  {dev.name}
                </div>

                <div
                  style={{
                    color: "#9ca3af",

                    marginTop: "6px",

                    fontSize: "14px",
                  }}
                >
                  Repository Contributor • Behavioral Analysis Active
                </div>

              </div>

            </div>

            {/* Risk */}

            <div
              style={{
                textAlign: "right",
              }}
            >

              <div
                style={{
                  color: "#9ca3af",

                  fontSize: "13px",

                  textTransform: "uppercase",

                  letterSpacing: "0.08em",
                }}
              >
                Behavioral Risk
              </div>

              <div
                style={{
                  color:
                    dev.risk === "high"
                      ? "#ff5a1f"
                      : dev.risk === "medium"
                      ? "#ff9d2e"
                      : "#ffb347",

                  fontSize: "30px",

                  fontWeight: "800",

                  marginTop: "8px",

                  textShadow:
                    dev.risk === "high"
                      ? "0 0 16px rgba(255,90,31,0.45)"
                      : "0 0 16px rgba(255,157,46,0.35)",
                }}
              >
                {dev.risk.toUpperCase()}
              </div>

            </div>

          </div>

          {/* Analytics */}

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",

              gap: "18px",
            }}
          >

            <Card
              title="Security Health"
              value={`${dev.health}/100`}
              color="#ffb347"
            />

            <Card
              title="Top Recurring Issue"
              value={dev.top_issue}
              color="#ff7a00"
            />

            <Card
              title="Repeated Mistakes"
              value={dev.repeated}
              color="#ff9d2e"
            />

            <Card
              title="Trend"
              value={dev.trend}
              color="#ffb347"
            />

            <Card
              title="Last 5 Scores"
              value={dev.scores}
              color="#ffd27a"
            />

            <Card
              title="Trust Score"
              value={`${dev.trust}%`}
              color="#ffffff"
            />

          </div>

        </div>

      ))}

    </div>
  );
}

function Card({ title, value, color }) {

  return (

    <div
      style={{
        background:
          "linear-gradient(145deg,#0a0a0a,#151515)",

        border:
          "1px solid rgba(255,140,66,0.10)",

        borderRadius: "18px",

        padding: "22px",

        boxShadow:
          "0 0 18px rgba(0,0,0,0.35)",

        position: "relative",

        overflow: "hidden",
      }}
    >

      {/* Glow */}

      <div
        style={{
          position: "absolute",

          top: "-30px",
          right: "-30px",

          width: "100px",
          height: "100px",

          background:
            "rgba(255,140,66,0.05)",

          borderRadius: "50%",

          filter: "blur(30px)",
        }}
      />

      <div
        style={{
          color: "#9ca3af",

          fontSize: "12px",

          marginBottom: "14px",

          textTransform: "uppercase",

          letterSpacing: "0.08em",

          fontWeight: "700",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color,

          fontSize: "28px",

          fontWeight: "800",

          lineHeight: "1.4",

          textShadow:
            "0 0 12px rgba(255,140,66,0.12)",
        }}
      >
        {value}
      </div>

    </div>
  );
}