import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUserFromCookie(request);
    if (!authUser) {
      return NextResponse.json({ error: "Faça login para acessar o Clube de Vantagens." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        loyaltyTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        orders: {
          where: { status: "ENTREGUE" },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // Busca recompensas ativas no catálogo
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: "asc" },
    });

    // Número de carimbos na cartela: 1 carimbo por pedido entregue (módulo 10 para completar cartelas)
    const deliveredCount = user.orders.length;
    const stampsCount = deliveredCount % 10;

    return NextResponse.json({
      userName: user.name,
      points: user.points,
      stampsCount,
      completedCards: Math.floor(deliveredCount / 10),
      transactions: user.loyaltyTransactions,
      rewards,
    });
  } catch (error) {
    console.error("Erro ao carregar dados de fidelidade:", error);
    return NextResponse.json({ error: "Falha ao carregar dados de fidelidade." }, { status: 500 });
  }
}
