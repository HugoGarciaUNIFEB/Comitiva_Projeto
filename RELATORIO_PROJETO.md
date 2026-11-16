# 📋 Relatório de Situação do Projeto — Comitiva Fogo de Chão (InovaFood Tech)

> **Data do Diagnóstico:** Novembro de 2026  
> **Escopo da Análise:** Auditoria arquitetural, funcional, de código-fonte e banco de dados sem alteração de arquivos de código.  
> **Postura do Relatório:** Diagnóstico técnico honesto, objetivo e detalhado, separando rigorosamente o que funciona de verdade, o que é híbrido/mock e o que não existe.

---

## 1. STACK E ESTRUTURA

### 1.1. Tecnologias e Versões

| Camada | Tecnologia | Versão Declarada | Finalidade no Projeto |
|---|---|---|---|
| **Framework Fullstack** | Next.js (App Router) | `^15.1.4` (Build executado em `15.5.28`) | Roteamento, páginas cliente/admin e rotas de API internas |
| **Biblioteca de UI** | React / React DOM | `^19.0.0` | Componentes de interface declarativos |
| **Linguagem** | TypeScript | `^5.7.2` | Tipagem estática de ponta a ponta |
| **Estilização** | Tailwind CSS | `^3.4.17` | Utility classes baseadas nos tokens extraídos do Stitch |
| **Banco de Dados & ORM** | Prisma ORM | `^6.2.1` | Modelagem, migrações e client tipado |
| **Engine de Banco Atual** | SQLite (`prisma/dev.db`) | 3.x (nativo Prisma) | Armazenamento local de dados |
| **Gerenciador de Estado** | Zustand | `^5.0.3` | Estado da sacola/carrinho com persistência em `localStorage` |
| **Autenticação & Criptografia** | `jose` / `bcryptjs` | `jose ^5.9.6` / `bcryptjs ^2.4.3` | Criação/validação de JWTs e hash seguro de senhas |
| **Validação de Schemas** | Zod | `^3.24.1` | Validação de payloads de autenticação |
| **Gráficos & Métricas** | Recharts | `^2.15.0` | Gráfico de área (curva horária de pedidos no dashboard) |
| **Ícones** | Lucide React | `^1.58.0` | Ícones SVG da interface |
| **QR Code** | `qrcode` | `^1.5.4` | Renderização do QRCode do PIX em Canvas/DataURL |
| **Efeitos Visuais** | `canvas-confetti` | `^1.9.4` | Chuva de confetes na vitória da Roleta da Sorte |

### 1.2. Estrutura de Pastas Resumida

```
Comitiva_Projeto/
├── prisma/
│   ├── dev.db                      # Arquivo binário do banco local SQLite
│   ├── migrations/                 # Histórico de migrações estruturais do Prisma
│   ├── schema.prisma               # Modelagem relacional (11 tabelas)
│   └── seed.ts                     # Script de população limpa com admin, cliente e cardápio
├── public/
│   ├── images/                     # Fotos locais de pratos, guarnições, sobremesas e banners
│   ├── stitch/                     # Assets estáticos originais exportados do Stitch
│   └── uploads/                    # Diretório local para uploads manuais de novos pratos
├── src/
│   ├── app/
│   │   ├── (rotas públicas/cliente)
│   │   │   ├── page.tsx            # Cardápio do Dia / Home
│   │   │   ├── login/page.tsx      # Login unificado (cliente e admin)
│   │   │   ├── cadastro/page.tsx   # Cadastro de cliente com bônus de giro
│   │   │   ├── checkout/page.tsx   # Sacola, endereço, cupom e PIX simulado
│   │   │   ├── pedidos/[id]/page.tsx# Rastreio do pedido com polling de 5s
│   │   │   ├── conta/page.tsx      # Perfil, histórico e CRUD de endereços
│   │   │   ├── fidelidade/page.tsx # Saldo de pontos, extrato e resgate de prêmios
│   │   │   ├── roleta/page.tsx     # Gamificação da Roleta Caipira
│   │   │   └── sobre/page.tsx      # Informações institucionais e mapa
│   │   ├── admin/                  # Painel de Controle (Protegido por Middleware)
│   │   │   ├── page.tsx            # Fila da Cozinha (KDS / Kanban)
│   │   │   ├── pdv/page.tsx        # Atendimento de Balcão e Frente de Caixa
│   │   │   ├── cardapio/page.tsx   # Gestão de Pratos e Pausa Emergencial
│   │   │   └── relatorios/page.tsx # Dashboard gerencial e inteligência de vendas
│   │   ├── api/                    # 20+ Endpoints internos Next.js Route Handlers
│   │   ├── globals.css             # Cores, fontes e resets globais
│   │   ├── layout.tsx              # Shell raiz da aplicação
│   │   └── icon.svg                # Favicon vetorial da fogueira
│   ├── components/                 # Componentes compartilhados (Header, Footer, AdminSidebar, etc.)
│   ├── lib/
│   │   ├── auth.ts                 # Utilitários de JWT, cookies e validação de sessão
│   │   ├── prisma.ts               # Instância singleton do Prisma Client
│   │   ├── store/useCartStore.ts   # Store Zustand da sacola
│   │   └── validations/auth.ts     # Schemas Zod de login e cadastro
│   └── middleware.ts               # Guard de autenticação e papel admin
├── stitch_export/                  # Exportação bruta original do Stitch (HTMLs e screenshots)
├── .env / .env.example             # Variáveis de ambiente
├── package.json                    # Scripts e dependências
└── tailwind.config.ts              # Tokens de design do projeto
```

