// *************** EXPORT MODULE ***************
module.exports = `
  type AcademicYear {
    _id: ID!
    name: String!
    start_date: String!
    end_date: String!
    status: String!
    block_ids: [ID!]!
    student_ids: [ID!]
  }

  input EnrollStudentInput {
    student_ids: [ID!]!
    academic_year_id: ID!
  }

  type Mutation {
    EnrollStudent(input: EnrollStudentInput!): AcademicYear!
    EnrollStudentsToYear(input: EnrollStudentInput!): AcademicYear!
  }
`;