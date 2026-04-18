import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  transaction: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/src/lib/prisma", () => ({ prisma: mockPrisma }));

import {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/src/services/transactionService";

const fakeCat = { id: "cat-1", name: "Mercado", color: "#22c55e", icon: "ShoppingCart" };
const fakeTx = {
  id: "tx-1",
  receiptId: null,
  date: new Date("2026-04-15"),
  amount: 4590,
  merchant: "Pão de Açúcar",
  description: "Compras",
  paymentMethod: "PIX",
  categoryId: "cat-1",
  category: fakeCat,
  receipt: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("createTransaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria transação e retorna com categoria", async () => {
    mockPrisma.transaction.create.mockResolvedValue(fakeTx);
    const result = await createTransaction({
      date: "2026-04-15",
      amount: 4590,
      merchant: "Pão de Açúcar",
      categoryId: "cat-1",
    });
    expect(result.amount).toBe(4590);
    expect(mockPrisma.transaction.create).toHaveBeenCalledOnce();
  });
});

describe("listTransactions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista sem filtros", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([fakeTx]);
    const result = await listTransactions();
    expect(result).toHaveLength(1);
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  it("aplica filtro de mês", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    await listTransactions({ month: "2026-04" });
    const call = mockPrisma.transaction.findMany.mock.calls[0][0];
    expect(call.where.date).toBeDefined();
    expect(call.where.date.gte).toEqual(new Date(2026, 3, 1));
  });

  it("aplica filtro de busca textual", async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([fakeTx]);
    await listTransactions({ search: "mercado" });
    const call = mockPrisma.transaction.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
  });
});

describe("getTransaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna transação existente", async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue(fakeTx);
    const result = await getTransaction("tx-1");
    expect(result?.id).toBe("tx-1");
  });

  it("retorna null para id inexistente", async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue(null);
    const result = await getTransaction("nao-existe");
    expect(result).toBeNull();
  });
});

describe("updateTransaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atualiza campos fornecidos", async () => {
    mockPrisma.transaction.update.mockResolvedValue({ ...fakeTx, amount: 9900 });
    const result = await updateTransaction("tx-1", { amount: 9900 });
    expect(result.amount).toBe(9900);
  });
});

describe("deleteTransaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deleta e retorna o objeto deletado", async () => {
    mockPrisma.transaction.delete.mockResolvedValue(fakeTx);
    const result = await deleteTransaction("tx-1");
    expect(result.id).toBe("tx-1");
  });
});
