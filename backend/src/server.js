require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { createServer } = require('node:http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/use/ws');
const { join } = require('node:path');
const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { addResolversToSchema } = require('@graphql-tools/schema');

const resolvers = require('./graphql/resolvers');
const { createContext } = require('./context');

const app = express();
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ✅ Load GraphQL schema from files */
const schema = loadSchemaSync(join(__dirname, 'graphql/*.graphql'), {
  loaders: [new GraphQLFileLoader()],
});

/* ✅ Attach resolvers */
const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers,
});

// Create HTTP server
const httpServer = createServer(app);

// Create WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Enable GraphQL Subscriptions
const serverCleanup = useServer({
  schema: schemaWithResolvers,
  context: (ctx, msg, args) => {
    return createContext(ctx);
  },
  onConnect: (ctx) => {
    console.log('Connected to WebSocket');
  },
  onDisconnect: (ctx) => {
    console.log('Disconnected from WebSocket');
  },
  onError: (ctx, msg, errors) => {
    console.error('WebSocket Error:', errors);
  },
}, wsServer);

const server = new ApolloServer({
  schema: schemaWithResolvers,
  context: createContext,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

async function start() {
  await server.start();
  server.applyMiddleware({ app });

  // Use 0.0.0.0 to listen on all interfaces
  httpServer.listen(4000, '0.0.0.0', () => {
    console.log('🚀 Server ready at http://localhost:4000/graphql');
    console.log('🚀 Subscriptions ready at ws://localhost:4000/graphql');
    console.log('⚠️  For physical devices, use your LAN IP instead of localhost!');
  });
}

start(); // NOSONAR: Top-level await is not available in CommonJS modules