### 1.3. Comandos para Rodar Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Executar as migrações do banco SQLite
npx prisma migrate dev

# 3. Executar o seed para criar admin, cliente de teste, cardápio e prêmios
npx prisma db seed

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

- **URL da Loja:** [http://localhost:3000](http://localhost:3000)
- **URL do Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Credenciais de Teste:**
  - **Administrador:** WhatsApp `17999990000` / Senha `admin_comitiva`
  - **Cliente:** WhatsApp `17998124421` / Senha `cliente_comitiva`

---

## 2. TABELA DE TELAS E ROTAS

| Tela | Rota/URL | Status | Dados reais do banco ou mock? | Observações |
|---|---|---|---|---|
| **Home / Cardápio Digital** | `/` | **Completa** | **Reais do Banco** | Busca pratos via `/api/products` com polling a cada 5 segundos. Permite alternar tamanhos (P/M/G) com atualização dinâmica do preço, visualizar guarnições inclusas e adicionar à sacola com persistência local. |
| **Login** | `/login` | **Completa** | **Reais do Banco** | Autentica contra a tabela `User` usando `bcryptjs`. Gera JWT em cookie `httpOnly`. Se admin, redireciona para `/admin`; se cliente, vai para `/`. |
| **Cadastro de Cliente** | `/cadastro` | **Completa** | **Reais do Banco** | Cria registro real na tabela `User` com senha em hash bcrypt. Concede automaticamente 1 giro bônus (`welcomeSpins: 1`) e já faz login automático. |
| **Checkout e Pagamento** | `/checkout` | **Parcial** | **Híbrido** | A criação do pedido, cálculo financeiro, gravação de itens e validação de cupons são **reais** no banco. O pagamento PIX é **simulado** (gera QR code com biblioteca real mas chave/código mock sem gateway). |
| **Rastreio do Pedido** | `/pedidos/[id]` | **Completa** | **Reais do Banco** | Consulta `/api/orders/[id]` com **polling automático a cada 5 segundos**. Stepper dinâmico de 4 etapas que avança sozinho quando a cozinha muda o status. |
| **Minha Conta / Perfil** | `/conta` | **Completa** | **Reais do Banco** | Lista dados do cliente, saldo de pontos, cupons ativos, histórico real de pedidos e possui **CRUD completo de endereços** (criar, editar, excluir, favoritar). |
| **Clube de Fidelidade** | `/fidelidade` | **Completa** | **Reais do Banco** | Exibe saldo real, extrato de transações (`LoyaltyTransaction`), catálogo de prêmios (`Reward`) e botão de resgate que debita pontos e gera cupom real. |
| **Roleta da Sorte** | `/roleta` | **Completa** | **Reais do Banco** | Sorteio ponderado auditado no servidor (`/api/roleta/spin`), bloqueia mais de 1 giro por dia (fuso SP), gera cupom ou pontos reais e aciona confetes. |
| **Sobre a Comitiva** | `/sobre` | **Completa** | **Estático** | Tela institucional fixa com história, horários de atendimento, endereço físico de Jaborandi-SP e link para WhatsApp. |
| **Cozinha (KDS)** | `/admin` | **Completa** | **Reais do Banco** | Quadro Kanban operacional com polling de 5s. Mudança de status com 1 clique. Ao marcar "Entregue", credita pontos ao cliente automaticamente via transação Prisma. |
| **Atendimento Balcão (PDV)** | `/admin/pdv` | **Parcial / Com Bug** | **Mock / Quebrado na listagem** | A criação do pedido funciona e envia ao banco (`/api/orders`), **porém a listagem de pratos na tela está vazia** por erro de tipagem no filtro (`category === 'MEAL'` em vez de `'marmita'`). |
| **Gestão do Cardápio** | `/admin/cardapio` | **Completa** | **Reais do Banco** | Lista pratos, permite edição inline de preços, modal de criação de pratos, upload de fotos e **pausa emergencial em 5s** de pratos e de guarnições individuais. |
| **Relatórios & Dashboard** | `/admin/relatorios` | **Parcial** | **Híbrido** | Executa queries reais de faturamento e canais de pedidos, mas utiliza fallbacks com números fixos quando não há pedidos suficientes. Layout sofre com excesso de espaço vazio. |
| **Configurações do Admin** | N/A (Inexistente no Next.js) | **Não Implementada** | **Mock / Só visual em HTML solto** | **Não existe página no código do Next.js**. Existe apenas o arquivo bruto de design em `stitch_export/html/838df0f8...html`, que possui sobreposições e cards vazios. |
| **Painel do Entregador** | N/A (Inexistente) | **Não Existe** | **Não Existe** | Não existe tela, rota ou perfil dedicado para o motoboy/entregador. |

---

## 3. AUDITORIA DETALHADA DAS FUNCIONALIDADES

### 3.1. Cadastro e Login de Cliente
- **Situação:** **FUNCIONANDO DE VERDADE**.
- **Como a senha é guardada:** Criptografada no banco de dados SQLite com **hash bcrypt (`bcrypt.hash(password, 10)`)** com salt rounds = 10 no endpoint `POST /api/auth/register`. A senha pura **nunca** é gravada no banco nem retornada nas consultas.
- **Sessão:** Implementada via JWT assinado (`jose`) armazenado em cookie seguro `comitiva_auth_token` com as flags `httpOnly: true`, `sameSite: "lax"`, expiração de 7 dias e proteção por `src/middleware.ts`.

### 3.2. Login do Painel Admin e Perfis de Acesso
- **Situação:** **SIMULADO / PARCIALMENTE IMPLEMENTADO**.
- **Perfis existentes no código:** No schema (`schema.prisma`) e no middleware (`middleware.ts`), existem apenas dois papéis: `"admin"` e `"cliente"`.
- **Perfis Cozinha e Entregador:** **NÃO EXISTEM**. Não há separação de acessos entre administrador, chapeiro/cozinha ou entregador. Qualquer usuário com papel `"admin"` acessa todo o `/admin/*`, e não há credenciais ou telas distintas para os outros perfis operacionais.

### 3.3. Cardápio vindo do Banco; Cadastrar/Editar/Pausar Prato pelo Admin
- **Situação:** **FUNCIONANDO DE VERDADE**.
- **Cardápio do Cliente:** Busca produtos direto da tabela `Product` com relações `sizes` (tamanhos P, M, G) e `sides` (guarnições) via `/api/products`. A home faz polling a cada 5 segundos para refletir pausas quase em tempo real.
- **Cadastrar Prato:** Modal completo em `/admin/cardapio` enviando `POST /api/admin/products`, gravando prato, tamanhos, pesos, guarnições e foto no banco.
- **Editar Prato:** Edição inline de preços por tamanho com atualização via `PUT /api/admin/products/[id]`, além de edição completa por modal.
- **Pausa Emergencial:** Tanto o prato inteiro (`isPaused` em `Product`) quanto guarnições individuais (`isPaused` em `Side`) possuem endpoints dedicados (`PATCH .../pause`), bloqueando instantaneamente a seleção do item no app do cliente.

### 3.4. Sacola e Criação do Pedido
- **Situação:** **FUNCIONANDO DE VERDADE**.
- **O pedido é salvo no banco?** **SIM**. O envio pelo checkout dispara `POST /api/orders`, que abre uma transação relacional atômica (`prisma.$transaction`):
  1. Gera o número sequencial legível do pedido (ex: `#101`, `#102`...).
  2. Valida e aplica cupons de desconto, marcando o cupom como `isUsed: true`.
  3. Grava o cabeçalho do pedido na tabela `Order`.
  4. Grava cada item e suas personalizações na tabela `OrderItem`.
  5. Salva dados de entrega, canal de origem, forma de pagamento e cálculo de troco.

### 3.5. Pagamento PIX
- **Situação:** **SIMULADO / MOCK**.
- **Detalhes:** Não existe integração com nenhuma API de pagamento (Mercado Pago, EFI/Gerencianet, Asaas, etc.).
- **Como funciona:** O frontend utiliza a biblioteca `qrcode` para desenhar um QR Code real na tela a partir de uma string estática formatada no padrão BACEN ("Copia e Cola"). A interface disponibiliza um botão *"Simular Pagamento Instantâneo"* que apenas altera o estado local para `paymentStatus: "PAID"`, permitindo avançar o fluxo para testes acadêmicos.

### 3.6. Fila da Cozinha (KDS)
- **Situação:** **FUNCIONANDO DE VERDADE**.
- **O pedido do cliente aparece ali?** **SIM**. A tela `/admin` consulta `GET /api/admin/orders` em polling constante a cada 5 segundos. Qualquer pedido feito no checkout do cliente ou lançado no PDV aparece imediatamente na coluna *"Aguardando Preparo"*.
- **Mover entre colunas atualiza o status no banco?** **SIM**. Ao clicar nos botões de transição (*"Pôr no Fogão"*, *"Marcar como Pronto"*, *"Marcar como Entregue"*), a página dispara `PATCH /api/admin/orders/[id]/status`, atualizando o campo `status` na tabela `Order`.
- **Efeito colateral real:** Ao avançar o status para `"ENTREGUE"`, a API executa uma transação no banco que credita automaticamente 1 ponto por cada R$ 1,00 gasto na conta do cliente e registra a movimentação na tabela `LoyaltyTransaction`.

### 3.7. Acompanhamento do Pedido pelo Cliente
- **Situação:** **FUNCIONANDO DE VERDADE (COM POLLING)**.
- **Atualização:** O cliente acessa `/pedidos/[id]`. A tela possui um `setInterval` ativo que consulta `GET /api/orders/[id]` a cada **5 segundos**.
- **Comportamento dinâmico:** Quando a cozinha move o pedido no KDS, a tela do cliente atualiza sozinha em até 5 segundos sem necessidade de recarregar a página, avançando o stepper visual (Aguardando → No Fogão → Pronto / Embalado → Entregue).

### 3.8. Atendimento de Balcão (PDV)
- **Situação:** **PARCIAL / COM BUG CRÍTICO**.
- **Cria pedido real?** **O endpoint e a lógica de criação criam pedido real no banco**, calculando troco e enviando a comanda diretamente para o KDS da cozinha.
- **Onde está o problema:** Na montagem da tela (`src/app/admin/pdv/page.tsx`), a função `loadProducts` executa o seguinte filtro:
  ```ts
  const activeMeals = data.filter((p: Product) => p.category === "MEAL" && p.isAvailable);
  ```
  Como no banco de dados e na API os pratos possuem `category: "marmita"` e utilizam `isPaused: false` (em vez de `isAvailable`), o array `activeMeals` sempre resulta em **vazio (`[]`)**. Como consequência, a grelha de pratos não renderiza nada na interface do balcão.

### 3.9. Dashboard e Relatórios
- **Situação:** **HÍBRIDO (CÁLCULO REAL + FALLBACKS MOCK)**.
- **O que é real:** A rota `GET /api/admin/reports` faz query real na tabela `Order` (`prisma.order.findMany`), somando o faturamento bruto (`grossRevenue`), quantidade total de pedidos e calculando o ticket médio do período selecionado.
- **O que é mock:** Se o banco tiver zero pedidos no dia ou valores zerados, a API ativa fallbacks fixos para a apresentação não ficar vazia:
  - Faturamento fallback: R$ 5.480,00
  - Pedidos fallback: 148 marmitas
  - Ticket médio fallback: R$ 37,02
  - Tempo médio de despacho: **Chumbado fixo em 12 minutos**
  - Meta diária: **Chumbada fixa em 160 marmitas**
  - Gráfico de curva horária: Usa array estático se não houver pedidos distribuídos no dia.

### 3.10. Fidelidade e Roleta da Sorte
- **Situação:** **FUNCIONANDO DE VERDADE**.
- **Roleta Caipira (`/roleta`):**
  - Não é mero visual no client: o sorteio ocorre no backend via `/api/roleta/spin` com probabilidades pré-definidas (10% OFF: 35%, 15% OFF: 25%, Frete Grátis: 20%, 50 Pontos: 15%, Marmita P Grátis: 5%).
  - Impede mais de 1 giro por dia verificando o fuso de São Paulo na tabela `RouletteSpin`, a não ser que o cliente possua giros de boas-vindas pendentes (`welcomeSpins > 0`).
  - Cria um cupom real na tabela `Coupon` (válido até as 13h) ou credita os pontos na hora.
- **Clube Tropeiro (`/fidelidade`):**
  - Consulta o saldo real da tabela `User` e a lista de movimentações em `LoyaltyTransaction`.
  - O resgate em `/api/loyalty/redeem` desconta os pontos do cliente no banco, emite cupom com código único (`RESGATE-XXXX`) e grava o débito no extrato.

### 3.11. Endereços do Cliente e Histórico de Pedidos
- **Situação:** **FUNCIONANDO DE VERDADE**.
- **Endereços:** CRUD completo funcional em `/conta` persistindo na tabela `Address` através das rotas `/api/user/addresses` (GET, POST, PUT, DELETE), com suporte a endereço padrão e preenchimento automático no checkout.
- **Histórico:** Lista todos os pedidos anteriores do cliente logado vindos da tabela `Order`, permitindo reabrir o rastreio ou acionar o botão *"Pedir Novamente"* para recompor a sacola.

### 3.12. Fluxo do Entregador
- **Situação:** **NÃO EXISTE**.
- Não há interface, aplicativo ou rota para o entregador fazer login, visualizar sua rota ou assinalar a entrega. O pedido só é marcado como `"ENTREGUE"` se o operador da cozinha ou administrador clicar manualmente no botão do KDS (`/admin`).

---

## 4. BANCO DE DADOS

### 4.1. Conexão Atual
- **Banco:** SQLite local.
- **Arquivo físico:** `prisma/dev.db` (localizado na pasta `prisma/`).
- **Configuração no `.env`:**
  ```env
  DATABASE_URL="file:./dev.db"
  ```
- **Conector:** Prisma Client via `src/lib/prisma.ts` (padrão singleton para evitar vazamento de conexões no Fast Refresh do Next.js).

### 4.2. Tabelas e Campos Principais

1. **`User`**: Clientes e administradores.
   - *Campos:* `id`, `name`, `whatsapp` (único, chave de login), `email`, `password` (hash bcrypt), `role` (`"cliente"` ou `"admin"`), `points` (saldo fidelidade), `welcomeSpins` (saldo giros bônus), `createdAt`.
2. **`Address`**: Endereços de entrega do cliente.
   - *Campos:* `id`, `userId` (FK User), `street`, `number`, `neighborhood`, `complement`, `reference`, `recipient`, `phone`, `isDefault`.
3. **`Product`**: Pratos e itens do cardápio.
   - *Campos:* `id`, `name`, `description`, `imageUrl`, `category` (`"marmita"`, `"complemento"`, `"bebida"`, `"sobremesa"`), `isDailySpecial` (Prato do Dia), `isPaused` (pausa emergencial), `fireTime` (tempo de brasa), `servingsLeft`.
4. **`ProductSize`**: Variações de tamanho e preço.
   - *Campos:* `id`, `productId` (FK Product), `size` (`"P"`, `"M"`, `"G"` ou `"UNICO"`), `price`, `weight`.
5. **`Side`**: Guarnições inclusas e adicionais extras.
   - *Campos:* `id`, `productId` (FK Product, opcional), `name`, `type` (`"INCLUDED"` ou `"ADDITIONAL"`), `price`, `isPaused`.
6. **`Order`**: Pedidos de venda.
   - *Campos:* `id`, `orderNumber` (inteiro sequencial legível), `userId` (FK User, opcional), `customerName`, `customerPhone`, `orderType` (`"DELIVERY"`, `"PICKUP"`, `"COUNTER"`), `channel` (`"APP"`, `"BALCAO"`, `"WHATSAPP"`, `"TELEFONE"`), `status` (`"AGUARDANDO"`, `"NO_FOGAO"`, `"PRONTO"`, `"ENTREGUE"`, `"CANCELADO"`), `paymentMethod` (`"PIX"`, `"CARD"`, `"CASH"`), `paymentStatus`, `subtotal`, `deliveryFee`, `discount`, `total`, `changeFor`, `couponCode`, `deliveryAddress`, `notes`, `pointsEarned`.
7. **`OrderItem`**: Itens contidos no pedido.
   - *Campos:* `id`, `orderId` (FK Order), `productId` (FK Product), `productName`, `size`, `unitPrice`, `quantity`, `totalPrice`, `includedSides` (JSON string com guarnições marcadas), `addedSides` (JSON string com extras), `observations`.
8. **`Coupon`**: Cupons de desconto e vouchers emitidos.
   - *Campos:* `id`, `code` (único), `description`, `discountType` (`"PERCENT"`, `"FIXED"`, `"FREE_SHIPPING"`, `"FREE_MEAL_P"`), `discountValue`, `userId` (FK User, opcional), `isUsed`, `expiresAt`.
9. **`RouletteSpin`**: Auditoria dos giros da roleta diária.
   - *Campos:* `id`, `userId` (FK User), `prize`, `prizeType`, `prizeValue`, `couponCode`, `isWelcomeSpin`, `createdAt`.
10. **`LoyaltyTransaction`**: Extrato de pontos de fidelidade.
    - *Campos:* `id`, `userId` (FK User), `points`, `type` (`"ORDER_EARN"`, `"REWARD_REDEEM"`, `"ROULETTE_PRIZE"`), `description`, `orderId`.
11. **`Reward`**: Catálogo de recompensas disponíveis para troca de pontos.
    - *Campos:* `id`, `title`, `description`, `pointsCost`, `rewardType`, `isActive`.

### 4.3. Diagrama Entidade-Relacionamento (Mermaid)

```mermaid
erDiagram
    USER ||--o{ ADDRESS : "cadastra"
    USER ||--o{ ORDER : "realiza"
    USER ||--o{ COUPON : "recebe"
    USER ||--o{ ROULETTE_SPIN : "executa"
    USER ||--o{ LOYALTY_TRANSACTION : "acumula"
    
    PRODUCT ||--o{ PRODUCT_SIZE : "possui"
    PRODUCT ||--o{ SIDE : "oferece"
    PRODUCT ||--o{ ORDER_ITEM : "origina"
    
    ORDER ||--|{ ORDER_ITEM : "contem"
    
    USER {
        string id PK
        string name
        string whatsapp UK
        string password
        string role
        int points
        int welcomeSpins
    }

    ADDRESS {
        string id PK
        string userId FK
        string street
        string number
        string neighborhood
        boolean isDefault
    }

    PRODUCT {
        string id PK
        string name
        string category
        boolean isDailySpecial
        boolean isPaused
        string fireTime
    }

    PRODUCT_SIZE {
        string id PK
        string productId FK
        string size
        float price
        string weight
    }

    SIDE {
        string id PK
        string productId FK
        string name
        string type
        float price
        boolean isPaused
    }

    ORDER {
        string id PK
        int orderNumber UK
        string userId FK
        string customerName
        string status
        string paymentMethod
        string paymentStatus
        float total
        float changeFor
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        string productName
        string size
        int quantity
        float totalPrice
    }

    COUPON {
        string id PK
        string code UK
        string discountType
        float discountValue
        string userId FK
        boolean isUsed
        datetime expiresAt
    }

    ROULETTE_SPIN {
        string id PK
        string userId FK
        string prize
        string prizeType
        float prizeValue
        datetime createdAt
    }

    LOYALTY_TRANSACTION {
        string id PK
        string userId FK
        int points
        string type
        string description
    }

    REWARD {
        string id PK
        string title
        int pointsCost
        string rewardType
        boolean isActive
    }
```

---

## 5. API / BACKEND (LISTA DE ENDPOINTS)

| Método | Rota | O que faz | Em uso pelo frontend? |
|---|---|---|---|
| `GET` | `/api/products` | Retorna o cardápio público ativo com tamanhos e guarnições | **SIM** (Home com polling 5s e PDV) |
| `GET` | `/api/orders` | Lista pedidos (todos se admin; apenas os próprios se cliente) | **SIM** (KDS e Conta) |
| `POST` | `/api/orders` | Cria novo pedido em transação relacional (calcula itens, cupom e frete) | **SIM** (Checkout e PDV) |
| `GET` | `/api/orders/[id]` | Retorna o estado atualizado de um pedido específico | **SIM** (Rastreio com polling 5s) |
| `POST` | `/api/auth/register` | Cria usuário com senha bcrypt e gera cookie JWT | **SIM** (Tela `/cadastro`) |
| `POST` | `/api/auth/login` | Valida credenciais e gera cookie JWT HttpOnly | **SIM** (Tela `/login`) |
| `POST` | `/api/auth/logout` | Limpa o cookie de autenticação `comitiva_auth_token` | **SIM** (Header e AdminSidebar) |
| `GET` | `/api/auth/me` | Retorna o usuário logado atualmente através do cookie | **SIM** (Header e Checkout) |
| `GET` | `/api/admin/orders` | Lista pedidos ativos e calcula métricas do KDS | **SIM** (Tela KDS `/admin`) |
| `PATCH` | `/api/admin/orders/[id]/status` | Atualiza status no Kanban e credita pontos se "ENTREGUE" | **SIM** (Ações de avanço no KDS) |
| `GET` | `/api/admin/products` | Lista produtos completos para administração | **SIM** (Tela `/admin/cardapio`) |
| `POST` | `/api/admin/products` | Cadastra novo prato com sizes e sides | **SIM** (Modal em `/admin/cardapio`) |
| `PUT` | `/api/admin/products/[id]` | Atualiza dados ou preços inline de um prato | **SIM** (Tabela em `/admin/cardapio`) |
| `PATCH` | `/api/admin/products/[id]/pause` | Alterna pausa emergencial do prato | **SIM** (Botão Pausar em `/admin/cardapio`) |
| `PATCH` | `/api/admin/sides/[id]/pause` | Alterna pausa emergencial de guarnição específica | **SIM** (Botão Pausa em `/admin/cardapio`) |
| `GET` | `/api/admin/reports` | Agrega faturamento, curva horária, canais e formas de pagamento | **SIM** (Dashboard `/admin/relatorios`) |
| `POST` | `/api/coupons/validate` | Valida código de cupom de desconto (validade e uso único) | **SIM** (Checkout) |
| `GET` | `/api/loyalty` | Retorna saldo, histórico de pontos e lista de prêmios | **SIM** (Tela `/fidelidade`) |
| `POST` | `/api/loyalty/redeem` | Resgata recompensa, debita pontos e gera cupom | **SIM** (Botão Resgatar em `/fidelidade`) |
| `GET` | `/api/roleta/status` | Verifica se o usuário tem direito a girar a roleta hoje | **SIM** (Tela `/roleta`) |
| `POST` | `/api/roleta/spin` | Executa sorteio ponderado, registra giro e cria cupom/pontos | **SIM** (Botão Girar em `/roleta`) |
| `GET` | `/api/user/profile` | Retorna perfil do cliente com pedidos, cupons e endereços | **SIM** (Tela `/conta`) |
| `PUT` | `/api/user/profile` | Atualiza nome e email do cliente logado | **SIM** (Formulário em `/conta`) |
| `GET` | `/api/user/addresses` | Lista endereços de entrega do cliente | **SIM** (Checkout e `/conta`) |
| `POST` | `/api/user/addresses` | Cadastra novo endereço de entrega | **SIM** (Modal em `/conta`) |
| `PUT` | `/api/user/addresses/[id]` | Edita endereço de entrega existente | **SIM** (Modal em `/conta`) |
| `DELETE` | `/api/user/addresses/[id]` | Remove endereço de entrega cadastrado | **SIM** (Botão Excluir em `/conta`) |
| `POST` | `/api/upload` | Faz upload de fotos de novos pratos para `public/uploads` local | **SIM** (Modal de prato no admin) |

---

## 6. PROBLEMAS CONHECIDOS E DIAGNÓSTICO DE CAUSAS

### 6.1. Erros de Build e Compilação
- **Status do Build:** **APROVADO COM SUCESSO**.
- A verificação de tipagem (`npx tsc --noEmit`) e a compilação de produção (`npm run build`) foram executadas durante esta auditoria e terminaram com **código de saída 0**. Todas as 33 rotas e páginas estáticas/dinâmicas compilaram sem quebra de sintaxe ou erro de compilação.

### 6.2. Diagnóstico dos 3 Problemas Apontados pelo Usuário

#### A. A tela "Configurações" do admin tem cards vazios e textos sobrepostos
- **Confirmação:** **Confirmado no protótipo bruto do Stitch, mas a tela NÃO FOI IMPLEMENTADA no Next.js.**
- **Causa Real:**
  1. A rota `/admin/configuracoes` simplesmente **não existe no código da aplicação Next.js** (não há arquivo `src/app/admin/configuracoes/page.tsx`).
  2. O que existe é apenas o arquivo de protótipo HTML gerado pela IA no Stitch: `stitch_export/html/838df0f8f29b4708a0b3746d43faed37_configura_es_do_sistema_comitiva_fogo_de_ch_o.html`.
  3. No Stitch, o código foi gerado com regras de CSS estáticas contendo alturas fixas (`h-36`, `h-full`), espaçamentos absolutos e botões com textos longos que estouram a largura dos containers em telas menores ou sem o Tailwind dinâmico completo, ocasionando sobreposição de textos e espaços vazios.

#### B. No Atendimento de Balcão (PDV), o logo não carrega ("img")
- **Confirmação:** **Confirmado no protótipo original Stitch.**
- **Causa Real:**
  1. No protótipo original (`stitch_export/html/e8e63570...html`), a sidebar continha uma tag:
     ```html
     <img alt="Logotipo..." src="https://lh3.googleusercontent.com/aida/AEtjO1VZmvFw9vvRbtqmkyO6WFgVu35fN..."/>
     ```
     Essa URL temporária do Google AIDA/Stitch **expirou**, fazendo com que o navegador renderize o ícone cinza de imagem quebrada com o texto alternativo `"img"`.
  2. No projeto Next.js real, o componente `src/components/AdminSidebar.tsx` substituiu a tag `<img>` por um ícone vetorial Lucide `<Flame />` estilizado. Portanto, no app Next.js o ícone de chama aparece normalmente, mas o arquivo de logotipo da marca (`/images/logo_comitiva.svg`) não está vinculado nessa barra lateral do admin.
  3. **Bug adicional no PDV:** Conforme auditado na Seção 3.8, os pratos não aparecem no balcão devido ao filtro incompatível `category === "MEAL"`.

#### C. No Dashboard (Relatórios), alguns cards ficam com muito espaço vazio
- **Confirmação:** **Confirmado no código da página `src/app/admin/relatorios/page.tsx`.**
- **Causa Real:**
  1. No grid principal (`grid grid-cols-1 lg:grid-cols-12 gap-space-lg`), a coluna esquerda tem 8 colunas e abriga o gráfico do Recharts com altura fixa de `h-72` mais cabeçalhos e rodapés altos.
  2. Por padrão, os itens de um CSS Grid possuem `align-items: stretch`, forçando a coluna direita (`lg:col-span-4`) a ter exatamente a mesma altura elevada da esquerda.
  3. Nos cards da direita (ex: *Canais de Entrada* e *Guarnições Mais Pedidas*), foi aplicada a classe CSS `h-full flex flex-col justify-between`.
  4. O flexbox `justify-between` empurra o título para o topo e a legenda para o rodapé inferior, expandindo o miolo do card e gerando uma enorme faixa em branco desnecessária no centro.

### 6.3. Imagens e Ícones Locais
- **Onde estão os arquivos:** Todos os assets visuais estão centralizados localmente em `public/images/`:
  - Pratos principais: `public/images/pratos/` (costela, frango caipira, feijoada, carne de panela).
  - Guarnições: `public/images/guarnicoes/` (arroz, feijão tropeiro, couve, farofa, mandioca).
  - Bebidas e sobremesas: `public/images/bebidas/` e `public/images/sobremesas/`.
  - Logotipos: `public/images/logo_comitiva.svg` e `public/images/logo_comitiva.png`.
- **Risco de Upload:** Novos pratos cadastrados no admin salvam a imagem em `public/uploads/` via `fs/promises`. Esse mecanismo funciona localmente, mas não persiste em deploys serverless.

---

## 7. ANÁLISE DE DEPLOY (VERCEL + RENDER + NEON POSTGRESQL)

> O usuário questionou: *"Quero publicar com: frontend na Vercel, API no Render e banco PostgreSQL no Neon. O projeto está pronto para isso?"*

### ⚠️ Resposta Direta: **NÃO ESTÁ PRONTO DIRETAMENTE.**
O projeto foi construído como um **Monólito Fullstack Next.js** (onde o frontend e as rotas de API `/api/*` residem na mesma aplicação). Publicar frontend na Vercel e API no Render de forma desacoplada criará barreiras arquiteturais que exigirão refatoração.

### O que precisa mudar:

#### 1. Arquitetura de Comunicação (CORS e URLs de API)
- **Problema de URLs Relativas:** Todas as telas fazem chamadas como `fetch("/api/products")` ou `fetch("/api/orders")`. Se o frontend estiver na Vercel (`https://meu-app.vercel.app`) e a API no Render (`https://api-render.com`), essas requisições baterão na Vercel e retornarão 404.
- **Mudança necessária:**
  - Criar variável de ambiente `NEXT_PUBLIC_API_URL` na Vercel apontando para o Render.
  - Atualizar todas as chamadas de fetch no cliente para usar `${process.env.NEXT_PUBLIC_API_URL}/api/...`.
  - Configurar **CORS** nos Route Handlers da API no Render (adicionar cabeçalhos `Access-Control-Allow-Origin: https://meu-app.vercel.app`, `Access-Control-Allow-Credentials: true`, etc.), pois atualmente **nenhuma rota de API possui configuração de CORS**.

#### 2. Autenticação Cross-Domain e Cookies HttpOnly
- **Problema Crítico:** A autenticação atual grava o JWT em um cookie `httpOnly` com `sameSite: "lax"`.
- Se o frontend estiver em um domínio (`vercel.app`) e a API em outro (`onrender.com`), os navegadores modernos (Chrome, Safari, Edge) **bloqueiam cookies de terceiros (Third-Party Cookies)** por padrão. O cookie de autenticação não será enviado nas requisições da Vercel para o Render.
- **Mudança necessária:**
  - Configurar cookies com `sameSite: "none"` e `secure: true` E passar `credentials: "include"` em todos os `fetch` do frontend; **OU**
  - Mudar a autenticação para enviar o JWT no cabeçalho `Authorization: Bearer <token>` armazenado em memória/localStorage; **OU (Opção Mais Inteligente):**
  - **Manter o Next.js Fullstack inteiro na Vercel!** As rotas de API do Next.js rodam nativamente como Serverless Functions na Vercel sem custo adicional, eliminando 100% dos problemas de CORS, cookies cross-domain e latência entre servidores.

#### 3. Migração do Banco: SQLite → PostgreSQL no Neon
- **Mudança necessária no `prisma/schema.prisma`:**
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    directUrl = env("DIRECT_URL") // Recomendado para o pooler do Neon
  }
  ```
- **Migração dos dados:** Rodar `npx prisma migrate dev --name init_neon` para gerar a estrutura de tabelas em PostgreSQL no Neon e em seguida rodar `npx prisma db seed` para alimentar o banco na nuvem.
- **Variáveis de Ambiente:** Substituir `DATABASE_URL="file:./dev.db"` pela Connection String fornecida pelo Neon com SSL habilitado (`postgresql://usuario:senha@ep-xyz.neon.tech/neondb?sslmode=require`).

