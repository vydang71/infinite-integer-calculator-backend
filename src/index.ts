require('dotenv').config();

import { ApplicationConfig, InfiniteIntegerCalculatorBackendApplication } from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new InfiniteIntegerCalculatorBackendApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`API explorer is running at ${url}/explorer`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
    appConfig: {
      jwtSecret: process.env.JWT_SECRET,
      loginDuration: process.env.LOGIN_DURATION
    },
    infraConfig: {
      dbUrl: process.env.DB_URL,
    }
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
