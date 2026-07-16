import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from "recharts";
import { format } from "date-fns";
import type { Mock } from "@/lib/mock/data";

export function ThreatTimeline({ mock }: { mock: Mock }) {
  const data = mock.timeline.map((p) => ({ ts: p.ts, score: Number(p.score.toFixed(1)) }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="anom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="ts"
            tickFormatter={(v) => format(v, "HH:mm")}
            stroke="var(--muted-foreground)"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            labelFormatter={(v) => format(v as number, "MMM d HH:mm")}
          />
          <Area type="monotone" dataKey="score" stroke="var(--danger)" strokeWidth={1.5} fill="url(#anom)" />
          {mock.alerts
            .filter((a) => a.severity === "critical" || a.severity === "high")
            .map((a) => (
              <ReferenceDot
                key={a.id}
                x={a.ts}
                y={Math.min(98, a.score)}
                r={4}
                fill={a.severity === "critical" ? "var(--danger)" : "var(--warn)"}
                stroke="var(--background)"
                strokeWidth={2}
              />
            ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
