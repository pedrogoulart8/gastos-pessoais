import { prisma } from "@/src/lib/prisma";
import type {
  MonthSummary,
  CategoryWithTotal,
  DailyTotal,
  CumulativePoint,
  WeekdayAverage,
  TransactionWithCategory,
  PaymentMethodTotal,
} from "@/src/types";

// Helpers de data
function startOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}
function endOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

// 5.1 — Comparação mensal
export async function getMonthSummary(year: number, month: number): Promise<MonthSummary> {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [current, previous, today] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        date: { gte: startOfMonth(year, month), lt: endOfMonth(year, month) },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        date: {
          gte: startOfMonth(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1),
          lt: endOfMonth(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1),
        },
      },
    }),
    isCurrentMonth
      ? prisma.transaction.aggregate({
          _sum: { amount: true },
          _count: true,
          where: { date: { gte: startOfToday, lt: startOfTomorrow } },
        })
      : Promise.resolve({ _sum: { amount: 0 }, _count: 0 }),
  ]);

  const total = current._sum.amount ?? 0;
  const previousTotal = previous._sum.amount ?? 0;
  const changePercent =
    previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100;

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysElapsed = isCurrentMonth ? now.getDate() : daysInMonth;
  const dailyAverage = daysElapsed === 0 ? 0 : Math.round(total / daysElapsed);

  return {
    total,
    count: current._count,
    previousTotal,
    previousCount: previous._count,
    changePercent,
    todayTotal: today._sum.amount ?? 0,
    todayCount: today._count,
    isCurrentMonth,
    dailyAverage,
    daysInMonth,
  };
}

// Helper para mês anterior
function prevMonth(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

// 5.2 — Gastos por categoria no mês
export async function getCategoryTotals(
  year: number,
  month: number
): Promise<CategoryWithTotal[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startOfMonth(year, month), lt: endOfMonth(year, month) },
    },
    include: { category: true },
  });

  const map = new Map<string, CategoryWithTotal>();
  for (const t of transactions) {
    const existing = map.get(t.categoryId);
    if (existing) {
      existing.total += t.amount;
    } else {
      map.set(t.categoryId, { ...t.category, total: t.amount });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

// 5.3 — Gastos diários do mês selecionado (ou últimos 30 dias se não informado)
export async function getDailyTotals(
  year?: number,
  month?: number
): Promise<DailyTotal[]> {
  let since: Date;
  let dayCount: number;

  if (year !== undefined && month !== undefined) {
    since = startOfMonth(year, month);
    dayCount = new Date(year, month, 0).getDate();
  } else {
    const now = new Date();
    since = new Date(now);
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);
    dayCount = 30;
  }

  const until = new Date(since);
  until.setDate(until.getDate() + dayCount);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: since, lt: until } },
    select: { date: true, amount: true },
    orderBy: { date: "asc" },
  });

  const map = new Map<string, { total: number; count: number }>();
  for (const t of transactions) {
    const key = t.date.toISOString().slice(0, 10);
    const existing = map.get(key);
    if (existing) {
      existing.total += t.amount;
      existing.count += 1;
    } else {
      map.set(key, { total: t.amount, count: 1 });
    }
  }

  const result: DailyTotal[] = [];
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const entry = map.get(key);
    result.push({ date: key, total: entry?.total ?? 0, count: entry?.count ?? 0 });
  }

  return result;
}

// 5.4 — Curva cumulativa mês atual vs mês anterior
export async function getCumulativeCurve(
  year: number,
  month: number
): Promise<CumulativePoint[]> {
  const prev = prevMonth(year, month);

  const [currentTx, previousTx] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: { gte: startOfMonth(year, month), lt: endOfMonth(year, month) } },
      select: { date: true, amount: true },
      orderBy: { date: "asc" },
    }),
    prisma.transaction.findMany({
      where: {
        date: {
          gte: startOfMonth(prev.year, prev.month),
          lt: endOfMonth(prev.year, prev.month),
        },
      },
      select: { date: true, amount: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const toMap = (txs: { date: Date; amount: number }[]) => {
    const m = new Map<number, number>();
    for (const t of txs) {
      const day = t.date.getDate();
      m.set(day, (m.get(day) ?? 0) + t.amount);
    }
    return m;
  };

  const currentMap = toMap(currentTx);
  const previousMap = toMap(previousTx);
  const daysInMonth = new Date(year, month, 0).getDate();

  const result: CumulativePoint[] = [];
  let cumCurrent = 0;
  let cumPrevious = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    cumCurrent += currentMap.get(day) ?? 0;
    cumPrevious += previousMap.get(day) ?? 0;
    result.push({ day, current: cumCurrent, previous: cumPrevious });
  }

  return result;
}

// 5.5 — Top 10 maiores gastos do mês
export async function getTop10(
  year: number,
  month: number
): Promise<TransactionWithCategory[]> {
  return prisma.transaction.findMany({
    where: {
      date: { gte: startOfMonth(year, month), lt: endOfMonth(year, month) },
    },
    orderBy: { amount: "desc" },
    take: 10,
    include: { category: true, receipt: true },
  }) as Promise<TransactionWithCategory[]>;
}

// Top 3 formas de pagamento do mês
export async function getTopPaymentMethods(
  year: number,
  month: number
): Promise<PaymentMethodTotal[]> {
  const grouped = await prisma.transaction.groupBy({
    by: ["paymentMethod"],
    _sum: { amount: true },
    _count: true,
    where: {
      date: { gte: startOfMonth(year, month), lt: endOfMonth(year, month) },
    },
  });

  const monthTotal = grouped.reduce((acc, g) => acc + (g._sum.amount ?? 0), 0);

  return grouped
    .map((g) => ({
      method: g.paymentMethod,
      total: g._sum.amount ?? 0,
      count: g._count,
      percent: monthTotal === 0 ? 0 : ((g._sum.amount ?? 0) / monthTotal) * 100,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
}

// 5.6 — Média de gasto por dia da semana (janela de 90 dias)
export async function getWeekdayAverages(
  year?: number,
  month?: number
): Promise<WeekdayAverage[]> {
  const now = new Date();
  const isCurrent =
    year === undefined ||
    month === undefined ||
    (year === now.getFullYear() && month === now.getMonth() + 1);

  const anchor = isCurrent ? now : new Date(endOfMonth(year!, month!).getTime() - 1);
  const since = new Date(anchor);
  since.setDate(since.getDate() - 89);
  since.setHours(0, 0, 0, 0);
  const until = new Date(anchor);
  until.setHours(23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: since, lte: until } },
    select: { date: true, amount: true },
  });

  // 0=Dom, 1=Seg, ..., 6=Sáb
  const totals = Array(7).fill(0) as number[];
  const counts = Array(7).fill(0) as number[];

  for (const t of transactions) {
    const wd = t.date.getDay();
    totals[wd] += t.amount;
    counts[wd] += 1;
  }

  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  // Ordena Seg→Dom para exibição
  const order = [1, 2, 3, 4, 5, 6, 0];

  const averages = order.map((i) => ({
    weekday: labels[i],
    average: counts[i] === 0 ? 0 : Math.round(totals[i] / counts[i]),
  }));

  const max = Math.max(...averages.map((a) => a.average));

  return averages.map((a) => ({ ...a, isMax: a.average === max && a.average > 0 }));
}
