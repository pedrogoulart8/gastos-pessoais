import { PageHeader } from "@/components/layout/PageHeader";
import { MonthlyComparisonCards } from "@/components/charts/MonthlyComparisonCards";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { DailySpendingChart } from "@/components/charts/DailySpendingChart";
import {
  getMonthSummary,
  getCategoryTotals,
  getDailyTotals,
} from "@/src/services/analyticsService";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const [summary, categories, daily] = await Promise.all([
    getMonthSummary(year, month),
    getCategoryTotals(year, month),
    getDailyTotals(),
  ]);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Gastos Visíveis"
        subtitle={`Resumo de ${monthLabel}`}
      />

      {/* Comparação mensal */}
      <section>
        <MonthlyComparisonCards
          summary={summary}
          monthLabel={monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        />
      </section>

      {/* Charts em grid no desktop, stacked no mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-6">
        <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Por categoria
          </h2>
          <CategoryBarChart data={categories} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Últimos 30 dias
          </h2>
          <div className="h-64 md:h-80">
            <DailySpendingChart data={daily} />
          </div>
        </section>
      </div>
    </div>
  );
}
