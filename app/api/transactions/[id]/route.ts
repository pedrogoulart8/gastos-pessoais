import { NextRequest, NextResponse } from "next/server";
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/src/services/transactionService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await getTransaction(id);
  if (!transaction) {
    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  }
  return NextResponse.json(transaction);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const transaction = await getTransaction(id);
  if (!transaction) {
    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  }

  const updated = await updateTransaction(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const transaction = await getTransaction(id);
  if (!transaction) {
    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  }

  await deleteTransaction(id);
  return new NextResponse(null, { status: 204 });
}
