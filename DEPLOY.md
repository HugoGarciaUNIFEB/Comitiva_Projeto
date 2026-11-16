# 🚀 Guia de Deploy — Comitiva Fogo de Chão (Vercel + Neon)

Este guia foi elaborado para iniciantes e explica, passo a passo, como colocar a aplicação **Comitiva Fogo de Chão** em produção utilizando a infraestrutura moderna e gratuita da **Vercel** (hospedagem e armazenamento de imagens) e do **Neon** (banco de dados PostgreSQL Serverless).

---

## 🏗️ Arquitetura de Produção

* **Hospedagem Web & API:** [Vercel](https://vercel.com) (Next.js 15 App Router Serverless)
* **Banco de Dados Relacional:** [Neon](https://neon.tech) (PostgreSQL Serverless)
* **Armazenamento de Fotos (Uploads):** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (`@vercel/blob`)
* **Autenticação:** JWT seguro em Cookies `httpOnly` com flag `secure` em produção

---

## 📋 Pré-requisitos

1. Uma conta gratuita no **[Neon](https://neon.tech)**.
2. Uma conta gratuita na **[Vercel](https://vercel.com)**.
3. Uma conta no **[GitHub](https://github.com)** (para conectar com a Vercel) ou o Node.js instalado localmente.

---

## 🐾 Passo 1: Criar o Banco de Dados no Neon e Obter as URLs

1. Acesse [console.neon.tech](https://console.neon.tech) e faça login.
2. Clique no botão **"Create project"**.
3. Defina o nome do projeto (exemplo: `comitiva-fogo-de-chao`) e a região mais próxima (ex: `AWS us-east-2` ou `sa-east-1` se disponível).
4. No Dashboard do seu projeto Neon recém-criado, você verá a seção **Connection Details**:
   - Deixe a opção **"Pooled connection" marcada**. Copie a string gerada. Esta será a sua **`DATABASE_URL`**.
     *(Ela possui o sufixo `-pooler` no host, ideal para o consumo de APIs Serverless na Vercel).*
   - Agora **desmarque** a caixinha **"Pooled connection"**. Copie a nova string gerada. Esta será a sua **`DIRECT_URL`**.
     *(Ela é a conexão direta com o banco, exigida pelo Prisma para executar comandos de DDL e migrations sem travar no pooler).*

> [!TIP]
> Guarde essas duas URLs em um bloco de notas temporário. Elas têm o seguinte formato:
> - `DATABASE_URL`: `postgresql://usuario:senha@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`
> - `DIRECT_URL`: `postgresql://usuario:senha@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## 🐾 Passo 2: Rodar as Migrations e o Seed a Partir do Seu Computador

Antes de subir para a Vercel, vamos criar as tabelas e popular o banco do Neon com o cardápio, usuários de teste e prêmios.

1. No seu computador, abra o arquivo `.env` do projeto e configure as duas variáveis com as URLs reais do Neon:
   ```env
   DATABASE_URL="sua_url_pooled_do_neon"
   DIRECT_URL="sua_url_direta_do_neon"
   ```

2. Abra o terminal na pasta do projeto e execute a migration para criar todas as tabelas no PostgreSQL:
   ```bash
   npx prisma migrate deploy
   ```
   *Você verá a mensagem: `1 migration found in prisma/migrations` e `All migrations have been successfully applied`.*

3. Execute o script de povoamento (seed) para cadastrar os pratos caipiras, admin, cliente de teste e cupons:
   ```bash
   npx prisma db seed
   ```
   *Ao término, você verá a mensagem: `Seed concluído com 100% de sucesso!`.*

4. *(Opcional)* No painel do Neon, clique na aba **"SQL Editor"** ou **"Tables"** para conferir as tabelas criadas (`User`, `Product`, `Order`, etc.) com todos os dados preenchidos.

---

## 🐾 Passo 3: Subir o Projeto para o GitHub

1. Se você ainda não inicializou o Git no projeto:
   ```bash
   git init
   git add .
   git commit -m "feat: preparar projeto para deploy na Vercel e Neon"
   ```

2. Crie um novo repositório no seu GitHub (pode ser privado) e conecte o repositório local:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/comitiva-fogo-de-chao.git
   git push -u origin main
   ```

---

## 🐾 Passo 4: Criar o Projeto na Vercel e Configurar o Vercel Blob

### 4.1 Importar o Repositório na Vercel
1. Acesse [vercel.com](https://vercel.com) e clique em **"Add New..."** > **"Project"**.
2. Conecte sua conta do GitHub e clique em **"Import"** no repositório da Comitiva.
3. Na seção **"Environment Variables"**, adicione as seguintes variáveis:

| Nome da Variável | Valor | O que é |
|---|---|---|
| `DATABASE_URL` | `postgresql://...-pooler...` | String de conexão Pooled do Neon |
| `DIRECT_URL` | `postgresql://...` | String de conexão Direta do Neon |
| `JWT_SECRET` | *(gere uma senha longa aleatória)* | Chave de criptografia dos cookies de login |
| `NEXT_PUBLIC_APP_URL` | `https://seu-projeto.vercel.app` | URL de produção fornecida pela Vercel |

### 4.2 Criar e Vincular o Vercel Blob (para upload de fotos)
1. No menu superior da Vercel, clique na aba **"Storage"**.
2. Clique em **"Create Database"** e selecione **"Blob"**.
3. Escolha um nome para o store (ex: `comitiva-fotos`) e avance.
4. Clique na aba **"Projects"** do Blob e selecione o projeto da Comitiva para vinculá-lo (**"Connect to Project"**).
5. Pronto! A Vercel adicionará automaticamente a variável `BLOB_READ_WRITE_TOKEN` ao seu projeto sem você precisar copiar nada manualmente.

### 4.3 Fazer o Deploy
1. Volte ao seu projeto na Vercel e clique em **"Deploy"**.
2. A Vercel executará o comando configurado no `package.json`:
   `prisma generate && next build`
3. Em 1 a 2 minutos, a tela de fogos de artifício indicará que o site está **Online**!

---

## 🐾 Passo 5: Como Testar e Ver os Logs de Erro

### 5.1 Testando o Sistema em Produção
Acesse a URL gerada pela Vercel (ex: `https://comitiva-fogo-de-chao.vercel.app`):

1. **Testar Loja & Cardápio:** Navegue pelas marmitas, selecione tamanhos (P, M, G), personalize guarnições e teste a Roleta Caipira.
2. **Testar Login de Cliente:**
   - **WhatsApp:** `17998124421`
   - **Senha:** `cliente_comitiva`
3. **Testar Painel Administrativo:**
   - Acesse `/admin/login` ou entre com:
     - **WhatsApp:** `17999990000`
     - **Senha:** `admin_comitiva`
   - Acesse o KDS (Kanban da Cozinha), o PDV de Balcão e a aba de Relatórios.
4. **Testar Upload de Pratos:**
   - No painel administrativo em `/admin/cardapio`, clique em cadastrar prato e envie uma foto. O upload será enviado diretamente para o seu Vercel Blob com link CDN público.

### 5.2 Como Visualizar os Logs em Caso de Erro
Se alguma página retornar erro 500 ou algum comportamento inesperado:
1. No painel do seu projeto na Vercel, clique na aba superior **"Logs"** (ou **"Runtime Logs"**).
2. Deixe a aba aberta e repita a ação que causou o erro no site.
3. Os logs do Next.js mostrarão exatamente a stack trace do erro, indicando linha e arquivo.

---

## 🐾 Passo 6: Como Manter e Rodar o Projeto Localmente

Após a migração para o PostgreSQL, você tem duas opções para trabalhar no seu computador:

### Opção A (Altamente Recomendada): Branch de Desenvolvimento no Neon
O Neon possui um recurso incrível chamado **Branching** (cria uma cópia instantânea e isolada do banco com todos os dados):
1. No painel do Neon, clique na aba **"Branches"** e em **"Create Branch"**.
2. Crie um branch chamado `dev` a partir do `main`.
3. Copie as URLs de conexão do branch `dev` e coloque no seu `.env` local do computador.
4. Dessa forma, seu ambiente local roda exatamente com o mesmo PostgreSQL de produção, sem risco de alterar os dados dos clientes reais.

### Opção B: Voltar para SQLite Localmente (Desenvolvimento Offline)
Se preferir trabalhar 100% offline sem internet:
1. No arquivo `prisma/schema.prisma`, altere o bloco `datasource`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```
2. No seu arquivo `.env`, mantenha `DATABASE_URL="file:./dev.db"`.
3. Execute `npx prisma generate`.
4. *Lembre-se de reverter para `provider = "postgresql"` antes de enviar para o GitHub/Vercel.*

