import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getOrderChannelLabel } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    // Busca todos os pedidos recentes (hoje e ativos)
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: { name: true, whatsapp: true },
        },
      },
    });

    // Mapeamento enriquecido para o KDS (garante consistência: pedido sem endereço = Retirada)
    const mappedOrders = orders.map((o) => {
      const hasDeliveryAddress = Boolean(
        o.deliveryAddress &&
        o.deliveryAddress.trim() !== "" &&
        !o.deliveryAddress.toLowerCase().includes("retirada no balcão")
      );
      const isDelivery = o.orderType === "DELIVERY" && hasDeliveryAddress;

      return {
        ...o,
        orderType: isDelivery ? "DELIVERY" : "PICKUP",
        deliveryType: isDelivery ? ("ENTREGA" as const) : ("RETIRADA" as const),
        orderOrigin: getOrderChannelLabel(o.channel),
        addressStreet: isDelivery ? o.deliveryAddress : null,
      };
    });

    // Contadores para o KDS
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const aguardando = orders.filter((o) => o.status === "AGUARDANDO");
    const noFogao = orders.filter((o) => o.status === "NO_FOGAO");
    const pronto = orders.filter((o) => o.status === "PRONTO");
    const emRota = orders.filter((o) => o.status === "EM_ROTA");
    const entreguesHoje = orders.filter(
      (o) => o.status === "ENTREGUE" && new Date(o.updatedAt) >= todayStart
    );

    // Marmitas entregues hoje calculadas do banco
    const marmitasEntreguesHoje = entreguesHoje.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Tempo médio de espera/despacho real dos pedidos entregues hoje (em minutos)
    let tempoMedioEspera = 0;
    if (entreguesHoje.length > 0) {
      const totalMinutos = entreguesHoje.reduce((sum, o) => {
        const diff = (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) / (1000 * 60);
        return sum + Math.max(1, Math.round(diff));
      }, 0);
      tempoMedioEspera = Math.round(totalMinutos / entreguesHoje.length);
    }

    return NextResponse.json({
      orders: mappedOrders,
      metrics: {
        totalAtivos: aguardando.length + noFogao.length + pronto.length + emRota.length,
        aguardandoCount: aguardando.length,
        noFogaoCount: noFogao.length,
        prontoCount: pronto.length,
        emRotaCount: emRota.length,
        entreguesCount: entreguesHoje.length,
        marmitasEntreguesHoje,
        tempoMedioEspera,
      },
    });
  } catch (error) {
    console.error("Erro ao carregar pedidos do KDS:", error);
    return NextResponse.json({ error: "Erro ao buscar dados do KDS." }, { status: 500 });
  }
}
