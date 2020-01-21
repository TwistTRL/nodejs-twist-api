/*
 * @Author: Peng 
 * @Date: 2020-01-21 10:12:26 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-01-21 11:32:15
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const inOutDict = require("../db_relation/in-out-db-relation");


// get raw in-out between two timestamp
const SQL_GET_IN_OUT_PART1 = `
SELECT  
  DT_UNIX,
  EVENT_CD,
  IO_CALCS,
  VALUE
FROM INTAKE_OUTPUT
WHERE PERSON_ID = `

const SQL_GET_IN_OUT_PART2 = `
AND DT_UNIX > `

const SQL_GET_IN_OUT_PART3 = ` AND DT_UNIX < `

const SQL_GET_IN_OUT_PART4 = ` 
ORDER BY DT_UNIX
`

const PERSON_ID = "person_id";
const FROM = "from";
const TO = "to";

var timeLable = 0;

/**
 * query:
 * {
    "person_id": 11111111,
    "from":2222,
    "to":3344
}

 * @param {*} conn 
 * @param {*} query 
 */
async function inOutQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  console.time('getInOUt' + timestampLable);

  let SQL_GET_IN_OUT = SQL_GET_IN_OUT_PART1 + query[PERSON_ID] + SQL_GET_IN_OUT_PART2 + query[FROM] * 1 +
  SQL_GET_IN_OUT_PART3 + query[TO] * 1 + SQL_GET_IN_OUT_PART4;

  console.log("get in-out: ", SQL_GET_IN_OUT);
  console.time('getInOUt-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT);
  console.timeEnd('getInOUt-sql' + timestampLable);

  let jsonString = _calculateRawRecords(rawRecord);
  console.timeEnd('getInOUt' + timestampLable);
  return jsonString;
}

function _calculateRawRecords(rawRecord, vitalType) {
  var result = [];
  var countNull = 0;
  // rawRecord = {"metadata":[], "rows":[]}
  var arr = rawRecord.rows;
  console.log("In-OUt Raw record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  for (let row of arr) {
    //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "IO_CALCS": 1, "VALUE": 0.9}

    // skip null value vital records;
    if (row.VALUE == null) {
      countNull++;
      continue;
    }

    if (row.IO_CALCS != 0 && row.IO_CALCS != 1 && row.IO_CALCS != 2) {
      console.log("row.IO_CALCS error");
    }

    let singleResult = {};
    singleResult.name = inOutDict[row.EVENT_CD].IO_CAT
    singleResult.time = row.DT_UNIX;
    singleResult.type = row.IO_CALCS;
    singleResult.eventDef = inOutDict[row.EVENT_CD].EVENT_CD_DEFINITION;
    singleResult.subName = inOutDict[row.EVENT_CD].Subcat;

    if (row.IO_CALCS == 2) {
      singleResult.value = row.VALUE * -1;
    } else {
      singleResult.value = row.VALUE * 1;
    }

    result.push(singleResult);
  }
  console.log("null value number: ", countNull);

  return result;
}


const getInOutQuery = database.withConnection(async function (conn, query) {
  console.log("query = ", query);

  if (!isValidJson.validate_inout(query)) {
    console.warn(query + " : not json");
    throw new InputInvalidError('Input not in valid json');
  }

  return await inOutQuerySQLExecutor(conn, query); 
});

module.exports = {
  getInOutQuery
};