#### 4. Armazenamento de Arquivos de Upload (`/api/upload`)
- **Problema:** A rota de upload grava diretamente no disco rígido local (`path.join(process.cwd(), "public", "uploads")`).
- Na Vercel (Serverless), o sistema de arquivos é **somente leitura** (`read-only`), resultando em erro 500 imediato ao tentar salvar imagens.
- No Render (contêiner efêmero no plano gratuito), o disco é resetado a cada novo deploy ou reinício do servidor, apagando as fotos enviadas.
- **Mudança necessária:** Substituir a gravação local em disco por um serviço de Storage em Nuvem (Cloudinary, Supabase Storage, AWS S3 ou Cloudflare R2).

#### 5. Scripts de Build no `package.json`
- **Mudança necessária:** Alterar o script de build para forçar a geração do client do Prisma antes de compilar o Next.js:
  ```json
  "scripts": {
    "build": "prisma generate && next build"
  }
  ```

---

## 8. RESUMO FINAL E PLANO DE PRIORIDADES

### 8.1. Quadro Resumo do Projeto

| Categoria | O que está 100% Pronto | O que é Híbrido / Mock / Falho | O que Não Existe |
|---|---|---|---|
| **Cliente** | • Cardápio com seleção P/M/G<br>• Sacola Zustand persistida<br>• Criação de pedido no banco<br>• Rastreio dinâmico (polling 5s)<br>• Cadastro e Login com bcrypt/JWT<br>• CRUD de Endereços<br>• Roleta com auditoria diária<br>• Clube de Pontos e Resgate | • Pagamento PIX (QR Code gerado com biblioteca real, mas código mock e aprovação manual simulada) | • Acompanhamento no mapa por GPS do entregador |
| **Admin / Cozinha** | • KDS Kanban em tempo real<br>• Transição de status no banco<br>• Crédito automático de pontos<br>• Gestão de pratos e preços<br>• Pausa emergencial em 5s (pratos e guarnições) | • PDV Balcão: não lista pratos por divergência de categoria (`MEAL` vs `marmita`)<br>• Dashboard: fallbacks estáticos para dias vazios e espaçamento vertical excessivo nos cards | • Tela/Login exclusivo para Cozinha<br>• Tela de Configurações (só existe o HTML estático do Stitch) |
| **Logística / Entrega** | — | • KDS tem indicador fixo de "2 entregadores disponíveis" | • **Painel / Tela do Entregador** (o motoboy não tem tela para marcar "Entregue") |

