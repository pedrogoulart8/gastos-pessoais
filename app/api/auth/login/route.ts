import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const password = (body as { password?: unknown }).password;

  const adminPassword = process.env.ADMIN_PASSWORD;
  const appToken = process.env.APP_TOKEN;

  if (!adminPassword || !appToken) {
    return NextResponse.json(
      { error: "Servidor mal configurado" },
      { status: 500 }
    );
  }

  if (typeof password !== "string") {
    return NextResponse.json({ error: "Senha inválida" }, { status: 400 });
  }

  const provided = Buffer.from(password);
  const expected = Buffer.from(adminPassword);
  const valid =
    provided.length === expected.length && timingSafeEqual(provided, expected);

  if (!valid) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("auth", appToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
