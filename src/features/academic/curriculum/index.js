// *************** IMPORT MODULE ***************
const typeDefs = require('./curriculum.typedef');
const mutationResolvers = require('./curriculum.mutation.resolver');
const queryResolvers = require('./curriculum.query.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
    typeDefs,
    mutationResolvers,
    queryResolvers,
}