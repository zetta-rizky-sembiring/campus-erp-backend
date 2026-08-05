// *************** EXPORT MODULE ***************
module.exports = `
  type Student {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    student_number: String!
    registration_date: String!
    academic_year_ids: [ID!]!
    academic_years: [AcademicYear!]!
  }

  input CreateStudentInput {
    first_name: String!
    last_name: String!
    email: String!
    student_number: String!
    registration_date: String
  }
  
  type PaginatedStudentResponse {
    total_count: Int!
    current_page: Int!
    total_pages: Int!
    data: [Student!]!
  }

  input GetStudentsByAcademicYearInput {
    academic_year_id: ID!
    page: Int
    limit: Int
    search: String
  }

  type Query {
    GetAllStudents: [Student!]
    GetStudentsByAcademicYear(input: GetStudentsByAcademicYearInput!): PaginatedStudentResponse!
  }

  type Mutation {
    CreateStudent(input: CreateStudentInput!): Student!
  }
`;
