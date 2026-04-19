import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatBRL } from "@/src/lib/utils";
import type { MonthSummary } from "@/src/types";

interface Props {
  summary: MonthSummary;
  monthLabel: string;
}

export function MonthlyComparisonCards({ summary, monthLabel }: Props) {
  const { total, count, changePercent } = summary;
  const isNeutral = summary.previousTotal === 0;
  const isDown = !isNeutral && changePercent < 0;
  const isUp = !isNeutral && changePercent > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-6">
      {/* Card principal */}
      <div className="col-span-2 rounded-2xl bg-primary p-5 md:p-6 text-primary-foreground shadow-sm">
        <p className="text-sm font-medium opacity-90">{monthLabel}</p>
        <p className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">{formatBRL(total)}</p>
        <div className="mt-3 flex items-center gap-2">
          {isNeutral && <Minus className="h-4 w-4 opacity-80" />}
          {isDown && <TrendingDown className="h-4 w-4" />}
          {isUp && <TrendingUp className="h-4 w-4" />}
          <span className="text-sm opacity-95">
            {isNeutral
              ? "Primeiro mês registrado"
              : `${isDown ? "" : "+"}${changePercent.toFixed(1)}% vs mês anterior`}
          </span>
        </div>
      </div>

      {/* Card de transações */}
      <div className="rounded-2xl bg-card p-4 md:p-6 shadow-sm border border-border">
        <p className="text-xs font-medium text-muted-foreground">Transações</p>
        <p className="mt-1 text-2xl md:text-3xl font-bold">{count}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {summary.previousCount > 0
            ? `vs ${summary.previousCount} mês anterior`
            : "neste mês"}
        </p>
      </div>

      {/* Card de valor gasto no dia */}
      <div className="rounded-2xl bg-card p-4 md:p-6 shadow-sm border border-border">
        <p className="text-xs font-medium text-muted-foreground">Valor gasto no dia</p>
        <p className="mt-1 text-2xl md:text-3xl font-bold">
          {formatBRL(summary.todayTotal)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {summary.todayCount === 0
            ? "nenhuma transação hoje"
            : `${summary.todayCount} ${summary.todayCount === 1 ? "transação" : "transações"} hoje`}
        </p>
      </div>
    </div>
  );
}
