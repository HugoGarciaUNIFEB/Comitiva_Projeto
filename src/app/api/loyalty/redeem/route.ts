import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUserFromCookie(request);
    if (!authUser) {
      return NextResponse.json({ error: "Faça login para resgatar prêmios." }, { status: 401 });
    }

    const body = await request.json();
    const { rewardId } = body;

    if (!rewardId) {
      return NextResponse.json({ error: "Recompensa não informada." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      return NextResponse.json({ error: "Recompensa não disponível." }, { status: 404 });
    }

    if (user.points < reward.pointsCost) {
      return NextResponse.json(
        {
          error: `Pontos insuficientes. Você possui ${user.points} pts e este prêmio custa ${reward.pointsCost} pts.`,
        },
        { status: 400 }
      );
    }

    // Determina o tipo de desconto com base no prêmio
    let discountType = "FIXED_AMOUNT";
    let discountValue = 10.0;
    const nameLower = reward.title.toLowerCase();

    if (nameLower.includes("frete")) {
      discountType = "FIXED_FREE_SHIPPING";
      discountValue = 5.0;
    } else if (nameLower.includes("marmita p")) {
      discountType = "FIXED_MEAL_P";
      discountValue = 22.0;
    } else if (nameLower.includes("marmita g")) {
      discountType = "FIXED_MEAL_G";
      discountValue = 32.0;
    } else if (nameLower.includes("sobremesa")) {
      discountType = "FIXED_DESSERT";
      discountValue = 6.0;
    } else if (nameLower.includes("bebida")) {
      discountType = "FIXED_BEVERAGE";
      discountValue = 6.0;
    }

    // Gera código de cupom único
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `RESGATE-${suffix}`;

    // Validade: 30 dias
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    // Transação atômica: deduz pontos, registra extrato e cria cupom
    const [updatedUser, newCoupon] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          points: { decrement: reward.pointsCost },
        },
      }),
      prisma.coupon.create({
        data: {
          code,
          description: `Prêmio Tropeiro: ${reward.title}`,
          discountType,
          discountValue,
          userId: user.id,
          expiresAt: validUntil,
          isUsed: false,
        },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          userId: user.id,
          points: reward.pointsCost,
          type: "REWARD_REDEEM",
          description: `Resgate de Prêmio: ${reward.title} (-${reward.pointsCost} pts)`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Prêmio "${reward.title}" resgatado com sucesso!`,
      newBalance: updatedUser.points,
      coupon: {
        code: newCoupon.code,
        discountType: newCoupon.discountType,
        discountValue: newCoupon.discountValue,
        expiresAt: newCoupon.expiresAt,
      },
    });
  } catch (error) {
    console.error("Erro ao resgatar recompensa:", error);
    return NextResponse.json({ error: "Falha ao processar resgate de pontos." }, { status: 500 });
  }
}
