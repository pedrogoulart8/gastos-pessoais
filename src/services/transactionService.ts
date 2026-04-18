import { prisma } from "@/src/lib/prisma";
import type { PaymentMethod, Prisma } from "@/app/generated/prisma/client";

export type CreateTransactionInput = {
  receiptId?: string;
  date: string; // YYYY-MM-DD
  amount: number; // centavos
  merchant: string;
  description?: string;
  paymentMethod?: PaymentMethod;
  categoryId: string;
  notes?: string;
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type TransactionFilters = {
  month?: string; // YYYY-MM
  categoryId?: string;
  search?: string;
};

export async function createTransaction(input: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      receiptId: input.receiptId,
      date: new Date(input.date),
      amount: input.amount,
      merchant: input.merchant,
      description: input.description,
      paymentMethod: input.paymentMethod ?? "PIX",
      categoryId: input.categoryId,
      notes: input.notes,
    },
    include: { category: true, receipt: true },
  });
}

export async function listTransactions(filters: TransactionFilters = {}) {
  const where: Prisma.TransactionWhereInput = {};

  if (filters.month) {
    const [year, month] = filters.month.split("-").map(Number);
    where.date = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.search) {
    where.OR = [
      { merchant: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    include: { category: true, receipt: true },
  });
}

export async function getTransaction(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: { category: true, receipt: true },
  });
}

export async function updateTransaction(id: string, input: UpdateTransactionInput) {
  const data: Prisma.TransactionUpdateInput = {};
  if (input.date !== undefined) data.date = new Date(input.date);
  if (input.amount !== undefined) data.amount = input.amount;
  if (input.merchant !== undefined) data.merchant = input.merchant;
  if (input.description !== undefined) data.description = input.description;
  if (input.paymentMethod !== undefined) data.paymentMethod = input.paymentMethod;
  if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
  if (input.notes !== undefined) data.notes = input.notes;

  return prisma.transaction.update({
    where: { id },
    data,
    include: { category: true, receipt: true },
  });
}

export async function deleteTransaction(id: string) {
  return prisma.transaction.delete({ where: { id } });
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