---

### 8.2. Plano de Prioridades para uma Apresentação Funcional Perfeita
*(Fluxo ideal: Cliente faz pedido → Cozinha prepara no KDS → Entregador marca entregue → Cliente vê status mudar)*

Para garantir que a banca acadêmica do **InovaFood Tech** veja a solução funcionando de ponta a ponta sem falhas, esta é a ordem recomendada de correções:

#### 🔴 Prioridade 1 (Crítica - Correção de 2 Linhas no PDV):
- **O que fazer:** Em `src/app/admin/pdv/page.tsx`, ajustar o filtro de pratos para `p.category === "marmita" && !p.isPaused`.
- **Impacto:** O Atendimento de Balcão passa a exibir todos os pratos do fogão imediatamente, permitindo demonstrar pedidos presenciais e via WhatsApp sem tela vazia.

#### 🟡 Prioridade 2 (Essencial para o Fluxo do Entregador):
- **O que fazer:** Criar uma rota mobile simples `/admin/entregas` (ou adicionar um botão destacado no KDS) simulando a visão do motoboy.
- **Impacto:** Permite que durante a apresentação alguém no celular abra a tela do entregador, clique em *"Entregar Pedido #101"*, e a tela do cliente mude para *"Entregue"* na hora, creditando os pontos no extrato em tempo real.

#### 🟢 Prioridade 3 (Ajuste Visual nos Relatórios):
- **O que fazer:** Em `src/app/admin/relatorios/page.tsx`, remover as classes `h-full` e `justify-between` dos cards laterais da grade analítica.
- **Impacto:** Elimina o espaço vazio excessivo nos cards do dashboard, tornando o layout compacto e harmonioso.

#### ⚪ Prioridade 4 (Para Produção / Deploy):
- **O que fazer:** Se for colocar em produção na nuvem, hospedar o Next.js Fullstack inteiro na **Vercel** conectado ao **Neon PostgreSQL**, integrando o **Cloudinary** para o upload de fotos de pratos.
- **Impacto:** Evita a complexidade desnecessária de separar frontend e API em servidores distintos.

