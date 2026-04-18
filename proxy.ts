import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isDemoMode = process.env.DEMO_MODE === "true";
  const isApi = path.startsWith("/api/");
  const isAuthApi = path.startsWith("/api/auth/");
  const isLoginPage = path === "/login";

  // Endpoints de autenticação e página de login são sempre acessíveis
  if (isAuthApi || isLoginPage) return NextResponse.next();

  if (isDemoMode) {
    // Modo demo: GETs públicos, escritas bloqueadas
    if (isApi && request.method !== "GET") {
      return NextResponse.json(
        { error: "Modo demonstração: dados somente leitura" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Modo privado: exige cookie de sessão (definido pelo login) ou header (backward compat)
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
