import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Código do cupom inválido." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Cupom não encontrado ou inválido." },
        { status: 404 }
      );
    }

    if (coupon.isUsed) {
      return NextResponse.json(
        { error: "Este cupom já foi utilizado." },
        { status: 400 }
      );
    }

    if (new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { error: "Este cupom expirou." },
        { status: 400 }
      );
    }

    // Se o cupom está vinculado a um usuário específico, verifica se é o usuário logado
    const currentUser = await getCurrentUser();
    if (coupon.userId && (!currentUser || currentUser.id !== coupon.userId)) {
      return NextResponse.json(
        { error: "Este cupom é exclusivo e intransferível de outro usuário." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Erro na validação do cupom:", error);
    return NextResponse.json({ error: "Erro ao validar cupom." }, { status: 500 });
  }
}
