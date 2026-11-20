import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getOrderStatusConfig, getOrderStepIndex } from "@/lib/orderStatus";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, whatsapp: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    // Se o usuário não for admin e o pedido pertencer a outro cliente, barra o acesso
    if (user && user.role !== "admin" && order.userId && order.userId !== user.id) {
      return NextResponse.json({ error: "Acesso negado a este pedido." }, { status: 403 });
    }

    const hasAddress = Boolean(
      order.deliveryAddress &&
      order.deliveryAddress.trim() !== "" &&
      !order.deliveryAddress.toLowerCase().includes("retirada no balcão")
    );
    const isDelivery = order.orderType === "DELIVERY" && hasAddress;
    const deliveryType = isDelivery ? ("ENTREGA" as const) : ("RETIRADA" as const);
    const statusConfig = getOrderStatusConfig(order.status, isDelivery);
    const stepIndex = getOrderStepIndex(order.status, isDelivery);

    return NextResponse.json({
      ...order,
      deliveryType,
      addressStreet: isDelivery ? order.deliveryAddress : null,
      statusConfig,
      stepIndex,
    });
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json({ error: "Erro ao buscar detalhes do pedido." }, { status: 500 });
  }
}
