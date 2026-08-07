// *************** EXPORT MODULE ***************
module.exports = `
  enum UserRole {
    ADMIN
    TEACHER
  }

  type User {
    _id: ID!
    email: String!
    role: UserRole!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Mutation {
    Login(input: LoginInput!): String!
  }
`;
