import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromCookie } from "@/lib/auth";

// Determina o início do dia no fuso horário de São Paulo (UTC-3)
function getSaoPauloDayRange() {
  const now = new Date();
  // Ajuste aproximado para UTC-3
  const spOffset = -3 * 60;
  const localNow = new Date(now.getTime() + (now.getTimezoneOffset() + spOffset) * 60000);
  
  const startOfDay = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), 0, 0, 0);
  const endOfDay = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), 23, 59, 59, 999);
  
  // Reverte para UTC
  const startOfDayUtc = new Date(startOfDay.getTime() - (now.getTimezoneOffset() + spOffset) * 60000);
  const endOfDayUtc = new Date(endOfDay.getTime() - (now.getTimezoneOffset() + spOffset) * 60000);

  return { startOfDayUtc, endOfDayUtc };
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUserFromCookie(request);
    if (!authUser) {
      return NextResponse.json({
        authenticated: false,
        canSpin: false,
        hasWelcomeSpin: false,
        canDailySpin: false,
        spinsLeft: 0,
        message: "Faça login para girar a Roleta Caipira.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        coupons: {
          where: {
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const { startOfDayUtc, endOfDayUtc } = getSaoPauloDayRange();

    // Checa se já fez giro diário hoje
    const todayDailySpin = await prisma.rouletteSpin.findFirst({
      where: {
        userId: user.id,
        isWelcomeSpin: false,
        createdAt: {
          gte: startOfDayUtc,
          lte: endOfDayUtc,
        },
      },
    });

    const canDailySpin = !todayDailySpin;
    const hasWelcomeSpin = (user.welcomeSpins || 0) > 0;
    const spinsLeft = (canDailySpin ? 1 : 0) + (hasWelcomeSpin ? 1 : 0);

    return NextResponse.json({
      authenticated: true,
      userName: user.name,
      canSpin: spinsLeft > 0,
      hasWelcomeSpin,
      canDailySpin,
      spinsLeft,
      activeCoupon: user.coupons[0] || null,
      todaySpinDone: !canDailySpin,
    });
  } catch (error) {
    console.error("Erro ao consultar status da roleta:", error);
    return NextResponse.json({ error: "Falha ao verificar status da roleta." }, { status: 500 });
  }
}
