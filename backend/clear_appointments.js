const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

try {
  await prisma.appointment.deleteMany({});
  console.log('Deleted all appointments');
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
