const { PrismaClient } = require('@prisma/client');
const { getUserId, getUserIdFromToken } = require('./utils/jwt');

const prisma = new PrismaClient();

const createContext = async (ctx) => {
  let userId = null;

  // Debug log
  // console.log('Creating context:', ctx.req ? 'HTTP' : 'WS');

  // HTTP Request
  if (ctx.req) {
    userId = ctx.req.headers.authorization ? getUserId(ctx.req) : null;
  }
  // WebSocket Connection (graphql-ws)
  else if (ctx.connectionParams) {
    // console.log('WS Connection Params:', ctx.connectionParams);
    const params = ctx.connectionParams;
    const token = params.Authorization || params.authorization || params.authToken;
    if (token) {
      userId = getUserIdFromToken(token);
    }
  }

  let user = null;

  if (userId) {
    try {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } catch (e) {
      console.error('Error fetching user in context:', e);
    }
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
