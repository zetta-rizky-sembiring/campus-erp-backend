const { ApolloServer } = require('@apollo/server');
const system = require('../features/system');

const server = new ApolloServer({
  typeDefs: [system.typeDefs],
  resolvers: [system.resolvers],
});

module.exports = server;