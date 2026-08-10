// *************** IMPORT LIBRARY ***************
const { defaultFieldResolver, GraphQLError } = require('graphql');
const { mapSchema, MapperKind } = require('@graphql-tools/utils');

const AuthDirectiveTypeDefs = `
  directive @auth(requires: Role = ADMIN) on FIELD_DEFINITION

  enum Role {
    ADMIN
    TEACHER
  }
`;

/**
 * Transform the GraphQL schema by wrapping fields annotated with `@auth`.
 *
 * The wrapped resolver validates the authenticated user and required role
 * before executing the original resolver.
 *
 * @param {import('graphql').GraphQLSchema} schema GraphQL executable schema.
 * @param {string} [directiveName='auth'] Authentication directive name.
 * @returns {import('graphql').GraphQLSchema} Transformed GraphQL schema.
 */
function AuthDirectiveTransformer(schema, directiveName = 'auth') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // ***************Find the @auth directive on the current field.
      const directive = fieldConfig.astNode?.directives?.find((d) => d.name.value === directiveName);

      if (!directive) {
        return fieldConfig;
      }

      // ***************Read the required role from the directive arguments.
      const requiresArg = directive.arguments?.find((arg) => arg.name.value === 'requires');

      const requiredRole = requiresArg?.value?.value ?? 'ADMIN';
      const originalResolver = fieldConfig.resolve || defaultFieldResolver;

      fieldConfig.resolve = async (source, args, context, info) => {
        const user = context?.user;

        if (!user) {
          throw new GraphQLError('Unauthenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
              statusCode: 401,
            },
          });
        }

        // ***************Compare user role against the required role hierarchy.
        const roleHierarchy = {
          TEACHER: 1,
          ADMIN: 2,
        };

        const userRole = String(user.role).toUpperCase();

        if ((roleHierarchy[userRole] ?? 0) < (roleHierarchy[requiredRole] ?? 0)) {
          throw new GraphQLError('Forbidden', {
            extensions: {
              code: 'FORBIDDEN',
              statusCode: 403,
            },
          });
        }

        // ***************Execute the original resolver after authorization succeeds.
        return originalResolver(source, args, context, info);
      };

      return fieldConfig;
    },
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  AuthDirectiveTypeDefs,
  AuthDirectiveTransformer,
};
