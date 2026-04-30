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

  if (loading) {
    return <div className="text-gray-400 p-6">Loading PR feed...</div>;
  }

  if (!prs.length) {
    return <div className="text-gray-500 p-6">No PRs found.</div>;
  }

  return (
    <div className="space-y-4">
      {prs.map((pr) => (
        <PRCard key={pr.id} pr={pr} />
      ))}
    </div>
  );
}