console.log("~~~~~~~~~~~~~~~~~~~~");
console.log("~~~   TWIST API  ~~~");
console.log("~~~~~~~~~~~~~~~~~~~~");
console.log("starting time: ", new Date().toString());
console.log("NODE_ENV :", process.env.NODE_ENV);
console.log("HTTP_PORT :", process.env.HTTP_PORT);

const webServer = require("./services/web-server.js");
const database = require("./services/database.js");
const dbConfig = require("./config/database-config.js");
const intervalUpdate = require("./services/interval-update.js");

let checkPatientsInterval;

const defaultThreadPoolSize = 4;

// Increase thread pool size by poolMax
process.env.UV_THREADPOOL_SIZE = dbConfig.poolMax + defaultThreadPoolSize;

async function startup() {
  try {
    console.log("  Initializing database module");

    await database.initialize();
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
    checkPatientsInterval = intervalUpdate.startInterval()
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
  } catch (e) {
    console.error(e);

    err = err || e;
  }

  try {
    console.log("Closing cache-updating module");

    intervalUpdate.close();
  } catch (e) {
    console.error(e);

    err = err || e;
  }

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
