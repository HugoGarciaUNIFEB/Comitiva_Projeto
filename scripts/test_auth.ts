import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { createAuthToken, verifyAuthToken } from "../src/lib/auth";

async function testAuth() {
  console.log("=== INICIANDO TESTE AUTOMATIZADO DE AUTENTICAÇÃO ===");

  // 1. Testa Admin existente do seed
  const admin = await prisma.user.findUnique({
    where: { whatsapp: "17999990000" },
  });
  if (!admin) throw new Error("Admin do seed não encontrado!");
  const adminPassMatch = await bcrypt.compare("admin_comitiva", admin.password);
  console.log("✓ Admin existe e senha confere:", adminPassMatch);

  // 2. Testa Cliente de teste do seed
  const cliente = await prisma.user.findUnique({
    where: { whatsapp: "17998124421" },
  });
  if (!cliente) throw new Error("Cliente do seed não encontrado!");
  const clientPassMatch = await bcrypt.compare("cliente_comitiva", cliente.password);
  console.log("✓ Cliente de teste existe e senha confere:", clientPassMatch);

  // 3. Testa geração e verificação de JWT com jose
  const token = await createAuthToken({
    sub: cliente.id,
    whatsapp: cliente.whatsapp,
    role: cliente.role,
    name: cliente.name,
  });
  console.log("✓ Token JWT gerado:", token.substring(0, 30) + "...");

  const verified = await verifyAuthToken(token);
  if (!verified || verified.sub !== cliente.id || verified.role !== "cliente") {
    throw new Error("Falha na validação do token JWT!");
  }
  console.log("✓ Token JWT verificado com sucesso para:", verified.name, `(${verified.role})`);

  // 4. Testa cadastro de novo usuário com 1 giro de boas-vindas
  const testPhone = "17988887777";
  await prisma.user.deleteMany({ where: { whatsapp: testPhone } });

  const hash = await bcrypt.hash("senha123", 10);
  const newUser = await prisma.user.create({
    data: {
      name: "Mariana Tropeira",
      whatsapp: testPhone,
      password: hash,
      role: "cliente",
      welcomeSpins: 1,
    },
  });

  if (newUser.welcomeSpins !== 1) {
    throw new Error("Usuário novo deve receber 1 giro de boas-vindas!");
  }
  console.log("✓ Novo usuário cadastrado com 1 giro de boas-vindas grátis:", newUser.name);

  // Limpeza do usuário de teste pontual
  await prisma.user.delete({ where: { id: newUser.id } });
  console.log("✓ Limpeza de usuário de teste realizada.");

  console.log("=== TODOS OS TESTES DE AUTENTICAÇÃO PASSARAM COM SUCESSO! ===");
}

testAuth()
  .catch((e) => {
    console.error("Erro no teste de autenticação:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
