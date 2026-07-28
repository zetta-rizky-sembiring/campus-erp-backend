// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('@apollo/server');

// *************** IMPORT MODULE ***************
const system = require('../features/system');

// *************** GLOBAL VARIABLES ***************

const server = new ApolloServer({
  typeDefs: [system.typeDefs],
  resolvers: [system.resolvers],
});

// *************** EXPORT MODULE ***************
module.exports = server;