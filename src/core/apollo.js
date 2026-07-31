// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('@apollo/server');

// *************** IMPORT MODULE ***************
const system = require('../features/system');
const curriculumTypeDefs = require('../features/academic/curriculum/curriculum.typedef');
const curriculumMutationResolvers = require('../features/academic/curriculum/curriculum.mutation.resolver');
const curriculumQueryResolvers = require('../features/academic/curriculum/curriculum.query.resolver');
const curriculumTypeResolvers = require('../features/academic/curriculum/curriculum.type.resolver');

// *************** GLOBAL VARIABLES ***************
const server = new ApolloServer({
  typeDefs: [system.typeDefs, curriculumTypeDefs],
  resolvers: [
    system.resolvers,
    {
      Query: curriculumQueryResolvers,
      Mutation: curriculumMutationResolvers,

      ...curriculumTypeResolvers,
    },
  ],
});

// *************** EXPORT MODULE ***************
module.exports = server;