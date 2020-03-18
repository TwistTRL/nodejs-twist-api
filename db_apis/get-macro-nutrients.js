/*
 * @Author: Peng Zeng 
 * @Date: 2020-03-17 19:19:52 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-03-18 11:29:22
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;

const PERSON_ID = "person_id";
const FROM = "from";
const TO = "to";
const RESOLUTION = "resolution";
var timeLable = 0;

const SQL_GET_EN = `
SELECT  
  START_TIME_DTUNIX,
  DISPLAY_LINE,
  G_PTN,
  G_FAT,
  G_CHO
FROM EN
WHERE PERSON_ID = :person_id
ORDER BY START_TIME_DTUNIX`;


async function enQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for EN all time: ", SQL_GET_EN);
  console.time("getEN-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_EN, binds);
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
      fatArr.push({time: time, value: row["G_FAT"], unit: "g"});
      proteinArr.push({time: time, value: row["G_PTN"], unit: "g"});
      choArr.push({time: time, value: row["G_CHO"], unit: "g"});
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
  binds
) {
  let rawResult = await enQuerySQLExecutor(conn, binds);
  let result = _calculateRawRecords(rawResult);
  return result;
});

module.exports = {
  getMacroNutrients
};
