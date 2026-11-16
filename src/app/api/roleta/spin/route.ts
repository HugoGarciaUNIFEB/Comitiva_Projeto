import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromCookie } from "@/lib/auth";

// Determina o intervalo do dia em São Paulo
function getSaoPauloDayRange() {
  const now = new Date();
  const spOffset = -3 * 60;
  const localNow = new Date(now.getTime() + (now.getTimezoneOffset() + spOffset) * 60000);
  
  const startOfDay = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), 0, 0, 0);
  const endOfDay = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate(), 23, 59, 59, 999);
  
  const startOfDayUtc = new Date(startOfDay.getTime() - (now.getTimezoneOffset() + spOffset) * 60000);
  const endOfDayUtc = new Date(endOfDay.getTime() - (now.getTimezoneOffset() + spOffset) * 60000);

  return { startOfDayUtc, endOfDayUtc, localHour: localNow.getHours() };
}

// Calcula validade até as 13:00 de SP (hoje ou amanhã se passado das 13h)
function calculateCouponExpiry(): Date {
  const now = new Date();
  // 13:00 em Brasília (UTC-3) corresponde a 16:00 UTC
  const spHour = (now.getUTCHours() - 3 + 24) % 24;
  const target = new Date(now);

  if (spHour >= 13) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  target.setUTCHours(16, 0, 0, 0);
  return target;
}

// Tipos de prêmios com probabilidades e ângulos da roleta
// Roda dividida em 8 fatias de 45° cada
// Ângulo central de parada no ponteiro do topo (0°/360°)
interface PrizeConfig {
  id: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_FREE_SHIPPING" | "POINTS" | "FIXED_MEAL_P";
  value: number;
  probability: number; // Porcentagem (0 a 100)
  targetAngle: number; // Ângulo para alinhar a fatia com o ponteiro do topo
  description: string;
}

const PRIZES: PrizeConfig[] = [
  {
    id: "10_OFF",
    name: "10% OFF no Almoço",
    type: "PERCENTAGE",
    value: 10,
    probability: 35,
    targetAngle: 337.5, // Fatias da roleta
    description: "Você ganhou 10% de desconto no almoço de hoje!",
  },
  {
    id: "15_OFF",
    name: "15% OFF no Almoço",
    type: "PERCENTAGE",
    value: 15,
    probability: 25,
    targetAngle: 22.5,
    description: "Você ganhou 15% de desconto no almoço de hoje!",
  },
  {
    id: "FRETE_GRATIS",
    name: "Frete Grátis em Jaborandi",
    type: "FIXED_FREE_SHIPPING",
    value: 5.0,
    probability: 20,
    targetAngle: 202.5,
    description: "Sua marmita quentinha entregue sem custo de frete!",
  },
  {
    id: "50_PONTOS",
    name: "50 Pontos na Fidelidade",
    type: "POINTS",
    value: 50,
    probability: 15,
    targetAngle: 292.5,
    description: "50 pontos creditados na sua conta para trocar por prêmios!",
  },
  {
    id: "MARMITA_P",
    name: "Marmita P Caipira Grátis",
    type: "FIXED_MEAL_P",
    value: 22.0,
    probability: 5,
    targetAngle: 112.5,
    description: "Parabéns! Uma marmita P no fogo a lenha 100% por nossa conta!",
  },
];

// Sorteio ponderado
function rollPrize(): PrizeConfig {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const prize of PRIZES) {
    cumulative += prize.probability;
    if (rand <= cumulative) {
      return prize;
    }
  }
  return PRIZES[0];
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUserFromCookie(request);
    if (!authUser) {
      return NextResponse.json({ error: "Faça login para girar a Roleta." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const { startOfDayUtc, endOfDayUtc } = getSaoPauloDayRange();

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

    // Verifica se pode girar
    const hasWelcomeSpin = (user.welcomeSpins || 0) > 0;
    const canDailySpin = !todayDailySpin;

    if (!hasWelcomeSpin && !canDailySpin) {
      return NextResponse.json(
        { error: "Você já realizou seu giro diário hoje. Volte amanhã para girar novamente!" },
        { status: 400 }
      );
    }

    // Se tiver giro de boas-vindas, consome primeiro ou consome o diário
    const isUsingWelcomeSpin = hasWelcomeSpin;

    // Executa sorteio no servidor
    const prize = rollPrize();
    const expiry = calculateCouponExpiry();

    let couponCode: string | null = null;
    let createdCouponId: string | null = null;

    if (prize.type === "POINTS") {
      // Credita pontos direto no usuário
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            points: { increment: prize.value },
            ...(isUsingWelcomeSpin ? { welcomeSpins: { decrement: 1 } } : {}),
          },
        }),
        prisma.loyaltyTransaction.create({
          data: {
            userId: user.id,
            points: prize.value,
            type: "EARNED",
            description: "Prêmio da Roleta Caipira (+50 Pontos)",
          },
        }),
      ]);
    } else {
      // Cria cupom vinculado ao usuário
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const prefix =
        prize.type === "PERCENTAGE"
          ? `ROLETA${prize.value}`
          : prize.type === "FIXED_FREE_SHIPPING"
          ? "FRETE"
          : "MARMITAP";
      couponCode = `${prefix}-${randomSuffix}`;

      const newCoupon = await prisma.coupon.create({
        data: {
          code: couponCode,
          description: prize.description,
          discountType: prize.type,
          discountValue: prize.value,
          userId: user.id,
          expiresAt: expiry,
          isUsed: false,
        },
      });

      createdCouponId = newCoupon.id;

      if (isUsingWelcomeSpin) {
        await prisma.user.update({
          where: { id: user.id },
          data: { welcomeSpins: { decrement: 1 } },
        });
      }
    }

    // Registra o giro no banco
    await prisma.rouletteSpin.create({
      data: {
        userId: user.id,
        prize: prize.name,
        prizeType: prize.id,
        prizeValue: prize.value,
        couponCode: couponCode,
        isWelcomeSpin: isUsingWelcomeSpin,
      },
    });

    // Retorna para a interface animar a roleta com rotação mínima de 5 voltas (1800°)
    const spinRotations = 1800 + (360 - prize.targetAngle);

    return NextResponse.json({
      success: true,
      prize: {
        id: prize.id,
        name: prize.name,
        type: prize.type,
        value: prize.value,
        description: prize.description,
        targetAngle: prize.targetAngle,
        spinRotations,
      },
      couponCode,
      validUntil: expiry.toISOString(),
      wasWelcomeSpin: isUsingWelcomeSpin,
    });
  } catch (error) {
    console.error("Erro ao girar a roleta:", error);
    return NextResponse.json({ error: "Falha ao processar giro da roleta." }, { status: 500 });
  }
}
