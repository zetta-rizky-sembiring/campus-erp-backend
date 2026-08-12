// *************** IMPORT LIBRARY ***************
const { ApolloServer } = require('@apollo/server');
const { makeExecutableSchema } = require('@graphql-tools/schema');

// *************** IMPORT MODULE ***************
const system = require('../features/system');
const curriculum = require('../features/academic/curriculum');
const student = require('../features/users/student');
const auth = require('../features/users/auth');
const enrollment = require('../features/academic/enrollment');
const studentLoaderResolver = require('../features/users/student/student.loader.resolver');
const { AuthDirectiveTransformer, AuthDirectiveTypeDefs } = require('../shared/directives/auth.directive');
const grading = require('../features/academic/grading');

// *************** GLOBAL VARIABLES ***************
const typeDefs = [
  AuthDirectiveTypeDefs,
  system.typeDefs,
  curriculum.typeDefs,
  student.typeDefs,
  auth.typeDefs,
  enrollment.typeDefs,
  grading.typeDefs,
];
const resolvers = [
  system.resolvers,
  {
    Query: { ...curriculum.queryResolvers, ...student.queryResolvers },
    Mutation: {
      ...curriculum.mutationResolvers,
      ...student.mutationResolvers,
      ...auth.mutationResolvers,
      ...enrollment.mutationResolvers,
      ...grading.mutationResolvers,
    },
    Student: {
      academic_years: studentLoaderResolver.StudentAcademicYears,
    },
  },
];

const schema = makeExecutableSchema({ typeDefs, resolvers });
const transformedSchema = AuthDirectiveTransformer(schema, 'auth');

const server = new ApolloServer({
  schema: transformedSchema,
});

// *************** EXPORT MODULE ***************
module.exports = server;
