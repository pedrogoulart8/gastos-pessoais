import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const VIDEO_TAG = "[VIDEO_SEED]";

async function main() {
  const { count } = await prisma.transaction.deleteMany({
    where: { notes: VIDEO_TAG },
  });
  console.log(`✓ ${count} transações fictícias removidas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
