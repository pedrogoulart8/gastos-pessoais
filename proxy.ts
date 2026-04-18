import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Rotas da API exigem o header x-api-token
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const token = request.headers.get("x-api-token");
    if (token !== process.env.APP_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
