import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const VIDEO_TAG = "[VIDEO_SEED]";

type PaymentMethod = "PIX" | "CARD" | "BOLETO" | "CASH" | "OTHER";

type VideoTx = {
  date: string;
  amount: number;
  merchant: string;
  description?: string;
  paymentMethod: PaymentMethod;
  category: string;
};

const transactions: VideoTx[] = [
  // === ABRIL 2026 ===
  // Mercado
  { date: "2026-04-03", amount: 15630, merchant: "Pão de Açúcar", paymentMethod: "CARD", category: "Mercado", description: "Compra da semana" },
  { date: "2026-04-08", amount: 28750, merchant: "Assaí Atacadista", paymentMethod: "PIX", category: "Mercado" },
  { date: "2026-04-12", amount: 41280, merchant: "Atacadão", paymentMethod: "CARD", category: "Mercado", description: "Compra do mês" },
  { date: "2026-04-15", amount: 8945, merchant: "Extra", paymentMethod: "PIX", category: "Mercado" },
  { date: "2026-04-17", amount: 6290, merchant: "Hortifruti", paymentMethod: "PIX", category: "Mercado" },
  // Transporte
  { date: "2026-04-01", amount: 1850, merchant: "Uber", paymentMethod: "CARD", category: "Transporte" },
  { date: "2026-04-05", amount: 2430, merchant: "Uber", paymentMethod: "CARD", category: "Transporte" },
  { date: "2026-04-09", amount: 25000, merchant: "Posto Shell", paymentMethod: "CARD", category: "Transporte", description: "Abastecer" },
  { date: "2026-04-13", amount: 1580, merchant: "Uber", paymentMethod: "CARD", category: "Transporte" },
  { date: "2026-04-16", amount: 2500, merchant: "Estapar", paymentMethod: "PIX", category: "Transporte", description: "Estacionamento shopping" },
  // Lazer
  { date: "2026-04-02", amount: 2190, merchant: "Spotify", paymentMethod: "CARD", category: "Lazer", description: "Assinatura mensal" },
  { date: "2026-04-02", amount: 4490, merchant: "Netflix", paymentMethod: "CARD", category: "Lazer", description: "Assinatura mensal" },
  { date: "2026-04-06", amount: 4800, merchant: "Cinemark", paymentMethod: "CARD", category: "Lazer" },
  { date: "2026-04-10", amount: 6780, merchant: "iFood", paymentMethod: "PIX", category: "Lazer" },
  { date: "2026-04-11", amount: 9500, merchant: "Bar do Zé", paymentMethod: "PIX", category: "Lazer" },
  { date: "2026-04-14", amount: 7990, merchant: "Steam", paymentMethod: "CARD", category: "Lazer", description: "Jogo novo" },
  // Saúde
  { date: "2026-04-04", amount: 8750, merchant: "Drogasil", paymentMethod: "CARD", category: "Saúde" },
  { date: "2026-04-05", amount: 9990, merchant: "Smart Fit", paymentMethod: "CARD", category: "Saúde", description: "Mensalidade" },
  { date: "2026-04-14", amount: 18000, merchant: "Dra. Camila Silva", paymentMethod: "PIX", category: "Saúde", description: "Consulta" },
  // Casa
  { date: "2026-04-07", amount: 23470, merchant: "Leroy Merlin", paymentMethod: "CARD", category: "Casa", description: "Ferramentas" },
  { date: "2026-04-10", amount: 15000, merchant: "Diarista Maria", paymentMethod: "PIX", category: "Casa", description: "Limpeza mensal" },
  // Contas
  { date: "2026-04-05", amount: 185000, merchant: "Imobiliária Central", paymentMethod: "BOLETO", category: "Contas", description: "Aluguel" },
  { date: "2026-04-05", amount: 18940, merchant: "Enel", paymentMethod: "BOLETO", category: "Contas", description: "Energia elétrica" },
  { date: "2026-04-10", amount: 10990, merchant: "Vivo Fibra", paymentMethod: "CARD", category: "Contas", description: "Internet" },
  { date: "2026-04-10", amount: 6990, merchant: "Claro", paymentMethod: "CARD", category: "Contas", description: "Plano celular" },
  { date: "2026-04-15", amount: 27530, merchant: "Prefeitura Municipal", paymentMethod: "BOLETO", category: "Contas", description: "IPTU parcela 4/10" },
  // Outros
  { date: "2026-04-12", amount: 4500, merchant: "Barbearia do João", paymentMethod: "PIX", category: "Outros" },
  { date: "2026-04-17", amount: 12000, merchant: "Amazon", paymentMethod: "CARD", category: "Outros", description: "Presente aniversário" },

  // === MARÇO 2026 ===
  // Mercado
  { date: "2026-03-05", amount: 31240, merchant: "Assaí Atacadista", paymentMethod: "PIX", category: "Mercado" },
  { date: "2026-03-11", amount: 14280, merchant: "Pão de Açúcar", paymentMethod: "CARD", category: "Mercado" },
  { date: "2026-03-18", amount: 38960, merchant: "Atacadão", paymentMethod: "CARD", category: "Mercado", description: "Compra do mês" },
  { date: "2026-03-25", amount: 7820, merchant: "Hortifruti", paymentMethod: "PIX", category: "Mercado" },
  // Transporte
  { date: "2026-03-02", amount: 2250, merchant: "Uber", paymentMethod: "CARD", category: "Transporte" },
  { date: "2026-03-08", amount: 2810, merchant: "Uber", paymentMethod: "CARD", category: "Transporte" },
  { date: "2026-03-12", amount: 28000, merchant: "Posto Shell", paymentMethod: "CARD", category: "Transporte", description: "Abastecer" },
  { date: "2026-03-20", amount: 1940, merchant: "Uber", paymentMethod: "CARD", category: "Transporte" },
  { date: "2026-03-26", amount: 4000, merchant: "Bilhete Único", paymentMethod: "PIX", category: "Transporte", description: "Recarga" },
  // Lazer
  { date: "2026-03-02", amount: 2190, merchant: "Spotify", paymentMethod: "CARD", category: "Lazer" },
  { date: "2026-03-02", amount: 4490, merchant: "Netflix", paymentMethod: "CARD", category: "Lazer" },
  { date: "2026-03-07", amount: 5200, merchant: "Cinemark", paymentMethod: "CARD", category: "Lazer" },
  { date: "2026-03-15", amount: 8950, merchant: "iFood", paymentMethod: "PIX", category: "Lazer" },
  { date: "2026-03-22", amount: 21000, merchant: "Outback", paymentMethod: "CARD", category: "Lazer", description: "Jantar" },
  // Saúde
  { date: "2026-03-05", amount: 9990, merchant: "Smart Fit", paymentMethod: "CARD", category: "Saúde", description: "Mensalidade" },
  { date: "2026-03-13", amount: 18000, merchant: "Dra. Camila Silva", paymentMethod: "PIX", category: "Saúde", description: "Consulta" },
  { date: "2026-03-16", amount: 14580, merchant: "Drogasil", paymentMethod: "CARD", category: "Saúde" },
  { date: "2026-03-27", amount: 32000, merchant: "Lab. Sabin", paymentMethod: "PIX", category: "Saúde", description: "Exames de rotina" },
  // Casa
  { date: "2026-03-09", amount: 8760, merchant: "Carrefour", paymentMethod: "PIX", category: "Casa", description: "Material de limpeza" },
  { date: "2026-03-11", amount: 15000, merchant: "Diarista Maria", paymentMethod: "PIX", category: "Casa", description: "Limpeza mensal" },
  { date: "2026-03-28", amount: 12500, merchant: "Casas Bahia", paymentMethod: "CARD", category: "Casa", description: "Utensílios cozinha" },
  // Contas
  { date: "2026-03-05", amount: 185000, merchant: "Imobiliária Central", paymentMethod: "BOLETO", category: "Contas", description: "Aluguel" },
  { date: "2026-03-05", amount: 15620, merchant: "Enel", paymentMethod: "BOLETO", category: "Contas", description: "Energia elétrica" },
  { date: "2026-03-10", amount: 10990, merchant: "Vivo Fibra", paymentMethod: "CARD", category: "Contas", description: "Internet" },
  { date: "2026-03-10", amount: 6990, merchant: "Claro", paymentMethod: "CARD", category: "Contas", description: "Plano celular" },
  { date: "2026-03-15", amount: 85000, merchant: "Nubank", paymentMethod: "CARD", category: "Contas", description: "Fatura cartão" },
  // Outros
  { date: "2026-03-19", amount: 8000, merchant: "Floricultura Jardim", paymentMethod: "PIX", category: "Outros", description: "Presente" },
  { date: "2026-03-24", amount: 9500, merchant: "Livraria Cultura", paymentMethod: "CARD", category: "Outros", description: "Livros" },
];

async function main() {
  console.log("Carregando categorias...");
  const categories = await prisma.category.findMany();
  const categoryByName = new Map(categories.map((c) => [c.name, c.id]));

  console.log(`Inserindo ${transactions.length} transações fictícias (tag: ${VIDEO_TAG})...`);
  let created = 0;
  for (const tx of transactions) {
    const categoryId = categoryByName.get(tx.category);
    if (!categoryId) {
      console.warn(`⚠ Categoria não encontrada: ${tx.category}`);
      continue;
    }
    await prisma.transaction.create({
      data: {
        date: new Date(`${tx.date}T12:00:00-03:00`),
        amount: tx.amount,
        merchant: tx.merchant,
        description: tx.description,
        paymentMethod: tx.paymentMethod,
        categoryId,
        notes: VIDEO_TAG,
      },
    });
    created++;
  }

  console.log(`✓ ${created} transações criadas. Para remover: npm run db:unseed:video`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
