import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isApi = path.startsWith("/api/");
  const isAuthApi = path.startsWith("/api/auth/");
  const isLoginPage = path === "/login";

  // Login e seus endpoints sempre acessíveis
  if (isAuthApi || isLoginPage) return NextResponse.next();

  // Modo demo = ausência de ADMIN_PASSWORD/APP_TOKEN
  // (na instância pública essas vars não são setadas)
  const hasAuth = !!process.env.ADMIN_PASSWORD && !!process.env.APP_TOKEN;

  if (!hasAuth) {
    if (isApi && request.method !== "GET") {
      return NextResponse.json(
        { error: "Modo demonstração: dados somente leitura" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Modo privado — exige cookie (definido pelo login) ou header (backward compat)
  const cookieToken = request.cookies.get("auth")?.value;
  const headerToken = request.headers.get("x-api-token");
  const authenticated =
    (cookieToken && cookieToken === process.env.APP_TOKEN) ||
    (headerToken && headerToken === process.env.APP_TOKEN);

  if (!authenticated) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|sw.js|workbox-).*)",
  ],
};
