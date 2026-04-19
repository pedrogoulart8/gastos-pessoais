import { PageHeader } from "@/components/layout/PageHeader";
import { MonthPicker } from "@/components/layout/MonthPicker";
import { CumulativeCurveChart } from "@/components/charts/CumulativeCurveChart";
import { Top10List } from "@/components/charts/Top10List";
import { WeekdayAverageChart } from "@/components/charts/WeekdayAverageChart";
import { TopPaymentMethods } from "@/components/charts/TopPaymentMethods";
import {
  getCumulativeCurve,
  getTop10,
  getWeekdayAverages,
  getTopPaymentMethods,
} from "@/src/services/analyticsService";

export const dynamic = "force-dynamic";

function monthName(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "short" });
}

function parseMonthParam(value: string | string[] | undefined): { year: number; month: number } {
  const now = new Date();
  if (typeof value !== "string") {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  return { year, month };
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonthParam(params.month);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const [curve, top10, weekdays, paymentMethods] = await Promise.all([
    getCumulativeCurve(year, month),
    getTop10(year, month),
    getWeekdayAverages(year, month),
    getTopPaymentMethods(year, month),
  ]);

  const currentLabel = monthName(year, month);
  const previousLabel = monthName(prevYear, prevMonth);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Insights" subtitle={capitalizedMonth} />

      <MonthPicker year={year} month={month} />

      {/* Top 10 — agora no topo */}
      <section className="rounded-2xl border border-border bg-card mx-4 md:mx-6 p-4 md:p-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Top 10 gastos do mês
        </h2>
        <Top10List transactions={top10} />
      </section>

      {/* Top 3 formas de pagamento */}
      <section className="rounded-2xl border border-border bg-card mx-4 md:mx-6 p-4 md:p-6">
        <h2 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Top formas de pagamento
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          As 3 mais usadas no mês, com % do total
        </p>
        <TopPaymentMethods data={paymentMethods} />
      </section>

      {/* Ritmo de gastos — full width, mais alto no desktop */}
      <section className="rounded-2xl border border-border bg-card p-4 md:p-6 mx-4 md:mx-6">
        <h2 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Ritmo de gastos
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Acumulado do mês vs mês anterior
        </p>
        <div className="h-64 md:h-96">
          <CumulativeCurveChart
            data={curve}
            currentLabel={currentLabel}
            previousLabel={previousLabel}
          />
        </div>
      </section>

      {/* Média por dia da semana — full width, mais alto no desktop */}
      <section className="rounded-2xl border border-border bg-card p-4 md:p-6 mx-4 md:mx-6">
        <h2 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Média por dia da semana
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Baseado nos 90 dias até o fim do mês selecionado
        </p>
        <div className="h-64 md:h-96">
          <WeekdayAverageChart data={weekdays} />
        </div>
      </section>
    </div>
  );
}
