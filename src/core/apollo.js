// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('@apollo/server');

// *************** IMPORT MODULE ***************
const system = require('../features/system');
const curriculum = require('../features/academic/curriculum');
const student = require('../features/users/student');
const enrollment = require('../features/academic/enrollment');

// *************** GLOBAL VARIABLES ***************
const server = new ApolloServer({
  typeDefs: [system.typeDefs, curriculum.typeDefs, student.typeDefs, enrollment.typeDefs],
  resolvers: [
    system.resolvers,
    {
      Query: { ...curriculum.queryResolvers, ...student.queryResolvers },
      Mutation: { ...curriculum.mutationResolvers, ...student.mutationResolvers, ...enrollment.mutationResolvers },
    },
  ],
});

// *************** EXPORT MODULE ***************
module.exports = server;