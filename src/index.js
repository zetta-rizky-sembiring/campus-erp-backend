// *************** IMPORT LIBRARY ***************
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { expressMiddleware } = require('@apollo/server/express4');

// *************** IMPORT MODULE ***************
const config = require('./core/config');
require('./core/db');

const server = require('./core/apollo');
const AuthMiddleware = require('./shared/middleware/auth.middleware');
const { InitializeGradeAuditorJob } = require('./jobs/missing_grades.job');

// *************** MUTATION ***************
/**
 * Start the Express server and integrate Apollo Server for GraphQL.
 *
 * @returns {Promise<void>} Resolves when the server is listening.
 */
async function StartServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  await server.start();

  // ***************Wait for MongoDB before scheduling the background grade auditor
  await mongoose.connection.asPromise();
  InitializeGradeAuditorJob();

  app.use(AuthMiddleware);

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: req.user,
        AcademicYearLoader: require('./loaders/academic_year.loader')(),
        req,
      }),
    }),
  );

  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
    console.log(`GraphQL: http://localhost:${config.port}/graphql`);
  });
}

// *************** EXPORT MODULE ***************
StartServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
