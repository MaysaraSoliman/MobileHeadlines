require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { ApolloServer, ApolloServerPluginLandingPageLocalDefault } = require('apollo-server-express');

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

const server = new ApolloServer({
  schema: schemaWithResolvers,
  context: createContext,
});

async function start() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen(4000, '0.0.0.0', () =>
    console.log('🚀 http://192.168.1.11:4000/graphql')
  );
}

start();
