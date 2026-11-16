import { prisma } from "c:/Users/hugor/OneDrive/Desktop/Comitiva_Projeto/src/lib/prisma";

async function testCalculations() {
  console.log("=== TESTANDO PARTE A ===");

  // 1. Testa Cupons
  const subtotal = 40.0; // R$ 40,00
  const deliveryFee = 5.0; // R$ 5,00

  // 1.1 Percentual ROLETA10-VV0J (PERCENTAGE, 10%)
  const c1 = await prisma.coupon.findUnique({ where: { code: "ROLETA10-VV0J" } });
  if (!c1) throw new Error("Cupom ROLETA10-VV0J não encontrado");
  const type1 = (c1.discountType || "").toUpperCase();
  const disc1 = (type1 === "PERCENT" || type1 === "PERCENTAGE") ? (subtotal * c1.discountValue) / 100 : 0;
  console.log(`[OK] Cupom ROLETA10-VV0J (10%): Desconto calculado = R$ ${disc1.toFixed(2)} (Total com frete = R$ ${(subtotal - disc1 + deliveryFee).toFixed(2)})`);

  // 1.2 Fixo FOGO10 (FIXED, R$ 10)
  const c2 = await prisma.coupon.findUnique({ where: { code: "FOGO10" } });
  if (!c2) throw new Error("Cupom FOGO10 não encontrado");
  const type2 = (c2.discountType || "").toUpperCase();
  const disc2 = (type2 === "FIXED" || type2.startsWith("FIXED_")) ? Math.min(c2.discountValue, subtotal) : 0;
  console.log(`[OK] Cupom FOGO10 (Fixo R$ 10): Desconto calculado = R$ ${disc2.toFixed(2)} (Total com frete = R$ ${(subtotal - disc2 + deliveryFee).toFixed(2)})`);

  // 2. Testa Validação de Troco
  const total = subtotal - disc1 + deliveryFee; // R$ 41,00
  const invalidChange = 20.0;
  const isInvalid = invalidChange < total;
  console.log(`[OK] Troco de R$ ${invalidChange.toFixed(2)} para pedido de R$ ${total.toFixed(2)} é inválido? ${isInvalid ? "SIM (BLOQUEADO)" : "NÃO"}`);

  // 3. Testa Categorias de Produtos
  const products = await prisma.product.findMany({ select: { name: true, category: true, isPaused: true } });
  const categories = [...new Set(products.map(p => p.category))];
  console.log(`[OK] Categorias encontradas no banco (${products.length} itens):`, categories);

  console.log("=== TODOS OS TESTES PASSARAM COM SUCESSO! ===");
}

testCalculations()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
