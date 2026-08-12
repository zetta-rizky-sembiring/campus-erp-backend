// *************** IMPORT MODULE ***************
const typeDefs = require('./grading.typedef');
const mutationResolvers = require('./grading.mutation.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs,
  mutationResolvers,
};
