/*
 * @Author: Peng 
 * @Date: 2020-04-07 15:40:54 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-09 10:42:00
 */

/**
 * arrInOut from table `INTAKE_OUTPUT`,
 * arrDiluents from table `DRUG_DILUENTS`,
 * arrTPN from table `TPN`,
 * arrEN from table `EN`,
 * arrLipids from table `TPN_LIPIDS` 
 * 
 * 
 * unit is mL only, because
 * `select distinct INFUSION_RATE_UNITS from drug_diluents` is `mL/hr`
 *
 *
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const {
  EVENT_CD_DICT,
  SL_ORDER_ARRAY
} = require("../db_relation/in-out-db-relation");
const { getBinarySearchNearest } = require("./utils/binarySearchUtils");
const TWIST_SQL = require("./sql-each-table");

var console_time_count = 0;

const sqlExecutor = async (fun, conn, query) => {
  let console_time_label = console_time_count++;
  console.log("~~SQL~~: " + console_time_label + "\n" + fun(person_id, from, to));
  console.time("get-sql-" + console_time_label);
  let rawRecord = await conn.execute(fun(query));
  console.timeEnd("get-sql-" + console_time_label);
  return rawRecord.rows;
}

const getInitialFetch = database.withConnection(async function(
  conn,
  query
) { 
  let consoleTimeCount = console_time_count++;
  console.time("getEachTable" + consoleTimeCount);
  const arrEN = await sqlExecutor(TWIST_SQL.SQL_GET_EN, conn, query);
  const arrTPN = await sqlExecutor(TWIST_SQL.SQL_GET_TPN, conn, query);
  const arrLipids = await sqlExecutor(TWIST_SQL.SQL_GET_TPN_LIPID, conn, query);
  const arrInOut = await sqlExecutor(TWIST_SQL.SQL_GET_IN_OUT_EVENT, conn, query);
  const arrDiluents = await sqlExecutor(TWIST_SQL.SQL_GET_DILUENTS, conn, query);
  console.timeEnd("getEachTable" + consoleTimeCount);

  const ioTooltipsRes = calculateIOTooltips({arrEN, arrTPN, arrLipids, arrInOut, arrDiluents}, query);

  // TODO


});


// async function weightQuerySQLExecutor(conn, query) {
//   let console_time_label = console_time_count++;
//   let SQL_GET_WEIGHT =
//     SQL_GET_WEIGHT_PART1 + query[PERSON_ID] + SQL_GET_WEIGHT_PART2;
//   console.log("~~SQL for get weight: ", SQL_GET_WEIGHT);
//   console.time("getWeight-sql" + console_time_label);
//   let rawRecord = await conn.execute(SQL_GET_WEIGHT);
//   console.timeEnd("getWeight-sql" + console_time_label);
//   return rawRecord.rows;
// }



module.exports = {
  getInitialFetch
};
