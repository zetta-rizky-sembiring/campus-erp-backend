// *************** IMPORT MODULE ***************
const typeDefs = require('./student.typedef');
const mutationResolvers = require('./student.mutation.resolver');
const queryResolvers = require('./student.query.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
    typeDefs,
    mutationResolvers,
    queryResolvers,
}