// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('@apollo/server');

// *************** IMPORT MODULE ***************
const system = require('../features/system');
const curriculum = require('../features/academic/curriculum');

// *************** GLOBAL VARIABLES ***************
const server = new ApolloServer({
  typeDefs: [system.typeDefs, curriculum.typeDefs],
  resolvers: [
    system.resolvers,
    {
      Query: curriculum.queryResolvers,
      Mutation: curriculum.mutationResolvers,
    },
  ],
});

// *************** EXPORT MODULE ***************
module.exports = server;