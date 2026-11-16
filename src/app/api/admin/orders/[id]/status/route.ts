import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["AGUARDANDO", "NO_FOGAO", "PRONTO", "EM_ROTA", "ENTREGUE", "CANCELADO"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    // Apenas pedidos de entrega com endereço válido podem entrar Em Rota
    if (status === "EM_ROTA") {
      const hasDeliveryAddress = Boolean(
        currentOrder.deliveryAddress &&
        currentOrder.deliveryAddress.trim() !== "" &&
        !currentOrder.deliveryAddress.toLowerCase().includes("retirada no balcão")
      );
      const isDelivery = currentOrder.orderType === "DELIVERY" && hasDeliveryAddress;

      if (!isDelivery) {
        return NextResponse.json(
          { error: "Apenas pedidos de Delivery com endereço podem entrar Em Rota." },
          { status: 400 }
        );
      }
    }

    // Se o pedido estiver sendo marcado como ENTREGUE e ainda não estava entregue nem cancelado
    const isNowDelivered = status === "ENTREGUE" && currentOrder.status !== "ENTREGUE";

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
      });

      // Se for entregue e houver usuário vinculado, credita os pontos do pedido
      if (isNowDelivered && currentOrder.userId && currentOrder.pointsEarned > 0) {
        await tx.user.update({
          where: { id: currentOrder.userId },
          data: {
            points: { increment: currentOrder.pointsEarned },
          },
        });

        await tx.loyaltyTransaction.create({
          data: {
            userId: currentOrder.userId,
            points: currentOrder.pointsEarned,
            type: "ORDER_EARN",
            description: `Pontos do Pedido #${currentOrder.orderNumber} (+${currentOrder.pointsEarned} pts)`,
            orderId: currentOrder.id,
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      message: `Status do pedido #${updatedOrder.orderNumber} atualizado para ${status}.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido no KDS:", error);
    return NextResponse.json({ error: "Erro ao atualizar status do pedido." }, { status: 500 });
  }
}
