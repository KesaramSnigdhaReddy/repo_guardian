import { useEffect, useState } from "react";
import { getUsers } from "../api/client";
import DeveloperCard from "../components/cards/DeveloperCard";

export default function Developers() {
  const [devs, setDevs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setDevs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-400 p-6">Loading developers...</div>;
  }

  if (!devs.length) {
    return <div className="text-gray-500 p-6">No developer data.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Developers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devs.map((dev) => (
          <DeveloperCard key={dev.name} dev={dev} />
        ))}
      </div>
    </div>
  );
}