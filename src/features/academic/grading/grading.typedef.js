module.exports = `
  type StudentGrade {
    id: ID!
    student_id: ID!
    test_id: ID!
    academic_year_id: ID!
    score: Float!
  }

  input StudentScoreInput {
    student_id: ID!
    score: Float!
  }

  input SubmitTestGradesInput {
    academic_year_id: ID!
    test_id: ID!
    grades: [StudentScoreInput!]!
  }

  type Mutation {
    SubmitTestGrades(input: SubmitTestGradesInput!): [StudentGrade!]! @auth(requires: TEACHER)
  }
`;
