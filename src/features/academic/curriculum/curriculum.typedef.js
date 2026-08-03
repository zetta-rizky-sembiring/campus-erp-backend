// *************** EXPORT MODULE ***************
module.exports = `
  type GradingRule {
    label: String!
    operator: String!
    threshold: Float!
  }

  input GradingRuleInput {
    label: String!
    operator: String!
    threshold: Float!
  }

  type Block {
    _id: ID!
    name: String!
    academic_year: String!
    grading_rules: [GradingRule!]!
  }

  input CreateBlockInput {
    name: String!
    academic_year: String!
    grading_rules: [GradingRuleInput!]
  }

  input UpdateBlockInput {
    name: String
    academic_year: String
    grading_rules: [GradingRuleInput!]
  }

  type Subject {
    _id: ID!
    name: String!
    block_id: ID!
    weightage: Float!
    grading_rules: [GradingRule!]!
  }

  input CreateSubjectInput {
    name: String!
    block_id: ID!
    weightage: Float!
    grading_rules: [GradingRuleInput!]
  }

  input UpdateSubjectInput {
    name: String
    block_id: ID
    weightage: Float
    grading_rules: [GradingRuleInput!]
  }

  type Test {
    _id: ID!
    name: String!
    subject_id: ID!
    weightage: Float!
    grading_rules: [GradingRule!]!
  }

  input CreateTestInput {
    name: String!
    subject_id: ID!
    weightage: Float!
    grading_rules: [GradingRuleInput!]
  }

  input UpdateTestInput {
    name: String
    subject_id: ID
    weightage: Float
    grading_rules: [GradingRuleInput!]
  }

  type Query {
    GetAllBlocks: [Block!]!
    GetOneBlock(id: ID!): Block
    GetAllSubjects: [Subject!]!
    GetOneSubject(id: ID!): Subject
    GetAllTests: [Test!]!
    GetOneTest(id: ID!): Test
  }

  type Mutation {
    CreateBlock(input: CreateBlockInput!): Block!
    UpdateBlock(id: ID!, input: UpdateBlockInput!): Block!
    DeleteBlock(id: ID!): Boolean!

    CreateSubject(input: CreateSubjectInput!): Subject!
    UpdateSubject(id: ID!, input: UpdateSubjectInput!): Subject!
    DeleteSubject(id: ID!): Boolean!

    CreateTest(input: CreateTestInput!): Test!
    UpdateTest(id: ID!, input: UpdateTestInput!): Test!
    DeleteTest(id: ID!): Boolean!
  }
`;
