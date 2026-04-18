import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato inválido. Use JPEG, PNG ou WebP." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = createHash("sha256").update(buffer).digest("hex");

  // Verifica duplicata
  const existing = await prisma.receipt.findUnique({ where: { imageHash: hash } });
  if (existing) {
    return NextResponse.json(
      { receiptId: existing.id, imageUrl: existing.imageUrl, duplicate: true },
      { status: 200 }
    );
  }

  const blob = await put(`receipts/${hash}.${file.type.split("/")[1]}`, buffer, {
    access: "public",
    contentType: file.type,
  });

  const receipt = await prisma.receipt.create({
    data: { imageUrl: blob.url, imageHash: hash },
  });

  return NextResponse.json({ receiptId: receipt.id, imageUrl: blob.url }, { status: 201 });
}
