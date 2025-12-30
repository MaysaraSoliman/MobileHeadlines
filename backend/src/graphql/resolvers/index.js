const queries = require('../queries');
const mutations = require('../mutations');
const chatResolvers = require('./chat.resolver');

module.exports = {
  Query: {
    ...queries.Query,
    ...chatResolvers.Query,
  },
  Mutation: {
    ...mutations.Mutation,
    ...chatResolvers.Mutation,
  },
  Subscription: {
    ...chatResolvers.Subscription,
  },
  Chat: chatResolvers.Chat,
};
