import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const user = await getCurrentUser();

    // Se admin, permite ver todos ou filtrar por status (usado no KDS)
    if (user?.role === "admin") {
      const where: Record<string, unknown> = {};
      if (status) where.status = status;

      const orders = await prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orders);
    }

    // Se cliente normal, retorna apenas os pedidos dele
    if (user) {
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orders);
    }

    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      orderType,
      channel = "APP",
      paymentMethod,
      paymentStatus = "PENDING",
      changeFor,
      deliveryAddress,
      notes,
      couponCode,
      items,
    } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Dados incompletos para criação do pedido." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    // 1. Cálculo sequencial do número do pedido legível (101, 102...)
    const lastOrder = await prisma.order.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 101;

    // 2. Cálculo do subtotal dos itens
    let subtotal = 0;
    interface OrderItemCreate {
      productId: string;
      productName: string;
      size: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      includedSides: string | null;
      addedSides: string | null;
      observations: string | null;
    }
    const formattedItems: OrderItemCreate[] = [];

    for (const item of items) {
      const addedSidesPrice = (item.addedSides || []).reduce(
        (sum: number, s: { price: number }) => sum + s.price,
        0
      );
      const unitTotal = item.unitPrice + addedSidesPrice;
      const itemTotal = unitTotal * item.quantity;
      subtotal += itemTotal;

      formattedItems.push({
        productId: item.productId,
        productName: item.name,
        size: item.size || "UNICO",
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
        includedSides: item.includedSides ? JSON.stringify(item.includedSides) : null,
        addedSides: item.addedSides ? JSON.stringify(item.addedSides) : null,
        observations: item.observations || null,
      });
    }

    // 3. Aplicação do cupom de desconto (máximo 1 por pedido, sem acumular)
    let discount = 0;
    let validCouponId: string | null = null;
    let isFreeShippingCoupon = false;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && !coupon.isUsed && new Date() <= coupon.expiresAt) {
        validCouponId = coupon.id;
        const type = (coupon.discountType || "").toUpperCase();

        if (type === "PERCENT" || type === "PERCENTAGE") {
          discount = (subtotal * coupon.discountValue) / 100;
        } else if (
          type === "FIXED" ||
          type.startsWith("FIXED_") ||
          type === "FREE_MEAL_P"
        ) {
          discount = Math.min(coupon.discountValue, subtotal);
        } else if (type === "FREE_SHIPPING" || type === "FIXED_FREE_SHIPPING") {
          isFreeShippingCoupon = true;
        }
      }
    }

    // 4. Taxa de entrega fixa: R$ 5,00 (ou 0 se retirada no balcão ou cupom frete grátis)
    const deliveryFee = orderType === "PICKUP" || isFreeShippingCoupon ? 0 : 5.0;

    const total = Math.max(0, subtotal - discount + deliveryFee);
    const pointsEarned = Math.floor(total); // R$ 1 = 1 ponto

    // Validação de troco para pagamento em dinheiro
    let parsedChangeFor: number | null = null;
    if (paymentMethod === "CASH" && changeFor !== null && changeFor !== undefined && changeFor !== "") {
      const val = typeof changeFor === "number" ? changeFor : parseFloat(String(changeFor).replace(",", "."));
      if (isNaN(val) || val < total) {
        return NextResponse.json(
          {
            error: `O valor informado para troco (R$ ${isNaN(val) ? 0 : val.toFixed(2)}) deve ser maior ou igual ao total do pedido (R$ ${total.toFixed(2)}).`,
          },
          { status: 400 }
        );
      }
      parsedChangeFor = val;
    }

    // 5. Criação do pedido no banco de dados via transação
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: nextOrderNumber,
          userId: user?.id || null,
          customerName,
          customerPhone: customerPhone.replace(/\D/g, ""),
          orderType: orderType || "DELIVERY",
          channel: channel || "APP",
          status: "AGUARDANDO",
          paymentMethod: paymentMethod || "PIX",
          paymentStatus: paymentStatus || (paymentMethod === "PIX" ? "PAID" : "PENDING"),
          subtotal,
          deliveryFee,
          discount,
          total,
          changeFor: parsedChangeFor,
          couponCode: couponCode || null,
          deliveryAddress: deliveryAddress || null,
          notes: notes || null,
          pointsEarned,
          items: {
            create: formattedItems,
          },
        },
        include: { items: true },
      });

      // Marca o cupom como utilizado se for cupom de uso único
      if (validCouponId) {
        await tx.coupon.update({
          where: { id: validCouponId },
          data: { isUsed: true },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      order: createdOrder,
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar pedido." },
      { status: 500 }
    );
  }
}
