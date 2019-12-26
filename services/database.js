const oracledb = require('oracledb');
const dbConfig = require('../config/database-config.js');

async function initialize() {
  await oracledb.createPool(dbConfig);
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
}

async function close() {
  await oracledb.getPool().close();
  console.log("database closed");
}

function withConnection(func) {
  return async function(...args){
    let conn = await oracledb.getConnection();
    let result = await func(conn,...args);
    await conn.close();
    return result;
  }
}

module.exports = {
  initialize,
  close,
  withConnection
};
