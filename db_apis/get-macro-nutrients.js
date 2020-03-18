/*
 * @Author: Peng Zeng 
 * @Date: 2020-03-17 19:19:52 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-03-17 19:57:17
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;

const PERSON_ID = "person_id";
const FROM = "from";
const TO = "to";
const RESOLUTION = "resolution";
var timeLable = 0;

const SQL_GET_EN_PART1 = `
SELECT  
  START_TIME_DTUNIX,
  DISPLAY_LINE,
  G_PTN,
  G_FAT,
  G_CHO
FROM EN
WHERE PERSON_ID = `;
const SQL_GET_EN_PART2 = `
AND START_TIME_DTUNIX <= `;
const SQL_GET_EN_PART3 = ` AND START_TIME_DTUNIX >= `;
const SQL_GET_EN_PART4 = ` 
ORDER BY START_TIME_DTUNIX`;


async function enQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_EN =
    SQL_GET_EN_PART1 +
    query[PERSON_ID] +
    SQL_GET_EN_PART2 +
    Number(query[TO]) +
    SQL_GET_EN_PART3 +
    Number(query[FROM]) +
    SQL_GET_EN_PART4;
  console.log("~~SQL for EN: ", SQL_GET_EN);
  console.time("getEN-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_EN);
  console.timeEnd("getEN-sql" + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(arrEN) {
  let fatArr = [];
  let proteinArr = [];
  let choArr = [];
  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_DTUNIX": 1524700800, "VOLUME": 2}
      let time = row["START_TIME_DTUNIX"];
      fatArr.push({time: time, value: row["G_FAT"], unit: ""});
      proteinArr.push({time: time, value: row["G_PTN"], unit: ""});
      choArr.push({time: time, value: row["G_CHO"], unit: ""});
    }
  }
  return {fatArr, proteinArr, choArr};
}

// {
//   fat: [
//     {
//       time: unix,
//       value: Number,
//       unit: String
//     },
//     ...
//   ],
//   protein: [
//     {
//       time: unix,
//       value: Number,
//       unit: String
//     },
//     ...
//   ],
//   cho: [
//     {
//       time: unix,
//       value: Number,
//       unit: String
//     },
//     ...
//   ]
// }


/**
 * query:
 * {
    "person_id": 11111111,
    "from":3600,   //optional
    "to":7200,     //optional
}

 * @param {*} conn 
 * @param {*} query 
 */
const getMacroNutrients = database.withConnection(async function(
  conn,
  query
) {
  let new_query = {
    person_id: query.person_id,
    from: query.from || 0,
    to: query.to || new Date().getTime / 1000;
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
  let rawResult = await enQuerySQLExecutor(conn, new_query);
  let result = _calculateRawRecords(rawResult);
  return result;
});

module.exports = {
  getMacroNutrients
};
