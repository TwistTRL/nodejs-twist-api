console.log("~~~~~~~~~~~~~~~~~~~~");
console.log("~~~   TWIST API  ~~~");
console.log("~~~~~~~~~~~~~~~~~~~~");
console.log("starting time: ", new Date().toString());
console.log("NODE_ENV :", process.env.NODE_ENV);
console.log("HTTP_PORT :", process.env.HTTP_PORT);

const webServer = require("./services/web-server.js");
const database = require("./services/database.js");
const databasePrd = require("./services/database-prd.js");
const dbConfig = require("./config/database-config.js");
const intervalUpdate = require("./services/interval-update.js");
const scheduledCensusUpdate = require("./services/scheduled-cache-update");


let checkPatientsInterval;

const defaultThreadPoolSize = 4;

// Increase thread pool size by poolMax
process.env.UV_THREADPOOL_SIZE = dbConfig.poolMax + defaultThreadPoolSize;

async function startup() {
  try {
    console.log("  Initializing database module");

    await database.initialize();
    await databasePrd.initialize();
  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }

  try {
    console.log("  Initializing web server module");

    await webServer.initialize();
  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }

  try {
    console.log("  Initializing cache-updating module");

    await intervalUpdate.initialize();

    // temp disable update patients interval 10/31/20
    // checkPatientsInterval = intervalUpdate.startInterval()
  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }

  if (process.env.NODE_ENV === "production") {
    initializeCensus();
  }
}

const initializeCensus = async () => {
  try {
    console.log("  Initializing census cache updating module");

    await scheduledCensusUpdate.initialize();

  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }
}

async function shutdown(e) {
  let err = e;
  console.log("Shutting down application");

  try {
    console.log("Closing web server module");

    await webServer.close();
  } catch (e) {
    console.error(e);

    err = err || e;
  }

  try {
    console.log("Closing database module");

    await database.close();
    await databasePrd.close();
  } catch (e) {
    console.error(e);

    err = err || e;
  }

  // temp disable stop patients interval 10/31/20
  // try {
  //   console.log("Closing cache-updating module");

  //   intervalUpdate.close(checkPatientsInterval);
  // } catch (e) {
  //   console.error(e);

  //   err = err || e;
  // }

  console.log("Exiting process");

  if (err) {
    process.exit(1); // Non-zero failure code
  } else {
    process.exit(0);
  }
}

// START AT HERE 
startup();

process.on("SIGTERM", () => {
  console.log(`
  🔚 Received SIGTERM`);
  shutdown();
});

process.on("SIGINT", () => {
  console.log(`
  🔚 Received SIGINT`);
  shutdown();
});

process.on("uncaughtException", (err) => {
  console.log(`
  🔚 Uncaught exception`);
  console.error(err);
  shutdown(err);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('🔚 Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
