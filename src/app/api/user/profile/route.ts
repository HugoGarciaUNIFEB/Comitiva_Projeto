import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        coupons: {
          where: { isUsed: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 15,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        addresses: {
          orderBy: { isDefault: "desc" },
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json(fullUser);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro ao buscar perfil." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const { name, email } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: "Nome deve ter ao menos 3 caracteres." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        email: email ? email.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dados atualizados com sucesso!",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        whatsapp: updated.whatsapp,
        points: updated.points,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}
