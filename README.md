# Gastos Visíveis

> Aplicativo de controle de gastos pessoais com leitura de notas fiscais e boletos por IA. O app possibilita tirar foto do comprovante de pagamento pelo celular e depois envia essa imagem para a API do Claude. A IA extrai automaticamente data, valor, destinatário e método de pagamento, e salva no banco de dados. 


![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Recharts](https://img.shields.io/badge/Recharts-3-ff6b6b)
![Claude](https://img.shields.io/badge/Claude-Sonnet%204.6-orange?logo=anthropic)
![Vitest](https://img.shields.io/badge/Vitest-21%20testes-green?logo=vitest)

---

## Como funciona

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
