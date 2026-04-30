export default function PRCard({ pr }) {
  const scoreColor =
    pr.score > 80
      ? "text-green-400"
      : pr.score > 50
      ? "text-yellow-400"
      : "text-red-400";

  const handleDownloadReport = async () => {
    const { getReport } = await import("../../api/client");
    const url = getReport(pr.id);
    window.open(url, "_blank");
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{pr.title}</h3>
          <p className="text-sm text-gray-400">
            #{pr.id} • {pr.repo}
          </p>
        </div>
        <div className={`text-xl font-bold ${scoreColor}`}>{pr.score}</div>
      </div>

      {/* Verdict */}
      <div className="mt-2 text-sm">
        {pr.blocked ? (
          <span className="text-red-400 font-medium">🚫 Blocked by Policy</span>
        ) : (
          <span className="text-green-400 font-medium">✅ Approved</span>
        )}
      </div>

      {/* Policy Violations */}
      {pr.policy?.violations?.length > 0 && (
        <div className="mt-3 bg-red-900/20 border border-red-700 rounded p-3">
          <p className="text-red-400 text-sm font-medium">Policy Violations</p>
          <ul className="mt-1 text-sm text-red-300 list-disc ml-5">
            {pr.policy.violations.map((v, i) => (
              <li key={i}>Rule: {v.rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Findings */}
      {pr.findings?.length > 0 && (
        <div className="mt-3 text-sm text-gray-300">
          <p className="mb-1 font-medium">Findings:</p>
          <ul className="list-disc ml-5 space-y-1">
            {pr.findings.slice(0, 3).map((f, i) => (
              <li key={i}>
                {f.message} ({f.severity})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-4 text-sm">
        {pr.fix_pr_url && (
          <a
            href={pr.fix_pr_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            🔧 View Auto-Fix PR
          </a>
        )}
        <button
          onClick={handleDownloadReport}
          className="text-teal-400 hover:underline"
        >
          📄 Download Report
        </button>
      </div>

    </div>
  );
}