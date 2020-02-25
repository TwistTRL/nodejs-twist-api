/*
 * @Author: Peng
 * @Date: 2020-02-25 12:59:10
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-25 15:08:53
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
var timeLable = 0;

const SQL_GET_TEMP_PART1 = `
SELECT
  DTUNIX,
  TEMPERATURE,
  TEMPERATURE_ESOPH,
  TEMPERATURE_SKIN
FROM VITAL_V500
WHERE PERSON_ID = `;

const SQL_GET_TEMP_PART2 = `
AND (TEMPERATURE IS NOT NULL
   OR TEMPERATURE_ESOPH IS NOT NULL
   OR TEMPERATURE_SKIN IS NOT NULL)
ORDER BY DTUNIX`;


const SQL_GET_VITAL_TEMP_PART1 = `
SELECT
  TEMP1
  DTUNIX
FROM VITALS
WHERE PERSON_ID = `;

const SQL_GET_VITAL_TEMP_PART2 = `
AND TEMP1 IS NOT NULL
ORDER BY DTUNIX
`

async function tempSQLExecutor(conn, query) {
  let SQL_GET_TEMP =
    SQL_GET_TEMP_PART1 +
    query.person_id +
    ` AND DTUNIX >= ` +
    query.from +
    ` AND DTUNIX <= ` +
    query.to +
    SQL_GET_TEMP_PART2;
  console.log("SQL for get temp: ", SQL_GET_TEMP);
  let rawRecord = await conn.execute(SQL_GET_TEMP);
  return rawRecord.rows;
}

async function tempVitalSQLExecutor(conn, query) {
  let SQL_GET_VITAL_TEMP =
  SQL_GET_VITAL_TEMP_PART1 +
  query.person_id +
  ` AND DTUNIX >= ` +
  query.from +
  ` AND DTUNIX <= ` +
  query.to +
  SQL_GET_VITAL_TEMP_PART2;
console.log("SQL for get raw temp: ", SQL_GET_VITAL_TEMP);
let rawRecord = await conn.execute(SQL_GET_VITAL_TEMP);
return rawRecord.rows;
}

const _calculateRawRecords = (rawResult) => {
  let {arr1, arr2} = rawResult;
  console.log("arr temp length :", arr1.length);
  console.log("arr vital temp length :", arr2.length);
  let result = [];

  arr1.forEach(element => {
    let time = element.DTUNIX;
    let value;
    let type;

    if (element.TEMPERATURE) {
      value = element.TEMPERATURE;
      type = "TEMPERATURE";
    } else if (element.TEMPERATURE_ESOPH) {
      value = element.TEMPERATURE_ESOPH;
      type = "TEMPERATURE_ESOPH";
    } else {
      value = element.TEMPERATURE_SKIN;
      type = "TEMPERATURE_SKIN";
    }
    result.push({ time, value, type });
  });

  arr2.forEach(element => {
    let time = element.DTUNIX;
    let value = element.TEMP1;
    let type = "VITALS";
    result.push({ time, value, type})
  });

  return result;
};

async function parallelQuery(conn, new_query) {
  // should parallel do the sql query
  console.time("parallel-query");
  const task1 = await tempSQLExecutor(conn, new_query);
  const task2 = await tempVitalSQLExecutor(conn, new_query);
  console.timeEnd("parallel-query");
  return {
    arr1: await task1,
    arr2: await task2
  };
}


const getTemp = database.withConnection(async function(conn, query) {
  let new_query = {
    person_id: query.person_id,
    from: query.from || 0,
    // "to" default value is 3 days
    to: query.to - 1 || query.from + 86400 * 3
  };
  console.log("query = ", new_query);

  if (!isValidJson.validate_inout(new_query)) {
    console.warn(new_query + " : not json");
    throw new InputInvalidError("Input not in valid json");
  }

  if (new_query.from > new_query.to) {
    throw new InputInvalidError("start time must > end time");
  }

  let consoleTimeCount = timeLable++;
  console.time("getTemp" + consoleTimeCount);
  let rawResult = await parallelQuery(conn, new_query);
  let result = _calculateRawRecords(rawResult);
  console.timeEnd("getTemp" + consoleTimeCount);
  return result;
});

module.exports = {
  getTemp
};
