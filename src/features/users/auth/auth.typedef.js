// *************** EXPORT MODULE ***************
module.exports = `
  enum UserRole {
    ADMIN
    TEACHER
  }

  type User {
    _id: ID!
    name: String
    email: String!
    role: UserRole!
  }

  input LoginInput {
    name: String
    email: String!
    password: String!
  }

  type Mutation {
    Login(input: LoginInput!): String!
  }
`;
