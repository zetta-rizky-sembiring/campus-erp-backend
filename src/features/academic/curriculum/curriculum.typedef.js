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
    id: ID!
    name: String!
    academicYear: String!
    gradingRules: [GradingRule!]!
  }

  input CreateBlockInput {
    name: String!
    academicYear: String!
    gradingRules: [GradingRuleInput!]
  }

  input UpdateBlockInput {
    name: String
    academicYear: String
    gradingRules: [GradingRuleInput!]
  }

  type Subject {
    id: ID!
    name: String!
    blockId: ID!
    weightage: Float!
    gradingRules: [GradingRule!]!
  }

  input CreateSubjectInput {
    name: String!
    blockId: ID!
    weightage: Float!
    gradingRules: [GradingRuleInput!]
  }

  input UpdateSubjectInput {
    name: String
    blockId: ID
    weightage: Float
    gradingRules: [GradingRuleInput!]
  }

  type Test {
    id: ID!
    name: String!
    subjectId: ID!
    weightage: Float!
    gradingRules: [GradingRule!]!
  }

  input CreateTestInput {
    name: String!
    subjectId: ID!
    weightage: Float!
    gradingRules: [GradingRuleInput!]
  }

  input UpdateTestInput {
    name: String
    subjectId: ID
    weightage: Float
    gradingRules: [GradingRuleInput!]
  }

  type Query {
    blocks: [Block!]!
    block(id: ID!): Block
    subjects: [Subject!]!
    subject(id: ID!): Subject
    tests: [Test!]!
    test(id: ID!): Test
  }

  type Mutation {
    createBlock(input: CreateBlockInput!): Block!
    updateBlock(id: ID!, input: UpdateBlockInput!): Block!
    deleteBlock(id: ID!): Boolean!

    createSubject(input: CreateSubjectInput!): Subject!
    updateSubject(id: ID!, input: UpdateSubjectInput!): Subject!
    deleteSubject(id: ID!): Boolean!

    createTest(input: CreateTestInput!): Test!
    updateTest(id: ID!, input: UpdateTestInput!): Test!
    deleteTest(id: ID!): Boolean!
  }
`;
