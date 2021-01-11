const oracledb = require("oracledb");
const dbConfig = require("../config/database-config.js");
const DatabaseError = require("../utils/errors").DatabaseError;

// https://github.com/oracle/node-oracledb/blob/master/doc/api.md#-16173-fetching-dates-and-timestamps
// in our database, some date is UTC and some is EST
// so fetch the date as String to avoid auto convertion
oracledb.fetchAsString = [oracledb.DATE];
oracledb.fetchAsBuffer = [ oracledb.BLOB ];

async function initialize() {
  if (dbConfig.user && dbConfig.password) {
    await oracledb.createPool(dbConfig);
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  } else {
    throw new Error("user or password is null");
  }
}

async function close() {
  await oracledb.getPool(dbConfig.poolAlias).close();
  console.log(`database ${dbConfig.poolAlias} closed`);
}

function withConnection(func) {
  return async function (...args) {
    try {
      let conn = await oracledb.getConnection(dbConfig.poolAlias);
      let result = await func(conn, ...args);
      await conn.close();
      return result;
    } catch (e) {
      var e_string = e.message.toString();
      console.log(e_string + "\n");
      if (e_string.includes("ORA-00904")) {
        console.log("ORA-00904" + "\n");
        throw new DatabaseError(e_string);
      }

      if (e_string.includes("NJS-040")) {
        console.log("NJS-040" + "\n");
        // throw new DatabaseError(e_string);
        process.exit(10);
      }

      return e_string;
    }
  };
}

module.exports = {
  initialize,
  close,
  withConnection,
};
