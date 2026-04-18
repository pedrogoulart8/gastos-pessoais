# Gastos Visíveis

> Controle de gastos pessoais com IA — tire foto do comprovante, o Claude extrai os dados, você vê os dashboards.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Recharts](https://img.shields.io/badge/Recharts-3-ff6b6b)
![Claude](https://img.shields.io/badge/Claude-Sonnet%204.6-orange?logo=anthropic)
![Vitest](https://img.shields.io/badge/Vitest-21%20testes-green?logo=vitest)

---

## Screenshot

> _Adicione aqui um GIF ou print do app rodando_

---

## Features do MVP

### Captura e extração
- Botão "Tirar foto" aciona câmera nativa do celular (`capture="environment"`)
- No desktop, abre seletor de arquivos — arraste screenshots de comprovantes
- Preview da imagem enquanto processa
- Claude Sonnet 4.6 extrai: valor, estabelecimento, data, método de pagamento, confiança

### Revisão e confirmação
- Todos os campos extraídos são editáveis antes de salvar
- Aviso visual quando a confiança do LLM é baixa
- Dropdown de categoria com as 7 categorias padrão
- Botão "Descartar" cancela e limpa a imagem

### Histórico
- Lista cronológica com thumbnail do comprovante
- Filtros por mês, categoria e texto livre
- Tap abre detalhe com imagem em tela cheia + editar/deletar

### Dashboards — 6 gráficos, 6 perguntas

| # | Gráfico | Pergunta respondida |
|---|---------|---------------------|
| 1 | **Stat cards mensais** | Estou gastando mais ou menos que o mês passado? |
| 2 | **Barras horizontais por categoria** | Para onde está indo meu dinheiro este mês? |
| 3 | **Barras diárias — últimos 30 dias** | Houve algum pico incomum esta semana? |
| 4 | **Curva cumulativa: mês atual vs anterior** | Estou no mesmo ritmo que o mês passado? |
| 5 | **Top 10 maiores gastos do mês** | Quais foram meus maiores gastos? Teve algum excepcional? |
| 6 | **Média por dia da semana** | Em que dia da semana eu mais gasto? |

---

## Arquitetura

```
PWA (Chrome/Safari mobile + desktop)
        │
        ▼
Next.js 16 App Router (Vercel)
├── Server Components  ──► analyticsService ──► PostgreSQL (Neon)
├── Route Handlers     ──► Vercel Blob (imagens)
│                      ──► Claude Sonnet 4.6 (extração)
└── Client Components  ──► Recharts (gráficos)
```

Middleware valida `x-api-token` em todas as rotas `/api/*`.

---

## Como rodar localmente

### Pré-requisitos
- Node.js 20+
- Conta no [Neon](https://neon.tech) (banco gratuito)
- API key da [Anthropic](https://console.anthropic.com)
- Token do [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (opcional no dev — upload não funciona sem ele)

### Setup

```bash
# 1. Clone e instale dependências
git clone <repo>
cd gastos-pessoais
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 3. Crie as tabelas e popule as categorias
npx prisma migrate dev --name init
npm run db:seed

# 4. Rode o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

### Variáveis de ambiente

```env
DATABASE_URL="postgresql://..."            # String de conexão Neon
APP_TOKEN="sua-string-secreta"             # Token de autenticação (header x-api-token)
NEXT_PUBLIC_APP_TOKEN="mesma-string"       # Exposta ao browser (app single-user, aceitável)
ANTHROPIC_API_KEY="sk-ant-..."             # Chave da API Anthropic
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..." # Token Vercel Blob
```

### Testes

```bash
npm test          # roda 21 testes unitários
npm run test:watch # modo watch
```

---

## Como obter a API key da Anthropic

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie uma conta ou faça login
3. Vá em **API Keys** → **Create Key**
4. Copie a chave (começa com `sk-ant-`)
5. Cole em `ANTHROPIC_API_KEY` no `.env`

> O modelo usado é `claude-sonnet-4-6` — cobrado por token. Uma extração típica usa ~300–500 tokens de entrada e ~100 de saída.

---

## Deploy

### 1. Banco — Neon
1. Crie um projeto em [neon.tech](https://neon.tech)
2. Copie a connection string e cole em `DATABASE_URL` no Vercel
3. Configure o build command: `prisma generate && prisma migrate deploy && next build`
4. Rode o seed uma vez: `npm run db:seed` (apontando para o Neon)

### 2. Storage — Vercel Blob
1. No dashboard do projeto Vercel, vá em **Storage** → **Blob** → **Create Store**
2. O `BLOB_READ_WRITE_TOKEN` é adicionado automaticamente às env vars do projeto

### 3. App — Vercel
```bash
npx vercel --prod
```
Ou conecte o repositório no dashboard Vercel e configure as env vars listadas acima.

---

## Decisões técnicas

### Por que Next.js 16 em vez de Vite + Fastify?
O projeto anterior usou Vite — este demonstra fluência com App Router, Server Components, Route Handlers e middleware integrado ao framework.

### Por que Claude com tool use em vez de OCR tradicional?
OCR tradicional extrai texto bruto — precisaria de regexes frágeis para cada banco/app. O Claude entende o contexto: sabe que "Favorecido: Padaria do Zé" é o merchant, que "R$ 23,50" é o valor, e sugere uma descrição. Com `tool_choice: { type: "tool" }` o output é sempre JSON válido.

### Por que valor em centavos (integer)?
Floats têm imprecisão binária: `0.1 + 0.2 !== 0.3`. Guardar R$ 12,90 como `1290` (integer) elimina arredondamentos incorretos nas agregações dos dashboards.

### Por que single-user sem login?
App pessoal de portfólio. Adicionar OAuth adicionaria ~200 linhas de boilerplate sem agregar valor à demonstração. O token secreto é suficiente para manter privado.

### Por que esses 6 gráficos e não outros?
Cada gráfico responde uma pergunta específica (veja tabela acima). Pizza de método de pagamento (PIX/cartão) foi descartada — não responde nenhuma pergunta acionável. Heatmap estilo GitHub é bonito mas lento de ler para detecção de padrões. Os 6 escolhidos cobrem: quanto, onde, quando (diário), ritmo, exceções e padrão semanal.

---

## Roadmap — V2

- [ ] Leitura de NF-e via QR code
- [ ] Parsing de boletos
- [ ] Categorização automática por LLM (baseada no histórico do usuário)
- [ ] Metas de orçamento por categoria com alertas
- [ ] Exportação para CSV
- [ ] Modo offline completo (sync quando voltar online)
