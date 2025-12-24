const { PrismaClient } = require('@prisma/client');
const { getUserId } = require('./utils/jwt');

const prisma = new PrismaClient();

const createContext = async ({ req }) => {
  const userId = req && req.headers.authorization ? getUserId(req) : null;
  let user = null;
  
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  }

  return {
    prisma,
    userId,
    user,
  };
};

module.exports = {
  createContext,
  prisma,
};
