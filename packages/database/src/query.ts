import { PrismaClient, BackOrder, Prisma, ProductStatus } from "@prisma/client";

function roundToTwoCeil(value: number): number {
  return Math.ceil(value * 100) / 100;
}

const runQuery = async () => {
  const prisma = new PrismaClient({});

  const products = await prisma.product.findMany({});

  await prisma.$disconnect();
};

runQuery().catch((e) => console.error(e));
