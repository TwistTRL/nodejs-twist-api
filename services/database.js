const oracledb = require('oracledb');
const dbConfig = require('../config/database.js');

async function initialize() {
  await oracledb.createPool(dbConfig);
}

module.exports.initialize = initialize;

async function close() {
  await oracledb.getPool().close();
}

module.exports.close = close;

async function simpleExecute(func,binds={},opts={}) {
  opts.outFormat = oracledb.OBJECT;
  opts.autoCommit = true;
  
  let conn = await oracledb.getConnection();
  let result = await func(conn,binds,opts);
  conn.close();
  
  return result;
}

module.exports.simpleExecute = simpleExecute;
