const { PrismaClient } = require('@prisma/client');
const { getUserId } = require('./utils/jwt');

const prisma = new PrismaClient();

const createContext = ({ req }) => {
  const userId = req && req.headers.authorization ? getUserId(req) : null;
  return {
    prisma,
    userId,
  };
};

module.exports = {
  createContext,
  prisma,
};
