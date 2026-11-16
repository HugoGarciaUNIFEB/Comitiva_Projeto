import { prisma } from "@/lib/prisma";

async function main() {
  // Corrige pedido #128: lançado no PDV como Retirada sem endereço
  await prisma.order.updateMany({
    where: { orderNumber: 128 },
    data: {
      orderType: "PICKUP",
      deliveryAddress: null,
      deliveryFee: 0.0,
      total: 27.0,
    },
  });

  // Corrige pedidos #130 e #131 com endereços reais variados
  await prisma.order.updateMany({
    where: { orderNumber: 130 },
    data: {
      deliveryAddress: "Rua Sete de Setembro, 210 - Centro, Jaborandi - SP",
    },
  });

  await prisma.order.updateMany({
    where: { orderNumber: 131 },
    data: {
      deliveryAddress: "Avenida Jaborandi, 450 - Jardim América, Jaborandi - SP",
    },
  });

  const orders = await prisma.order.findMany({
    where: { orderNumber: { in: [128, 130, 131, 132, 133, 134] } },
    select: {
      orderNumber: true,
      orderType: true,
      status: true,
      customerName: true,
      deliveryAddress: true,
      total: true,
    },
  });

  console.log("Updated orders:", JSON.stringify(orders, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
