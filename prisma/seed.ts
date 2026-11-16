import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed limpo e seguro do banco de dados Comitiva Fogo de Chão...");

  // 1. Limpeza segura das tabelas na ordem de dependência relacional (sem duplicar registros)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.side.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.rouletteSpin.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log("Banco limpo com sucesso. Criando usuários de teste...");

  // 2. Criação dos Usuários de Teste (Admin e Cliente)
  const hashedAdminPassword = await bcrypt.hash("admin_comitiva", 10);
  const hashedClientePassword = await bcrypt.hash("cliente_comitiva", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador Comitiva",
      whatsapp: "17999990000",
      email: "admin@comitivafogodechao.com.br",
      password: hashedAdminPassword,
      role: "admin",
      points: 500,
      welcomeSpins: 0,
      avatar: "/images/perfil/avatar_padrao.png",
    },
  });

  const cliente = await prisma.user.create({
    data: {
      name: "Tiago Silveira",
      whatsapp: "17998124421",
      email: "tiago.silveira@email.com",
      password: hashedClientePassword,
      role: "cliente",
      points: 180,
      welcomeSpins: 1, // 1 giro adicional de boas-vindas
      avatar: "/images/perfil/avatar_padrao.png",
      addresses: {
        create: [
          {
            street: "Rua Quinze de Novembro",
            number: "382",
            neighborhood: "Centro Histórico",
            reference: "Próximo à Praça da Matriz",
            recipient: "Tiago Silveira",
            phone: "(17) 99812-4421",
            isDefault: true,
          },
          {
            street: "Avenida Jaborandi",
            number: "1050",
            neighborhood: "Jardim América",
            reference: "Ao lado da oficina mecânica",
            recipient: "Tiago Silveira",
            phone: "(17) 99812-4421",
            isDefault: false,
          },
        ],
      },
    },
  });

  console.log(`Usuários criados: Admin (${admin.whatsapp}) e Cliente (${cliente.whatsapp})`);

  // 3. Criação dos Pratos Principais (com fotos locais específicas e guarnições inclusas)
  // Prato do Dia: Costela no Fogo de Chão
  const prodCostela = await prisma.product.create({
    data: {
      name: "Costela no Fogo de Chão c/ Mandioca na Manteiga",
      description: "Costela bovina de corte nobre com 6 horas de braseiro lento no fogo de chão, derretendo com mandioca cozida na manteiga de garrafa e cheiro-verde.",
      imageUrl: "/images/pratos/costela_fogo_chao.jpg",
      category: "marmita",
      isDailySpecial: true,
      isPaused: false,
      fireTime: "6h de brasa lenta",
      servingsLeft: 28,
      sizes: {
        create: [
          { size: "P", price: 22.0, weight: "400 g" },
          { size: "M", price: 27.0, weight: "550 g" },
          { size: "G", price: 32.0, weight: "700 g" },
        ],
      },
      sides: {
        create: [
          { name: "Arroz branco soltinho", type: "INCLUDED", price: 0 },
          { name: "Feijão tropeiro caipira", type: "INCLUDED", price: 0 },
          { name: "Couve refogada no alho", type: "INCLUDED", price: 0 },
          { name: "Farofa crocante da casa", type: "INCLUDED", price: 0 },
        ],
      },
    },
  });

  // Frango Caipira c/ Quiabo
  const prodFrango = await prisma.product.create({
    data: {
      name: "Frango Caipira c/ Quiabo",
      description: "Frango caipira cozido ao molho rico com açafrão da terra, quiabo fresquinho sem baba e tempero verde da horta.",
      imageUrl: "/images/pratos/frango_caipira.jpg",
      category: "marmita",
      isDailySpecial: false,
      isPaused: false,
      fireTime: "3h em panela de ferro",
      servingsLeft: 22,
      sizes: {
        create: [
          { size: "P", price: 18.0, weight: "400 g" },
          { size: "M", price: 22.0, weight: "550 g" },
          { size: "G", price: 26.0, weight: "700 g" },
        ],
      },
      sides: {
        create: [
          { name: "Arroz branco soltinho", type: "INCLUDED", price: 0 },
          { name: "Feijão caipira", type: "INCLUDED", price: 0 },
          { name: "Salada de folhas e tomate", type: "INCLUDED", price: 0 },
          { name: "Farofa caipira", type: "INCLUDED", price: 0 },
        ],
      },
    },
  });

  // Feijoada da Comitiva
  const prodFeijoada = await prisma.product.create({
    data: {
      name: "Feijoada da Comitiva",
      description: "Feijoada completa com carnes nobres curadas e defumadas no fogão a lenha, acompanhada de laranja doce e couve fininha.",
      imageUrl: "/images/pratos/feijoada_comitiva.jpg",
      category: "marmita",
      isDailySpecial: false,
      isPaused: false,
      fireTime: "5h em caldeirão",
      servingsLeft: 35,
      sizes: {
        create: [
          { size: "P", price: 20.0, weight: "400 g" },
          { size: "M", price: 25.0, weight: "550 g" },
          { size: "G", price: 29.0, weight: "700 g" },
        ],
      },
      sides: {
        create: [
          { name: "Arroz branco soltinho", type: "INCLUDED", price: 0 },
          { name: "Couve fininha no alho", type: "INCLUDED", price: 0 },
          { name: "Farofa de bacon", type: "INCLUDED", price: 0 },
          { name: "Fatias de laranja doce", type: "INCLUDED", price: 0 },
        ],
      },
    },
  });

  // Carne de Panela c/ Batata
  const prodCarne = await prisma.product.create({
    data: {
      name: "Carne de Panela c/ Batata",
      description: "Pedaços macios de carne bovina dourados e cozidos com batatas coradas no molho encorpado e aromático caipira.",
      imageUrl: "/images/pratos/carne_panela.jpg",
      category: "marmita",
      isDailySpecial: false,
      isPaused: false,
      fireTime: "3h30 em fogo brando",
      servingsLeft: 19,
      sizes: {
        create: [
          { size: "P", price: 19.0, weight: "400 g" },
          { size: "M", price: 23.0, weight: "550 g" },
          { size: "G", price: 27.0, weight: "700 g" },
        ],
      },
      sides: {
        create: [
          { name: "Arroz branco soltinho", type: "INCLUDED", price: 0 },
          { name: "Feijão carioca", type: "INCLUDED", price: 0 },
          { name: "Salada fresca", type: "INCLUDED", price: 0 },
          { name: "Farofa temperada", type: "INCLUDED", price: 0 },
        ],
      },
    },
  });

  // 4. Complementos / Adicionais
  await prisma.product.create({
    data: {
      name: "Torresmo Crocante",
      description: "Porção individual de torresmo pururuca sequinho e estalando de crocante.",
      imageUrl: "/images/complementos/torresmo.jpg",
      category: "complemento",
      sizes: { create: [{ size: "UNICO", price: 5.0, weight: "120 g" }] },
    },
  });

  await prisma.product.create({
    data: {
      name: "Ovo Frito Caipira da Fazenda",
      description: "Ovo caipira de gema mole dourado na manteiga com pitada de cheiro-verde.",
      imageUrl: "/images/complementos/ovo_frito.jpg",
      category: "complemento",
      sizes: { create: [{ size: "UNICO", price: 3.0, weight: "1 unidade" }] },
    },
  });

  await prisma.product.create({
    data: {
      name: "Vinagrete Extra da Casa",
      description: "Tomate, cebola e cheiro-verde picadinhos no azeite e vinagre suave.",
      imageUrl: "/images/complementos/vinagrete.jpg",
      category: "complemento",
      sizes: { create: [{ size: "UNICO", price: 2.0, weight: "100 g" }] },
    },
  });

  // 5. Bebidas
  await prisma.product.create({
    data: {
      name: "Refrigerante em Lata (350ml)",
      description: "Coca-Cola, Guaraná Antarctica ou Fanta bem gelados.",
      imageUrl: "/images/bebidas/refrigerante.jpg",
      category: "bebida",
      sizes: { create: [{ size: "UNICO", price: 6.0, weight: "350 ml" }] },
    },
  });

  await prisma.product.create({
    data: {
      name: "Suco Natural da Fruta (500ml)",
      description: "Laranja espremida na hora, 100% fruta sem adição de água.",
      imageUrl: "/images/bebidas/suco_laranja.jpg",
      category: "bebida",
      sizes: { create: [{ size: "UNICO", price: 7.0, weight: "500 ml" }] },
    },
  });

  await prisma.product.create({
    data: {
      name: "Água Mineral (500ml)",
      description: "Com ou sem gás, límpida e refrescante.",
      imageUrl: "/images/bebidas/agua.jpg",
      category: "bebida",
      sizes: { create: [{ size: "UNICO", price: 3.0, weight: "500 ml" }] },
    },
  });

  // 6. Sobremesas
  await prisma.product.create({
    data: {
      name: "Doce de Leite Caseiro com Queijo",
      description: "Doce de leite pastoso apurado lentamente no tacho de cobre com fatia de queijo minas curado.",
      imageUrl: "/images/sobremesas/doce_leite.jpg",
      category: "sobremesa",
      sizes: { create: [{ size: "UNICO", price: 6.0, weight: "150 g" }] },
    },
  });

  await prisma.product.create({
    data: {
      name: "Pudim de Leite Condensado Caipira",
      description: "Pudim cremoso sem furinhos com calda dourada de caramelo artesanal.",
      imageUrl: "/images/sobremesas/pudim.jpg",
      category: "sobremesa",
      sizes: { create: [{ size: "UNICO", price: 7.0, weight: "120 g" }] },
    },
  });

  // 7. Catálogo da Loja de Prêmios (Fidelidade)
  await prisma.reward.createMany({
    data: [
      {
        title: "Sobremesa do Tacho Grátis",
        description: "Troque seus pontos por um Doce de Leite caseiro ou Pudim.",
        pointsCost: 100,
        rewardType: "DESSERT",
      },
      {
        title: "Bebida Gelada Grátis",
        description: "Refrigerante lata ou Suco Natural 500ml no capricho.",
        pointsCost: 120,
        rewardType: "BEVERAGE",
      },
      {
        title: "Marmita P Completa Grátis",
        description: "Uma marmita tamanho P à sua escolha no cardápio do dia.",
        pointsCost: 300,
        rewardType: "MEAL_P",
      },
      {
        title: "Marmita G de Respeito Grátis",
        description: "Uma marmita tamanho G de 700g para matar qualquer fome.",
        pointsCost: 450,
        rewardType: "MEAL_G",
      },
      {
        title: "Frete Grátis na Sua Entrega",
        description: "Isenção total da taxa fixa de entrega (R$ 5,00) em Jaborandi.",
        pointsCost: 80,
        rewardType: "FREE_SHIPPING",
      },
    ],
  });

  // 8. Cupom de Exemplo para o Cliente
  const today13h = new Date();
  today13h.setHours(13, 0, 0, 0);
  if (today13h < new Date()) {
    today13h.setDate(today13h.getDate() + 1);
  }

  await prisma.coupon.create({
    data: {
      code: "ROLETA15",
      description: "15% de desconto ganho na Roleta da Sorte",
      discountType: "PERCENT",
      discountValue: 15.0,
      userId: cliente.id,
      isUsed: false,
      expiresAt: today13h,
    },
  });

  // 9. Histórico de Pontos Inicial
  await prisma.loyaltyTransaction.createMany({
    data: [
      {
        userId: cliente.id,
        points: 50,
        type: "CREDIT",
        description: "Prêmio conquistado na Roleta Caipira da Sorte",
      },
      {
        userId: cliente.id,
        points: 32,
        type: "CREDIT",
        description: "Pontos do Pedido #100 entregue",
      },
      {
        userId: cliente.id,
        points: 98,
        type: "CREDIT",
        description: "Pontos acumulados em pedidos presenciais",
      },
    ],
  });

  // 10. Histórico de Pedidos de Demonstração (Últimos 7 dias, horários entre 10h30 e 13h00)
  console.log("Criando histórico de pedidos de demonstração dos últimos 7 dias para o Dashboard...");

  const demoOrdersData = [
    // Dia 6 atrás
    { daysAgo: 6, hour: 10, min: 40, customer: "Seu Agenor (Oficina)", phone: "17998243310", type: "DELIVERY", channel: "WHATSAPP", pay: "PIX", prod: prodCostela, size: "M", price: 27.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Farofa crocante da casa"], status: "ENTREGUE" },
    { daysAgo: 6, hour: 11, min: 20, customer: "Tiago Silveira", phone: "17998124421", type: "DELIVERY", channel: "APP", pay: "PIX", prod: prodFeijoada, size: "G", price: 29.0, sides: ["Arroz branco soltinho", "Couve fininha no alho", "Farofa de bacon"], status: "ENTREGUE" },
    { daysAgo: 6, hour: 12, min: 10, customer: "Dona Neusa (Balcão)", phone: "17997425580", type: "COUNTER", channel: "COUNTER", pay: "CASH", prod: prodFrango, size: "M", price: 22.0, sides: ["Arroz branco soltinho", "Feijão caipira", "Salada de folhas e tomate"], status: "ENTREGUE" },
    { daysAgo: 6, hour: 12, min: 45, customer: "Valter Borracharia", phone: "17996541122", type: "PICKUP", channel: "PHONE", pay: "CARD", prod: prodCarne, size: "P", price: 19.0, sides: ["Arroz branco soltinho", "Feijão carioca"], status: "ENTREGUE" },

    // Dia 5 atrás
    { daysAgo: 5, hour: 10, min: 50, customer: "Mariana Costa", phone: "17998112233", type: "DELIVERY", channel: "APP", pay: "PIX", prod: prodCostela, size: "G", price: 32.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Couve refogada no alho"], status: "ENTREGUE" },
    { daysAgo: 5, hour: 11, min: 30, customer: "Carlos Eduardo", phone: "17997234455", type: "COUNTER", channel: "COUNTER", pay: "CASH", prod: prodCostela, size: "M", price: 27.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Farofa crocante da casa"], status: "ENTREGUE" },
    { daysAgo: 5, hour: 12, min: 5, customer: "Breno Retirada", phone: "17998334411", type: "PICKUP", channel: "WHATSAPP", pay: "PIX", prod: prodFeijoada, size: "M", price: 25.0, sides: ["Arroz branco soltinho", "Farofa de bacon"], status: "ENTREGUE" },
    { daysAgo: 5, hour: 12, min: 35, customer: "Fernanda Lima", phone: "17996778899", type: "DELIVERY", channel: "APP", pay: "CARD", prod: prodFrango, size: "M", price: 22.0, sides: ["Arroz branco soltinho", "Feijão caipira", "Farofa caipira"], status: "ENTREGUE" },

    // Dia 4 atrás
    { daysAgo: 4, hour: 10, min: 35, customer: "Lucas Mecânico", phone: "17998776655", type: "DELIVERY", channel: "PHONE", pay: "PIX", prod: prodCarne, size: "M", price: 23.0, sides: ["Arroz branco soltinho", "Feijão carioca", "Farofa temperada"], status: "ENTREGUE" },
    { daysAgo: 4, hour: 11, min: 15, customer: "Tiago Silveira", phone: "17998124421", type: "DELIVERY", channel: "APP", pay: "PIX", prod: prodCostela, size: "M", price: 27.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Couve refogada no alho"], status: "ENTREGUE" },
    { daysAgo: 4, hour: 11, min: 55, customer: "Dona Carmem", phone: "17997112244", type: "COUNTER", channel: "COUNTER", pay: "CASH", prod: prodFrango, size: "G", price: 26.0, sides: ["Arroz branco soltinho", "Feijão caipira", "Farofa caipira"], status: "ENTREGUE" },
    { daysAgo: 4, hour: 12, min: 40, customer: "Roberto Serralheria", phone: "17998554433", type: "DELIVERY", channel: "WHATSAPP", pay: "CARD", prod: prodCostela, size: "P", price: 22.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira"], status: "ENTREGUE" },

    // Dia 3 atrás
    { daysAgo: 3, hour: 10, min: 45, customer: "Juliana Mendes", phone: "17997443322", type: "DELIVERY", channel: "APP", pay: "PIX", prod: prodFeijoada, size: "P", price: 20.0, sides: ["Arroz branco soltinho", "Couve fininha no alho"], status: "ENTREGUE" },
    { daysAgo: 3, hour: 11, min: 25, customer: "Seu Agenor (Oficina)", phone: "17998243310", type: "PICKUP", channel: "WHATSAPP", pay: "CASH", prod: prodCostela, size: "G", price: 32.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Farofa crocante da casa"], status: "ENTREGUE" },
    { daysAgo: 3, hour: 12, min: 0, customer: "Marcos Paulo", phone: "17998998877", type: "COUNTER", channel: "COUNTER", pay: "CARD", prod: prodCarne, size: "M", price: 23.0, sides: ["Arroz branco soltinho", "Feijão carioca"], status: "ENTREGUE" },
    { daysAgo: 3, hour: 12, min: 50, customer: "Patricia Rocha", phone: "17996332211", type: "DELIVERY", channel: "APP", pay: "PIX", prod: prodCostela, size: "M", price: 27.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Couve refogada no alho"], status: "ENTREGUE" },

    // Dia 2 atrás
    { daysAgo: 2, hour: 10, min: 35, customer: "André Farmácia", phone: "17997665544", type: "DELIVERY", channel: "PHONE", pay: "PIX", prod: prodFrango, size: "M", price: 22.0, sides: ["Arroz branco soltinho", "Feijão caipira", "Salada fresca"], status: "ENTREGUE" },
    { daysAgo: 2, hour: 11, min: 10, customer: "Tiago Silveira", phone: "17998124421", type: "DELIVERY", channel: "APP", pay: "PIX", prod: prodCostela, size: "G", price: 32.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Farofa crocante da casa"], status: "ENTREGUE" },
    { daysAgo: 2, hour: 11, min: 45, customer: "Dona Neusa (Balcão)", phone: "17997425580", type: "COUNTER", channel: "COUNTER", pay: "CASH", prod: prodFeijoada, size: "M", price: 25.0, sides: ["Arroz branco soltinho", "Couve fininha no alho"], status: "ENTREGUE" },
    { daysAgo: 2, hour: 12, min: 30, customer: "Valter Borracharia", phone: "17996541122", type: "PICKUP", channel: "WHATSAPP", pay: "CARD", prod: prodCostela, size: "M", price: 27.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira"], status: "ENTREGUE" },

    // Ontem (Dia 1 atrás)
    { daysAgo: 1, hour: 10, min: 40, customer: "Beatriz Nogueira", phone: "17998221133", type: "DELIVERY", channel: "APP", pay: "PIX", prod: prodCostela, size: "M", price: 27.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Farofa crocante da casa"], status: "ENTREGUE" },
    { daysAgo: 1, hour: 11, min: 15, customer: "Carlos Eduardo", phone: "17997234455", type: "DELIVERY", channel: "WHATSAPP", pay: "CARD", prod: prodFeijoada, size: "G", price: 29.0, sides: ["Arroz branco soltinho", "Couve fininha no alho", "Farofa de bacon"], status: "ENTREGUE" },
    { daysAgo: 1, hour: 11, min: 50, customer: "Seu Agenor (Oficina)", phone: "17998243310", type: "COUNTER", channel: "COUNTER", pay: "CASH", prod: prodCarne, size: "G", price: 27.0, sides: ["Arroz branco soltinho", "Feijão carioca", "Farofa temperada"], status: "ENTREGUE" },
    { daysAgo: 1, hour: 12, min: 25, customer: "Mariana Costa", phone: "17998112233", type: "DELIVERY", channel: "APP", pay: "PIX", prod: prodCostela, size: "P", price: 22.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira"], status: "ENTREGUE" },
    { daysAgo: 1, hour: 12, min: 55, customer: "Breno Retirada", phone: "17998334411", type: "PICKUP", channel: "PHONE", pay: "PIX", prod: prodFrango, size: "M", price: 22.0, sides: ["Arroz branco soltinho", "Feijão caipira"], status: "ENTREGUE" },

    // Hoje (Dia 0)
    { daysAgo: 0, hour: 10, min: 35, customer: "Tiago Silveira", phone: "17998124421", type: "DELIVERY", channel: "APP", pay: "PIX", address: "Rua Quinze de Novembro, 382 - Centro Histórico, Jaborandi - SP", prod: prodCostela, size: "G", price: 32.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Farofa crocante da casa"], status: "ENTREGUE" },
    { daysAgo: 0, hour: 11, min: 5, customer: "Dona Neusa (Balcão)", phone: "17997425580", type: "COUNTER", channel: "COUNTER", pay: "CASH", address: null, prod: prodFrango, size: "M", price: 22.0, sides: ["Arroz branco soltinho", "Feijão caipira", "Salada fresca"], status: "ENTREGUE" },
    { daysAgo: 0, hour: 11, min: 30, customer: "Seu Agenor (Oficina)", phone: "17998243310", type: "PICKUP", channel: "COUNTER", pay: "CASH", address: null, prod: prodCostela, size: "M", price: 27.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira", "Farofa crocante da casa"], status: "PRONTO" },
    { daysAgo: 0, hour: 11, min: 50, customer: "Valter Borracharia", phone: "17996541122", type: "PICKUP", channel: "PHONE", pay: "CARD", address: null, prod: prodFeijoada, size: "M", price: 25.0, sides: ["Arroz branco soltinho", "Couve fininha no alho", "Farofa de bacon"], status: "NO_FOGAO" },
    { daysAgo: 0, hour: 12, min: 10, customer: "Carlos Eduardo", phone: "17997234455", type: "DELIVERY", channel: "APP", pay: "PIX", address: "Rua Sete de Setembro, 210 - Centro, Jaborandi - SP", prod: prodCarne, size: "M", price: 23.0, sides: ["Arroz branco soltinho", "Feijão carioca", "Farofa temperada"], status: "NO_FOGAO" },
    { daysAgo: 0, hour: 12, min: 25, customer: "Mariana Costa", phone: "17998112233", type: "DELIVERY", channel: "APP", pay: "PIX", address: "Avenida Jaborandi, 450 - Jardim América, Jaborandi - SP", prod: prodCostela, size: "P", price: 22.0, sides: ["Arroz branco soltinho", "Feijão tropeiro caipira"], status: "AGUARDANDO" },
  ];

  let orderNumberCounter = 101;
  const now = new Date();

  for (const item of demoOrdersData) {
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - item.daysAgo);
    orderDate.setHours(item.hour, item.min, 0, 0);

    const deliveryFee = item.type === "DELIVERY" ? 5.0 : 0.0;
    const subtotal = item.price;
    const total = subtotal + deliveryFee;

    const dispatchOffsetMinutes = item.status === "ENTREGUE" ? 14 : item.status === "PRONTO" ? 11 : 5;
    const updatedDate = new Date(orderDate.getTime() + dispatchOffsetMinutes * 60000);

    await prisma.order.create({
      data: {
        orderNumber: orderNumberCounter++,
        userId: item.customer === "Tiago Silveira" ? cliente.id : null,
        customerName: item.customer,
        customerPhone: item.phone,
        orderType: item.type,
        channel: item.channel,
        status: item.status,
        paymentMethod: item.pay,
        paymentStatus: "PAID",
        subtotal,
        deliveryFee,
        discount: 0.0,
        total,
        changeFor: item.pay === "CASH" ? 50.0 : null,
        deliveryAddress: item.type === "DELIVERY" ? ((item as any).address || "Rua Quinze de Novembro, 382 - Centro Histórico, Jaborandi - SP") : null,
        pointsEarned: Math.floor(total),
        createdAt: orderDate,
        updatedAt: updatedDate,
        items: {
          create: [
            {
              productId: item.prod.id,
              productName: item.prod.name,
              size: item.size,
              unitPrice: item.price,
              quantity: 1,
              totalPrice: item.price,
              includedSides: JSON.stringify(item.sides),
              addedSides: null,
            },
          ],
        },
      },
    });
  }

  console.log(`Criados ${demoOrdersData.length} pedidos de teste distribuídos pelos últimos 7 dias.`);

  console.log("Seed concluído com 100% de sucesso! Todas as imagens locais foram vinculadas.");
}

main()
  .catch((e) => {
    console.error("Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
