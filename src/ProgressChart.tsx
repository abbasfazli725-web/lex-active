import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
export default function ProgressChart({
  chart,
  metric,
}: {
  chart: { date: string; value: number }[];
  metric: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <LineChart
        data={chart}
        margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
      >
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) =>
            new Date(d + "T12:00:00").toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })
          }
          tick={{ fill: "var(--muted)", fontSize: 11 }}
        />
        <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} width={48} />
        <Tooltip
          contentStyle={{
            background: "var(--surface)",
            borderColor: "var(--line)",
            borderRadius: 12,
            color: "var(--text)",
          }}
        />
        <Line
          type="linear"
          dataKey="value"
          name={metric}
          stroke="var(--accent)"
          strokeWidth={3}
          dot={{ r: 5, fill: "var(--accent)" }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
