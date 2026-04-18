import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  transaction: {
    aggregate: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("@/src/lib/prisma", () => ({ prisma: mockPrisma }));

import {
  getMonthSummary,
  getCategoryTotals,
  getDailyTotals,
  getCumulativeCurve,
  getTop10,
  getWeekdayAverages,
} from "@/src/services/analyticsService";

describe("getMonthSummary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calcula percentual de variação corretamente (+25%)", async () => {
    mockPrisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 10000 }, _count: 5 })
      .mockResolvedValueOnce({ _sum: { amount: 8000 }, _count: 4 });

    const result = await getMonthSummary(2026, 4);
    expect(result.total).toBe(10000);
    expect(result.previousTotal).toBe(8000);
    expect(result.changePercent).toBeCloseTo(25, 1);
  });

  it("retorna changePercent 0 quando não há mês anterior", async () => {
    mockPrisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 5000 }, _count: 3 })
      .mockResolvedValueOnce({ _sum: { amount: null }, _count: 0 });

    const result = await getMonthSummary(2026, 4);
    expect(result.changePercent).toBe(0);
  });
});

describe("getCategoryTotals", () => {
  beforeEach(() => vi.clearAllMocks());

  it("agrupa e ordena por total decrescente", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      { categoryId: "c1", amount: 3000, category: { id: "c1", name: "Lazer", color: "#a855f7", icon: null } },
      { categoryId: "c2", amount: 8000, category: { id: "c2", name: "Mercado", color: "#22c55e", icon: null } },
      { categoryId: "c1", amount: 2000, category: { id: "c1", name: "Lazer", color: "#a855f7", icon: null } },
    ]);

    const result = await getCategoryTotals(2026, 4);
    expect(result[0].name).toBe("Mercado");
    expect(result[0].total).toBe(8000);
    expect(result[1].name).toBe("Lazer");
    expect(result[1].total).toBe(5000);
  });
});

describe("getDailyTotals", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna exatamente 30 entradas preenchendo zeros", async () => {
    const today = new Date();
    mockPrisma.transaction.findMany.mockResolvedValue([
      { date: today, amount: 1500 },
    ]);

    const result = await getDailyTotals();
    expect(result).toHaveLength(30);
    const nonZero = result.filter((d) => d.total > 0);
    expect(nonZero.length).toBeGreaterThanOrEqual(1);
  });
});

describe("getCumulativeCurve", () => {
  beforeEach(() => vi.clearAllMocks());

  it("produz curva cumulativa crescente corretamente", async () => {
    mockPrisma.transaction.findMany
      .mockResolvedValueOnce([
        { date: new Date(2026, 3, 1), amount: 1000 }, // dia 1
        { date: new Date(2026, 3, 5), amount: 2000 }, // dia 5
      ])
      .mockResolvedValueOnce([
        { date: new Date(2026, 2, 1), amount: 500 }, // mês anterior dia 1
      ]);

    const result = await getCumulativeCurve(2026, 4);
    expect(result.length).toBe(30); // abril tem 30 dias
    expect(result[0].current).toBe(1000);  // acumulado dia 1
    expect(result[4].current).toBe(3000);  // acumulado dia 5 (1000+2000)
    expect(result[0].previous).toBe(500);  // mês anterior dia 1
  });
});

describe("getTop10", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna as transações na ordem retornada pelo banco", async () => {
    const txs = Array.from({ length: 10 }, (_, i) => ({
      id: `tx-${i}`,
      amount: 10000 - i * 500,
      merchant: `Loja ${i}`,
      date: new Date(),
      description: null,
      paymentMethod: "PIX",
      categoryId: "c1",
      receiptId: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: { id: "c1", name: "Outros", color: "#6b7280", icon: null },
      receipt: null,
    }));
    mockPrisma.transaction.findMany.mockResolvedValue(txs);

    const result = await getTop10(2026, 4);
    expect(result).toHaveLength(10);
    expect(result[0].amount).toBe(10000);
  });
});

describe("getWeekdayAverages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna 7 dias da semana e marca o dia com maior média", async () => {
    // Usa construtor local (não ISO string) para evitar problema de timezone UTC vs local
    // new Date(ano, mês, dia) cria data em hora local — getDay() retorna o dia correto
    mockPrisma.transaction.findMany.mockResolvedValue([
      { date: new Date(2026, 3, 6), amount: 2000 },  // 6 abr 2026 = segunda-feira
      { date: new Date(2026, 3, 13), amount: 2000 }, // 13 abr 2026 = segunda-feira
    ]);

    const result = await getWeekdayAverages();
    expect(result).toHaveLength(7);
    const seg = result.find((r) => r.weekday === "Seg");
    expect(seg?.average).toBe(2000);
    expect(seg?.isMax).toBe(true);
    result.filter((r) => r.weekday !== "Seg").forEach((r) => expect(r.isMax).toBe(false));
  });
});
