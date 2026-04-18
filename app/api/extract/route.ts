import { NextRequest, NextResponse } from "next/server";
import { extractReceiptData } from "@/src/services/extractionService";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { receiptId } = body;

  if (!receiptId) {
    return NextResponse.json({ error: "receiptId é obrigatório" }, { status: 400 });
  }

  const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
  if (!receipt) {
    return NextResponse.json({ error: "Comprovante não encontrado" }, { status: 404 });
  }

  // Baixa a imagem do Vercel Blob e converte para base64
  const imageResponse = await fetch(receipt.imageUrl);
  if (!imageResponse.ok) {
    return NextResponse.json({ error: "Falha ao baixar imagem" }, { status: 502 });
  }

  const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg";
  const arrayBuffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const validMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
  type ValidMediaType = (typeof validMediaTypes)[number];
  const mediaType: ValidMediaType = validMediaTypes.includes(contentType as ValidMediaType)
    ? (contentType as ValidMediaType)
    : "image/jpeg";

  const result = await extractReceiptData(base64, mediaType);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  // Salva extração raw no receipt
  await prisma.receipt.update({
    where: { id: receiptId },
    data: { rawExtraction: result.data },
  });

  return NextResponse.json({ data: result.data }, { status: 200 });
}
