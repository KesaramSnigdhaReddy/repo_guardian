import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    }}>
      <div style={{ color: "#8b949e", marginBottom: "4px" }}>{label}</div>
      <div style={{ color: "#2ea043", fontWeight: 600 }}>{payload[0].value}<span style={{ color: "#484f58", fontWeight: 400 }}>/100</span></div>
    </div>
  );
};

export default function TrendChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#484f58", fontSize: "13px" }}>No history yet</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2ea043" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2ea043" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="1 4" stroke="#21262d" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#484f58" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#484f58" }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#30363d", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#2ea043"
          strokeWidth={1.5}
          fill="url(#scoreGrad)"
          dot={false}
          activeDot={{ r: 3, fill: "#2ea043", stroke: "#161b22", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}