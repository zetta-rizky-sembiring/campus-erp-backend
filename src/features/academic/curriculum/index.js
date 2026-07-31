const typeDefs = require('./curriculum.typedef');
const mutationResolvers = require('./curriculum.mutation.resolver');
const queryResolvers = require('./curriculum.query.resolver');
const typeResolvers = require('./curriculum.type.resolver');

module.exports = {
    typeDefs,
    mutationResolvers,
    queryResolvers,
    typeResolvers,
}