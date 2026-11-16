import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { createAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { name, whatsapp, password } = parsed.data;

    // Verifica se já existe usuário cadastrado com este WhatsApp
    const existing = await prisma.user.findUnique({
      where: { whatsapp },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma conta cadastrada com este número de WhatsApp." },
        { status: 409 }
      );
    }

    // Hash da senha com bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo cliente com 1 giro de boas-vindas grátis
    const newUser = await prisma.user.create({
      data: {
        name,
        whatsapp,
        password: hashedPassword,
        role: "cliente",
        welcomeSpins: 1, // 1 giro de boas-vindas adicional conforme regra de negócio
        points: 0,
      },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        role: true,
        points: true,
        welcomeSpins: true,
      },
    });

    // Gera o token JWT
    const token = await createAuthToken({
      sub: newUser.id,
      whatsapp: newUser.whatsapp,
      role: newUser.role,
      name: newUser.name,
    });

    // Define cookie HttpOnly
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: "/",
    });

    return NextResponse.json({
      message: "Conta criada com sucesso! Você ganhou 1 giro grátis na Roleta da Sorte.",
      user: newUser,
      welcomeBonus: true,
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao realizar cadastro." },
      { status: 500 }
    );
  }
}
