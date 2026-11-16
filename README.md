# 🍲 Comitiva Fogo de Chão — Projeto InovaFood Tech

Aplicação web fullstack para a marmitaria artesanal **Comitiva Fogo de Chão**, desenvolvida como **Projeto Integrador acadêmico (InovaFood Tech)**. O projeto prioriza uma arquitetura enxuta, código limpo, comentado em português e de fácil explicação em bancas avaliadoras, sem uso de Docker ou ferramentas complexas de infraestrutura.

---

## 🚀 Como Rodar o Projeto

O projeto roda exclusivamente com **4 comandos simples** no terminal, utilizando **SQLite** local:

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Executar as migrações do Prisma (cria o banco SQLite prisma/dev.db)
npx prisma migrate dev

# 3. Popular o banco com os dados iniciais (admin, cliente, cardápio, cupons e prêmios)
npx prisma db seed

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para acessar a loja do cliente ou [http://localhost:3000/admin](http://localhost:3000/admin) para o painel administrativo.

---

## 🔑 Credenciais de Teste (Criadas no Seed)

| Papel | WhatsApp (Identificador) | Senha | Acesso |
|---|---|---|---|
| **Administrador** | `17999990000` | `admin_comitiva` | Painel `/admin/*` (KDS, PDV, Cardápio, Relatórios) |
| **Cliente de Teste** | `17998124421` | `cliente_comitiva` | App do Cliente (Cardápio, Roleta, Checkout, Fidelidade) |

> **Nota:** Novos clientes podem se cadastrar diretamente na tela de cadastro (`/cadastro`) e ganham automaticamente **1 giro grátis de boas-vindas** na Roleta da Sorte.

---

## 📁 Estrutura de Diretórios

```
Comitiva_Projeto/
├── prisma/
│   ├── dev.db                 # Banco de dados local SQLite (gerado automaticamente)
│   ├── schema.prisma          # Modelagem de dados relacional (User, Order, Product, etc.)
│   └── seed.ts                # Povoamento inicial com admin, pratos, adicionais e prêmios
├── public/
│   ├── images/                # Fotos locais dos pratos caipiras e elementos visuais
│   └── uploads/               # Diretório para upload de fotos de novos pratos
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/         # Tela 3: Login seguro com JWT em cookie httpOnly
│   │   │   └── cadastro/      # Tela 3: Cadastro com concessão de giro bônus
│   │   ├── admin/
│   │   │   ├── page.tsx       # Telas 1 e 10: KDS (Kanban da Cozinha e Fogão a Lenha)
│   │   │   ├── pdv/           # Tela 2: Atendimento de Balcão, comanda e troco
│   │   │   ├── cardapio/      # Telas 4 e 9: Gestão de estoque, pratos e Pausa Emergencial
│   │   │   └── relatorios/    # Tela 13: Dashboard analítico com gráficos Recharts
│   │   ├── checkout/          # Tela 5: Carrinho, cupom e pagamento PIX simulado
│   │   ├── roleta/            # Tela 14: Roleta Caipira da Sorte com probabilidades
│   │   ├── fidelidade/        # Tela 12: Clube Tropeiro, extrato e loja de resgates
│   │   ├── conta/             # Telas 8 e 11: Perfil, CRUD de endereços e "Pedir Novamente"
│   │   ├── pedidos/[id]/      # Tela 11: Acompanhamento em tempo real (polling 5s)
│   │   ├── sobre/             # Tela 15: História tropeira e mapa de Jaborandi-SP
│   │   ├── api/               # API Routes internas (sem necessidade de Express externo)
│   │   │   ├── auth/          # Login, registro, logout e /me
│   │   │   ├── orders/        # Criação de pedidos e listagem
│   │   │   ├── products/      # Consulta de cardápio e estoque
│   │   │   ├── admin/         # Rotas administrativas restritas (KDS, pausa, relatórios)
│   │   │   ├── roleta/        # Sorteio auditado no servidor
│   │   │   ├── loyalty/       # Consulta de pontos e resgate de prêmios
│   │   │   ├── coupons/       # Validação de cupons
│   │   │   ├── user/          # Perfil e CRUD de endereços
│   │   │   └── upload/        # Upload de imagens para public/uploads
│   │   ├── layout.tsx         # Layout raiz com fontes e ícones Google Material Symbols
│   │   └── page.tsx           # Tela 7: Home & Cardápio com seleção P/M/G
│   ├── components/            # Componentes reutilizáveis da interface
│   │   ├── Header.tsx         # Cabeçalho com carrinho e navegação
│   │   ├── Footer.tsx         # Rodapé institucional
│   │   ├── CartDrawer.tsx     # Gaveta lateral do carrinho de compras
│   │   ├── DishCard.tsx       # Card de prato com tamanhos e guarnições inclusas
│   │   ├── SpecialDishHero.tsx# Banner de destaque do Prato Especial do Dia
│   │   └── AdminSidebar.tsx   # Barra lateral desktop fixa do painel administrativo
│   ├── lib/
│   │   ├── prisma.ts          # Instância singleton do Prisma Client
│   │   ├── auth.ts            # Manipulação de tokens JWT com jose e cookies
│   │   └── store/
│   │       └── useCartStore.ts# Estado global do carrinho via Zustand (com localStorage)
│   └── middleware.ts          # Proteção de rotas administrativas e autenticação
├── .env.example               # Exemplo das variáveis de ambiente necessárias
├── package.json               # Dependências e scripts do projeto
├── tailwind.config.ts         # Configuração de design tokens extraídos do Stitch
└── README.md                  # Este documento
```

---

## 🎨 Identidade Visual (Design Tokens do Stitch)

O visual foi importado e mantido com fidelidade estrita ao projeto do Google Stitch:
- **Fundo:** Creme Claro `#F9F6F0`
- **Primária / Destaque:** Laranja Terracota `#D9531E`
- **Texto / Secundária:** Marrom Rústico `#4A2E2B`
- **Alerta / Selos:** Amarelo Quente `#F2A900`
- **Tipografia:** *Vollkorn* (títulos clássicos) e *Plus Jakarta Sans* (textos e números)
- **Módulo do Cliente:** Mobile-first, acolhedor e responsivo.
- **Painel Admin:** Desktop otimizado para operação rápida de cozinha e caixa.

---

## ⚙️ Regras de Negócio Implementadas

1. **Identificador Único:** Número de WhatsApp (sem exigência de CPF).
2. **Cadastro e Boas-Vindas:** Ao criar conta, o usuário ganha **1 giro grátis bônus** na Roleta Caipira.
3. **Roleta da Sorte:** 1 giro diário por WhatsApp + giros de boas-vindas bônus. Sorteio no servidor com probabilidades exatas:
   - 10% OFF = 35%
   - 15% OFF = 25%
   - Frete Grátis = 20%
   - 50 Pontos = 15%
   - Marmita P Grátis = 5%
4. **Validade dos Cupons:** Cupons da roleta expiram às **13h00 do mesmo dia (Horário de Brasília)**. Giros realizados após as 13h00 são válidos até as 13h00 do dia seguinte.
5. **Programa de Pontos:** Cada R$ 1,00 gasto equivale a **1 ponto**. O crédito é lançado atomicamente no momento em que o pedido é marcado como **"ENTREGUE"** no KDS.
6. **Loja de Prêmios:** Troca de pontos acumulados por sobremesas, bebidas, frete grátis e marmitas P/G.
7. **Pausa Emergencial:** Pratos ou guarnições que esgotarem no fogão a lenha podem ser pausados em 1 clique pelo admin, refletindo no app do cliente em **até 5 segundos** via polling.
8. **Frete:** Taxa fixa de **R$ 5,00** para Jaborandi-SP.

---

## 🛡️ Decisões Técnicas e Simplificações Acadêmicas

Como se trata de um **Projeto Integrador de Faculdade**, foram assumidas simplificações conscientes para manter o projeto leve, sem fricção de configuração e 100% reproduzível:

1. **Sem Docker:** Utiliza **SQLite local** (`prisma/dev.db`). O banco é criado e manipulado em qualquer computador com Node.js sem necessidade de serviços externos ou containers.
2. **Sem WebSocket:** As atualizações em tempo real (KDS, acompanhamento do cliente na tela de pedidos e pausa emergencial) utilizam **polling a cada 5 segundos**.
3. **PIX Simulado:** A tela de checkout gera um QR Code e um código copia-e-cola válidos através da biblioteca `qrcode`. Um botão **"Simular Pagamento PIX"** permite concluir o pedido instantaneamente para fins de teste e apresentação.
4. **Segurança Básica:** Senhas com hash `bcryptjs` e autenticação com JWT assinado pela biblioteca `jose`, transmitido em cookie `httpOnly` (`comitiva_auth_token`), com middleware protegendo o painel `/admin/*`.
5. **Mapa:** Iframe incorporado do Google Maps centrado em Jaborandi-SP, dispensando chaves pagas da Google Cloud Platform.
6. **Uploads:** Imagens enviadas pelo painel são salvas diretamente na pasta `public/uploads` local.

---

## 🧪 Roteiro de Teste e Demonstração

1. **Fluxo do Cliente:**
   - Acesse `http://localhost:3000` e navegue pelo cardápio.
   - Escolha o tamanho de uma marmita (P, M ou G) e personalize as guarnições inclusas.
   - Abra o carrinho lateral e clique em **"Finalizar Pedido"**.
   - Faça login com o cliente de teste (`17998124421` / `cliente_comitiva`) ou crie uma conta nova.
   - No Checkout, selecione o endereço de entrega ou retirada, aplique o cupom `ROLETA15` e clique em **"Simular Pagamento PIX"**.
   - Acompanhe o pedido no stepper em tempo real (`/pedidos/[id]`).
   - Visite `/roleta` para girar a Roleta Caipira e ganhar prêmios.
   - Visite `/fidelidade` para ver o Cartão Tropeiro e o saldo de pontos.

2. **Fluxo do Administrador:**
   - Acesse `http://localhost:3000/admin` com as credenciais do admin (`17999990000` / `admin_comitiva`).
   - No **KDS (`/admin`)**, visualize os pedidos que caíram na coluna "Aguardando" e avance para "No Fogão a Lenha" e "Pronto / Despacho". Observe a atualização no app do cliente em até 5 segundos.
   - No **PDV (`/admin/pdv`)**, lance um pedido de balcão ou telefone, selecione o canal, calcule o troco em dinheiro e envie para a cozinha.
   - No **Cardápio (`/admin/cardapio`)**, clique no botão **"Pausa Emergencial"** de um prato e verifique que ele fica indisponível para pedidos no app do cliente.
   - Nos **Relatórios (`/admin/relatorios`)**, analise os KPIs financeiros, o gráfico interativo de curva de pedidos por horário e o ranking dos pratos mais vendidos.
