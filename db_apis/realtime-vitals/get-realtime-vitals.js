/*
 * @Author: Peng Zeng
 * @Date: 2021-02-25 18:49:27
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-28 20:25:58
 */

 // problem: need SYSDBA to grant
// Error starting at line : 13 in command -
// GRANT CHANGE NOTIFICATION TO twist
// Error report -
// ORA-01031: insufficient privileges
// 01031. 00000 -  "insufficient privileges"
// *Cause:    An attempt was made to perform a database operation without
//            the necessary privileges.
// *Action:   Ask your database administrator or designated security
//            administrator to grant you the necessary privileges


const oracledb = require("oracledb");
const dbConfig = require("../../config/database-config");
dbConfig.events = true; // CQN needs events mode

async function getRealtimeVitals(person_id, io) {
  let connection;
  try {
    console.log("before connection");
    connection = await oracledb.getConnection(dbConfig.poolAlias);
    console.log("before grant change notification");
    const sql = `GRANT CHANGE NOTIFICATION TO ${dbConfig.user}`;
    await connection.execute(sql);
    console.log("after connection");
    await connection.subscribe("currentVitalsSub", options(person_id, io));
    console.log(`Subscription created for ${person_id}`);
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

module.exports = {
  getRealtimeVitals,
};

// https://github.com/oracle/node-oracledb/blob/master/examples/dbconfig.js

// const interval = setInterval(function() {
//   console.log("waiting...");
// }, 5000);

function myCallback(message) {
  io.emit('message', JSON.stringify(message));

  // message.type is one of the oracledb.SUBSCR_EVENT_TYPE_* values
  console.log("Message type:", message.type);
  if (message.type == oracledb.SUBSCR_EVENT_TYPE_DEREG) {
    // clearInterval(interval);
    console.log("Deregistration has taken place...");
    return;
  }
  console.log("Message database name:", message.dbName);
  console.log("Message transaction id:", message.txId);
  console.log("Message queries:");
  for (let i = 0; i < message.queries.length; i++) {
    const query = message.queries[i];
    for (let j = 0; j < query.tables.length; j++) {
      const table = query.tables[j];
      console.log("--> --> Table Name:", table.name);
      // Note table.operation and row.operation are masks of
      // oracledb.CQN_OPCODE_* values
      console.log("--> --> Table Operation:", table.operation);
      if (table.rows) {
        console.log("--> --> Table Rows:");
        for (let k = 0; k < table.rows.length; k++) {
          const row = table.rows[k];
          console.log("--> --> --> Row Rowid:", row.rowid);
          console.log("--> --> --> Row Operation:", row.operation);
          console.log(Array(61).join("-"));
        }
      }
    }
    console.log(Array(61).join("="));
  }
}

const options = (person_id, io) => ({
  callback: myCallback,
  sql: `SELECT HR, SBP, MBP, DBP FROM CURRENT_VITALS WHERE person_id = :person_id`,
  binds: { person_id },
  timeout: 60, // Stop after 60 seconds
  // ipAddress: '127.0.0.1',
  // SUBSCR_QOS_QUERY: generate notifications when rows with k > 100 are changed
  // SUBSCR_QOS_ROWIDS: Return ROWIDs in the notification message
  qos: oracledb.SUBSCR_QOS_QUERY | oracledb.SUBSCR_QOS_ROWIDS,
});

// async function setup(connection) {
//   const stmts = [
//     `DROP TABLE no_cqntable`,

//     `CREATE TABLE no_cqntable (k NUMBER)`
//   ];

//   for (const s of stmts) {
//     try {
//       await connection.execute(s);
//     } catch(e) {
//       if (e.errorNum != 942)
//         console.error(e);
//     }
//   }
// }
