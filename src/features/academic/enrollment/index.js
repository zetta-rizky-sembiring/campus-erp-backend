// *************** IMPORT MODULE ***************
const typeDefs = require('./enrollment.typedef');
const mutationResolvers = require('./enrollment.mutation.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs,
  mutationResolvers,
};
