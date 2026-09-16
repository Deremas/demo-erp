import { PrismaClient } from "./generated/prisma";
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$connect();
    console.log("Connection successful");
    await prisma.$disconnect();
  } catch (e) {
    console.error("Connection failed", e);
  }
}
main();
