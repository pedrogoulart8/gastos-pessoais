import { PageHeader } from "@/components/layout/PageHeader";
import { MonthPicker } from "@/components/layout/MonthPicker";
import { MonthlyComparisonCards } from "@/components/charts/MonthlyComparisonCards";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { DailySpendingChart } from "@/components/charts/DailySpendingChart";
import {
  getMonthSummary,
  getCategoryTotals,
  getDailyTotals,
} from "@/src/services/analyticsService";

export const dynamic = "force-dynamic";

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

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonthParam(params.month);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const [summary, categories, daily] = await Promise.all([
    getMonthSummary(year, month),
    getCategoryTotals(year, month),
    getDailyTotals(year, month),
  ]);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Gastos Visíveis"
        subtitle={`Resumo de ${monthLabel}`}
      />

      <MonthPicker year={year} month={month} />

      <section>
        <MonthlyComparisonCards
          summary={summary}
          monthLabel={monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-6">
        <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Por categoria
          </h2>
          <CategoryBarChart data={categories} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {summary.isCurrentMonth ? "Dias do mês" : "Dias do mês selecionado"}
          </h2>
          <div className="h-64 md:h-80">
            <DailySpendingChart data={daily} />
          </div>
        </section>
      </div>
    </div>
  );
}
