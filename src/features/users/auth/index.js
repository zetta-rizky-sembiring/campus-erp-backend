// *************** IMPORT MODULE ***************
const typeDefs = require('./auth.typedef');
const mutationResolvers = require('./auth.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs,
  mutationResolvers,
};
