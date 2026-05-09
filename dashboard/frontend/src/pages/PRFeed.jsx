import { useEffect, useState } from "react";
import { getPRs } from "../api/client";
import PRCard from "../components/cards/PRCard";

export default function PRFeed() {

  const [prs, setPRs] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getPRs()
      .then(setPRs)
      .catch(console.error)
      .finally(() => setLoading(false));

  }, []);

  // 🔥 Loading

  if (loading) {

    return (

      <div
        style={{
          minHeight: "70vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >

        <div
          style={{
            background:
              "linear-gradient(145deg,#070707,#121212)",

            border:
              "1px solid rgba(255,140,66,0.14)",

            borderRadius: "22px",

            padding: "40px",

            textAlign: "center",

            boxShadow:
              "0 0 30px rgba(0,0,0,0.45)",
          }}
        >

          <div
            style={{
              width: "70px",
              height: "70px",

              margin: "0 auto 20px auto",

              borderRadius: "50%",

              border:
                "3px solid rgba(255,140,66,0.15)",

              borderTop:
                "3px solid #ff9d2e",

              animation:
                "spin 1s linear infinite",
            }}
          />

          <div
            style={{
              color: "#ffb066",

              fontSize: "16px",

              fontWeight: "700",

              letterSpacing: "0.05em",
            }}
          >
            Loading PR Security Feed...
          </div>

          <style>
            {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
            `}
          </style>

        </div>

      </div>
    );
  }

  // 🔥 Empty

  if (!prs.length) {

    return (

      <div
        style={{
          minHeight: "60vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >

        <div
          style={{
            background:
              "linear-gradient(145deg,#070707,#121212)",

            border:
              "1px solid rgba(255,140,66,0.12)",

            borderRadius: "24px",

            padding: "42px",

            textAlign: "center",

            boxShadow:
              "0 0 30px rgba(0,0,0,0.45)",
          }}
        >

          <div
            style={{
              fontSize: "54px",

              marginBottom: "14px",
            }}
          >
            📂
          </div>

          <div
            style={{
              color: "#ffffff",

              fontSize: "22px",

              fontWeight: "800",

              marginBottom: "10px",
            }}
          >
            No Pull Requests Found
          </div>

          <div
            style={{
              color: "#9ca3af",

              fontSize: "14px",

              lineHeight: "1.8",

              maxWidth: "420px",
            }}
          >
            RepoGuardian could not detect any pull request
            security reviews in the connected repository.
          </div>

        </div>

      </div>
    );
  }

  // 🔥 Main Feed

  return (

    <div
      style={{
        display: "flex",

        flexDirection: "column",

        gap: "22px",
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

        <div
          style={{
            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            flexWrap: "wrap",

            gap: "16px",
          }}
        >

          <div>

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
              Pull Request Security Feed
            </h1>

            <div
              style={{
                color: "#b6b6b6",

                fontSize: "15px",

                lineHeight: "1.8",

                maxWidth: "760px",
              }}
            >
              Autonomous AI-driven pull request intelligence
              with behavioral analysis, vulnerability detection,
              remediation workflows, and security governance.
            </div>

          </div>

          {/* Counter */}

          <div
            style={{
              background:
                "linear-gradient(135deg,#ff7a00,#ffb347)",

              color: "#111",

              padding: "14px 18px",

              borderRadius: "16px",

              fontWeight: "800",

              fontSize: "14px",

              boxShadow:
                "0 0 22px rgba(255,140,66,0.28)",
            }}
          >
            {prs.length} Active PR Reviews
          </div>

        </div>

      </div>

      {/* PR Cards */}

      <div
        style={{
          display: "flex",

          flexDirection: "column",

          gap: "18px",
        }}
      >

        {prs.map((pr) => (

          <PRCard
            key={pr.id}
            pr={pr}
          />

        ))}

      </div>

    </div>
  );
}