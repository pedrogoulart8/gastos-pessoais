import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Mercado", color: "#22c55e", icon: "ShoppingCart" },
  { name: "Transporte", color: "#3b82f6", icon: "Car" },
  { name: "Lazer", color: "#a855f7", icon: "Gamepad2" },
  { name: "Saúde", color: "#ef4444", icon: "Heart" },
  { name: "Casa", color: "#f97316", icon: "Home" },
  { name: "Contas", color: "#eab308", icon: "Receipt" },
  { name: "Outros", color: "#6b7280", icon: "MoreHorizontal" },
];

async function main() {
  console.log("Seeding categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
