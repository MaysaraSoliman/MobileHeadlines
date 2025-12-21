const authMutations = require('./auth');

module.exports = {
  Mutation: {
    ...authMutations,
  },
};
