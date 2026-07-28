// *************** IMPORT MODULE ***************
const typeDefs = require('./system.typedef');
const { Ping } = require('./system.query.resolver');

// *************** EXPORT MODULE ***************
module.exports = {
  typeDefs,
  resolvers: {
    Query: {
      ping: Ping,
    },
  },
};