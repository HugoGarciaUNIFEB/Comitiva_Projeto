import { prisma } from "c:/Users/hugor/OneDrive/Desktop/Comitiva_Projeto/src/lib/prisma";

async function run() {
  const expiry = new Date(Date.now() + 86400000 * 7);

  await prisma.coupon.upsert({
    where: { code: "PROMO10" },
    update: { isUsed: false, discountType: "PERCENT", discountValue: 10, expiresAt: expiry, userId: null },
    create: { code: "PROMO10", description: "10% de desconto teste", discountType: "PERCENT", discountValue: 10, expiresAt: expiry }
  });

  await prisma.coupon.upsert({
    where: { code: "FOGO10" },
    update: { isUsed: false, discountType: "FIXED", discountValue: 10, expiresAt: expiry, userId: null },
    create: { code: "FOGO10", description: "R$ 10 de desconto fixo teste", discountType: "FIXED", discountValue: 10, expiresAt: expiry }
  });

  await prisma.coupon.updateMany({
    where: { code: "ROLETA10-VV0J" },
    data: { isUsed: false, userId: null, expiresAt: expiry }
  });

  console.log("Cupons configurados com sucesso!");
  const coupons = await prisma.coupon.findMany();
  console.log(coupons);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
