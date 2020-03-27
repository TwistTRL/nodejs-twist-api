/*
 * @Author: Peng 
 * @Date: 2020-03-27 10:26:44 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-03-27 18:01:22
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;

const PERSON_ID = "person_id";
const FROM = "from";
const TO = "to";
var timeLable = 0;

const SQL_GET_ECMO = `
SELECT
  VALID_FROM_DT_TM,
  ECMO_FLOW,
  ECMO_FLOW_NORM,
  LVAD_FILLING,
  LVAD_EJECTION,
  LVAD_RATE,
  LVAD_VOLUME,
  RVAD_RATE,
  VAD_CI,
  VAD_CO,
  WEIGHT,
  ECMO_VAD_SCORE
FROM ECMO_VAD_VARIABLE
WHERE PERSON_ID = :person_id
ORDER BY VALID_FROM_DT_TM`;

async function ecmoQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for ECMO all time: ", SQL_GET_ECMO);
  console.time("getECMO-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_ECMO, binds);
  console.timeEnd("getECMO-sql" + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(arrECMO) {
  let ret = [];
  if (arrECMO && arrECMO.length) {
    console.log("ECMO record size :", arrECMO.length);
    for (let row of arrECMO) {
      //example row = {"VALID_FROM_DT_TM": 1500000000, "ECMO_VAD_SCORE": 90}
      if (row["ECMO_VAD_SCORE"]) {
        ret.push(row);
      } else {
        console.log('ECMO score get 0 value:', row);
      }
    }
  }
  return ret;
}

const getECMO = database.withConnection(async function(
  conn,
  binds
) {
  let rawResult = await ecmoQuerySQLExecutor(conn, binds);
  let result = _calculateRawRecords(rawResult);
  return result;
});

module.exports = {
  getECMO
};
