import { NextRequest, NextResponse } from "next/server";
import {
  createTransaction,
  listTransactions,
  listCategories,
} from "@/src/services/transactionService";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  // Retorna categorias se solicitado
  if (searchParams.get("resource") === "categories") {
    const categories = await listCategories();
    return NextResponse.json(categories);
  }

  const transactions = await listTransactions({ month, categoryId, search });
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { receiptId, date, amount, merchant, description, paymentMethod, categoryId, notes } =
    body;

  if (!date || !amount || !merchant || !categoryId) {
    return NextResponse.json(
      { error: "Campos obrigatórios: date, amount, merchant, categoryId" },
      { status: 400 }
    );
  }

  const transaction = await createTransaction({
    receiptId,
    date,
    amount,
    merchant,
    description,
    paymentMethod,
    categoryId,
    notes,
  });

  // Marca o receipt como confirmado, se houver
  if (receiptId) {
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { status: "CONFIRMED" },
    });
  }

  return NextResponse.json(transaction, { status: 201 });
}
