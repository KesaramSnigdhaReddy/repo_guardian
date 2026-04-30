export default function DeveloperCard({ dev }) {
  const scoreColor =
    dev.health_score > 80
      ? "text-green-400"
      : dev.health_score > 50
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center font-bold text-white">
          {dev.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold">{dev.name}</h3>
          <p className="text-xs text-gray-400">
            {dev.pr_count} PRs • Last active {dev.last_active}
          </p>
        </div>
      </div>

      {/* Score */}
      <div className="mt-4">
        <p className="text-sm text-gray-400">Health Score</p>
        <p className={`text-2xl font-bold ${scoreColor}`}>
          {dev.health_score ?? "N/A"}
        </p>
      </div>

      {/* Recurring Alerts */}
      {dev.recurring_alerts?.length > 0 && (
        <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded p-3">
          <p className="text-yellow-400 text-sm font-medium">⚠️ Recurring Issues</p>
          <ul className="mt-1 text-sm text-yellow-300 list-disc ml-5">
            {dev.recurring_alerts.slice(0, 3).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}