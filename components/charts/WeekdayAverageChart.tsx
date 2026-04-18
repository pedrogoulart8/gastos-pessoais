"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatBRL } from "@/src/lib/utils";
import type { WeekdayAverage } from "@/src/types";

interface Props {
  data: WeekdayAverage[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="text-primary">{formatBRL(Math.round(payload[0].value * 100))}</p>
      <p className="text-xs text-muted-foreground">média dos últimos 90 dias</p>
    </div>
  );
}

export function WeekdayAverageChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    averageBRL: d.average / 100,
  }));

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="weekday"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${(v as number).toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
          <Bar dataKey="averageBRL" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isMax ? "#10b981" : "#065f46"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
