import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { createAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { whatsapp, password } = parsed.data;

    // Busca usuário pelo WhatsApp
    const user = await prisma.user.findUnique({
      where: { whatsapp },
    });

    if (!user) {
      return NextResponse.json(
        { error: "WhatsApp ou senha incorretos." },
        { status: 401 }
      );
    }

    // Compara o hash da senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "WhatsApp ou senha incorretos." },
        { status: 401 }
      );
    }

    // Gera o token JWT
    const token = await createAuthToken({
      sub: user.id,
      whatsapp: user.whatsapp,
      role: user.role,
      name: user.name,
    });

    // Define cookie HttpOnly
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        whatsapp: user.whatsapp,
        role: user.role,
        points: user.points,
        welcomeSpins: user.welcomeSpins,
      },
      redirectTo: user.role === "admin" ? "/admin" : "/",
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao realizar login." },
      { status: 500 }
    );
  }
}
