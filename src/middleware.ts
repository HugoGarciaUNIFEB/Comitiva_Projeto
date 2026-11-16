import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "comitiva_fogo_de_chao_super_secret_jwt_key_2026_segura"
);

const AUTH_COOKIE_NAME = "comitiva_auth_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let decodedUser: { role?: string; sub?: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decodedUser = payload as { role?: string; sub?: string };
    } catch {
      decodedUser = null;
    }
  }

  // 1. Proteção das rotas administrativas /admin/*
  if (pathname.startsWith("/admin")) {
    if (!decodedUser || decodedUser.role !== "admin") {
      const url = new URL("/login", request.url);
      url.searchParams.set("error", "unauthorized");
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 2. Redirecionamento se usuário já logado tentar acessar tela de login ou cadastro
  if (pathname === "/login" || pathname === "/cadastro") {
    if (decodedUser) {
      if (decodedUser.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/cadastro"],
};
