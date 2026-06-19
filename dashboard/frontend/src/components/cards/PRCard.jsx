export default function PRCard({ pr }) {

  const scoreColor =
    pr.score > 80
      ? "#ffb347"
      : pr.score > 50
      ? "#ff9d2e"
      : "#ff5a1f";

  return (

    <div
      className="rounded-2xl p-5 transition"
      style={{

        background:
          "linear-gradient(145deg,#070707,#121212)",

        border:
          "1px solid rgba(255,140,66,0.12)",

        boxShadow:
          "0 0 28px rgba(0,0,0,0.45)",

        position: "relative",

        overflow: "hidden",
      }}
    >

      {/* Glow */}

      <div
        style={{
          position: "absolute",

          top: "-60px",
          right: "-60px",

          width: "160px",
          height: "160px",

          background:
            "rgba(255,140,66,0.06)",

          borderRadius: "50%",

          filter: "blur(45px)",
        }}
      />

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h3
            className="text-lg font-semibold"
            style={{
              color: "#ffffff",
              letterSpacing: "-0.3px",
            }}
          >
            {pr.title}
          </h3>

          <p
            className="text-sm"
            style={{
              color: "#9ca3af",
              marginTop: "4px",
            }}
          >
            #{pr.id} • {pr.repo}
          </p>

        </div>

        {/* Score */}

        <div
          style={{
            color: scoreColor,

            fontSize: "34px",

            fontWeight: "800",

            textShadow:
              `0 0 14px ${scoreColor}55`,
          }}
        >
          {pr.score}
        </div>

      </div>

      {/* Verdict */}

      <div className="mt-4 text-sm">

        {pr.blocked ? (

          <span
            style={{
              background:
                "rgba(255,90,31,0.10)",

              border:
                "1px solid rgba(255,90,31,0.22)",

              color: "#ff5a1f",

              padding: "6px 12px",

              borderRadius: "999px",

              fontWeight: "700",

              fontSize: "12px",

              boxShadow:
                "0 0 12px rgba(255,90,31,0.18)",
            }}
          >
            🚫 Blocked by Security Policy
          </span>

        ) : (

          <span
            style={{
              background:
                "rgba(255,179,71,0.10)",

              border:
                "1px solid rgba(255,179,71,0.22)",

              color: "#ffb347",

              padding: "6px 12px",

              borderRadius: "999px",

              fontWeight: "700",

              fontSize: "12px",

              boxShadow:
                "0 0 12px rgba(255,179,71,0.16)",
            }}
          >
            ✅ Approved by AI Security Review
          </span>

        )}

      </div>

      {/* Policy Violations */}

      {pr.policy?.violations?.length > 0 && (

        <div
          className="mt-4 rounded-xl p-4"
          style={{
            background:
              "linear-gradient(145deg,#1a0907,#120707)",

            border:
              "1px solid rgba(255,90,31,0.18)",
          }}
        >

          <p
            style={{
              color: "#ff7a00",

              fontSize: "13px",

              fontWeight: "700",

              marginBottom: "10px",

              letterSpacing: "0.04em",
            }}
          >
            ⚠️ Policy Violations
          </p>

          <ul
            className="list-disc ml-5"
            style={{
              color: "#ffd0b3",

              fontSize: "13px",

              lineHeight: "1.8",
            }}
          >

            {pr.policy.violations.map((v, i) => (

              <li key={i}>
                Rule: {v.rule}
              </li>

            ))}

          </ul>

        </div>
      )}

      {/* Findings */}

      {pr.findings?.length > 0 && (

        <div
          className="mt-4"
          style={{
            background:
              "linear-gradient(145deg,#0b0b0b,#151515)",

            border:
              "1px solid rgba(255,140,66,0.10)",

            borderRadius: "16px",

            padding: "16px",
          }}
        >

          <p
            className="mb-3"
            style={{
              color: "#ffb066",

              fontWeight: "700",

              fontSize: "13px",

              textTransform: "uppercase",

              letterSpacing: "0.06em",
            }}
          >
            Active Findings
          </p>

          <ul
            className="list-disc ml-5 space-y-2"
            style={{
              color: "#e5e7eb",

              fontSize: "13px",

              lineHeight: "1.7",
            }}
          >

            {pr.findings.slice(0, 3).map((f, i) => (

              <li key={i}>

                <span style={{ color: "#ffffff" }}>
                  {f.message}
                </span>

                <span
                  style={{
                    color:
                      f.severity === "critical"
                        ? "#ff5a1f"
                        : f.severity === "high"
                        ? "#ff9d2e"
                        : "#ffb347",

                    marginLeft: "6px",

                    fontWeight: "700",
                  }}
                >
                  ({f.severity})
                </span>

              </li>

            ))}

          </ul>

        </div>
      )}

      {/* Actions */}

      <div
        className="mt-5 flex gap-3 flex-wrap"
      >

        {pr.fix_pr_url && (

          <a
            href={pr.fix_pr_url}
            target="_blank"
            rel="noreferrer"
            style={{
              background:
                "linear-gradient(135deg,#ff7a00,#ffb347)",

              color: "#111",

              padding: "10px 14px",

              borderRadius: "12px",

              textDecoration: "none",

              fontWeight: "700",

              fontSize: "12px",

              boxShadow:
                "0 0 16px rgba(255,140,66,0.22)",
            }}
          >
            🔧 View Auto-Fix PR
          </a>

        )}

        <a
          href="http://localhost:8000/api/export-report"
          download="RepoGuardian_Report.pdf"
          target="_blank"
          rel="noreferrer"
          style={{
            background:
              "linear-gradient(145deg,#0d0d0d,#181818)",

            border:
              "1px solid rgba(255,140,66,0.12)",

            color: "#ffb066",

            padding: "10px 14px",

            borderRadius: "12px",

            textDecoration: "none",

            fontWeight: "700",

            fontSize: "12px",
          }}
        >
          📄 Download Security Report
        </a>

      </div>

    </div>
  );
}