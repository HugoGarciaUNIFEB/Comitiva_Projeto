import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "today";

    // Define o intervalo de data conforme o filtro
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    if (period === "yesterday") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    } else if (period === "7days") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0);
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }

    // Busca pedidos do período
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "CANCELADO" },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // 1. Faturamento Bruto e Total de Pedidos
    const totalOrders = orders.length;
    const grossRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
    const averageTicket = totalOrders > 0 ? grossRevenue / totalOrders : 0;

    // 2. Curva de Pedidos por Horário Real (cobre os horários reais sem empilhar em 14:00)
    const slotMap: Record<string, number> = {};

    // Inicializa a faixa central do almoço caipira (10h30 às 13h30)
    const baseLunchSlots = ["10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30"];
    baseLunchSlots.forEach((s) => {
      slotMap[s] = 0;
    });

    let peakSlot = "";
    let peakCount = 0;

    orders.forEach((ord) => {
      const orderDate = new Date(ord.createdAt);
      const h = orderDate.getHours();
      const m = orderDate.getMinutes();
      const slotKey = `${String(h).padStart(2, "0")}:${m < 30 ? "00" : "30"}`;

      slotMap[slotKey] = (slotMap[slotKey] || 0) + 1;
    });

    // Ordena os horários cronologicamente
    const sortedSlots = Object.keys(slotMap).sort();
    sortedSlots.forEach((slot) => {
      const count = slotMap[slot];
      if (count > peakCount) {
        peakCount = count;
        peakSlot = slot;
      }
    });

    const hourlyChartData = sortedSlots.map((hour) => ({
      hour,
      pedidos: slotMap[hour],
      capacidade: 35, // Capacidade máxima do fogão pantaneiro
    }));

    const peakHourText =
      peakCount > 0
        ? `Pico de pedidos identificado às ${peakSlot} (${peakCount} ${peakCount === 1 ? "marmita" : "marmitas"}).`
        : "Sem volume suficiente no período para determinar horário de pico.";

    // 3. Canais de Entrada
    const channelCounts: Record<string, number> = {
      APP: 0,
      COUNTER: 0,
      WHATSAPP: 0,
      PHONE: 0,
    };
    orders.forEach((o) => {
      const ch = o.channel || "APP";
      channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    });

    const channelsData = [
      {
        name: "App / Web Comitiva",
        key: "APP",
        count: channelCounts["APP"] || 0,
        pct: totalOrders > 0 ? Math.round(((channelCounts["APP"] || 0) / totalOrders) * 100) : 0,
      },
      {
        name: "Balcão Presencial",
        key: "COUNTER",
        count: channelCounts["COUNTER"] || 0,
        pct: totalOrders > 0 ? Math.round(((channelCounts["COUNTER"] || 0) / totalOrders) * 100) : 0,
      },
      {
        name: "WhatsApp & Telefone",
        key: "WHATSAPP",
        count: (channelCounts["WHATSAPP"] || 0) + (channelCounts["PHONE"] || 0),
        pct:
          totalOrders > 0
            ? Math.round((((channelCounts["WHATSAPP"] || 0) + (channelCounts["PHONE"] || 0)) / totalOrders) * 100)
            : 0,
      },
    ];

    // 4. Formas de Pagamento
    const paymentCounts: Record<string, number> = {
      PIX: 0,
      CARD: 0,
      CASH: 0,
    };
    orders.forEach((o) => {
      const pm = o.paymentMethod || "PIX";
      paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;
    });

    const paymentMethodsData = [
      {
        name: "PIX Instantâneo",
        pct: totalOrders > 0 ? Math.round(((paymentCounts["PIX"] || 0) / totalOrders) * 100) : 0,
        count: paymentCounts["PIX"] || 0,
      },
      {
        name: "Cartões Créd/Déb",
        pct: totalOrders > 0 ? Math.round(((paymentCounts["CARD"] || 0) / totalOrders) * 100) : 0,
        count: paymentCounts["CARD"] || 0,
      },
      {
        name: "Dinheiro em Espécie",
        pct: totalOrders > 0 ? Math.round(((paymentCounts["CASH"] || 0) / totalOrders) * 100) : 0,
        count: paymentCounts["CASH"] || 0,
      },
    ];

    // 5. Ranking de Pratos Mais Vendidos (apenas Marmitas) e Ranking de Adicionais
    const dishMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    const addonsMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    const sidesMap: Record<string, number> = {};

    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const isMarmita =
          item.product?.category === "marmita" ||
          (!item.product?.category &&
            !["refrigerante", "suco", "água", "doce", "pudim", "ovo frito", "porção"].some((k) =>
              item.productName.toLowerCase().includes(k)
            ));

        if (isMarmita) {
          if (!dishMap[item.productName]) {
            dishMap[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
          }
          dishMap[item.productName].quantity += item.quantity;
          dishMap[item.productName].revenue += item.totalPrice;
        } else {
          if (!addonsMap[item.productName]) {
            addonsMap[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
          }
          addonsMap[item.productName].quantity += item.quantity;
          addonsMap[item.productName].revenue += item.totalPrice;
        }

        // Guarnições inclusas
        if (item.includedSides) {
          try {
            const parsedSides: string[] = JSON.parse(item.includedSides);
            parsedSides.forEach((side) => {
              sidesMap[side] = (sidesMap[side] || 0) + item.quantity;
            });
          } catch {
            // Se formato simples
          }
        }
      });
    });

    const totalUnitsSold = Object.values(dishMap).reduce((sum, d) => sum + d.quantity, 0);

    const topDishes = Object.values(dishMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((d) => ({
        name: d.name,
        quantity: d.quantity,
        revenue: d.revenue,
        pct: totalUnitsSold > 0 ? Math.round((d.quantity / totalUnitsSold) * 100) : 0,
      }));

    const topAddons = Object.values(addonsMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((d) => ({
        name: d.name,
        quantity: d.quantity,
        revenue: d.revenue,
      }));

    // 6. Guarnições Favoritas
    const favoriteSides = Object.entries(sidesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        pct: totalUnitsSold > 0 ? Math.min(100, Math.round((count / totalUnitsSold) * 100)) : 0,
      }));

    // Tempo médio de despacho real baseado em pedidos entregues
    const deliveredOrders = orders.filter((o) => o.status === "ENTREGUE");
    const avgDispatchMinutes = deliveredOrders.length > 0
      ? Math.round(
          deliveredOrders.reduce((sum, o) => {
            const diff = (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) / 60000;
            return sum + Math.max(1, diff);
          }, 0) / deliveredOrders.length
        )
      : 0;

    return NextResponse.json({
      period,
      peakHourText,
      totalUnitsSold,
      kpis: {
        grossRevenue,
        totalOrders,
        averageTicket,
        avgDispatchMinutes,
        dailyTarget: totalOrders > 0 ? Math.max(30, totalOrders) : 0,
      },
      hourlyChart: hourlyChartData,
      channels: channelsData,
      paymentMethods: paymentMethodsData,
      topDishes,
      topAddons,
      favoriteSides,
    });
  } catch (error) {
    console.error("Erro ao gerar relatórios admin:", error);
    return NextResponse.json({ error: "Erro ao compilar relatórios." }, { status: 500 });
  }
}
