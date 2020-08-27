/*
 * @Author: Peng 
 * @Date: 2020-03-27 10:26:44 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-03-31 18:13:45
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;

var timeLable = 0;
const SQL_GET_TPN_NUTR = `
SELECT 
  START_UNIX,
  END_UNIX,
  "AMINO_ACIDS_G_KG",
  "DEXTROSE_G_KG"
FROM TPN
WHERE PERSON_ID = :person_id
ORDER BY START_UNIX`;

async function tpnNutrQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for TPN Nutr all time: ", SQL_GET_TPN_NUTR);
  console.time("getTpnNutr-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_TPN_NUTR, binds);
  console.timeEnd("getTpnNutr-sql" + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(arrTpnNutr) {
  let amino_acids = [];
  let dextrose = [];
  if (arrTpnNutr && arrTpnNutr.length) {
    console.log("TpnNutr record size :", arrTpnNutr.length);
    for (let row of arrTpnNutr) {
      //example row = {"START_UNIX": 1524700800, "AMINO_ACIDS_G_KG": 2}
      let start = row["START_UNIX"];
      let end = row["END_UNIX"]
      if (start && end) {
        if (row["AMINO_ACIDS_G_KG"]) {
          amino_acids.push({start: start, end: end, value: row["AMINO_ACIDS_G_KG"], unit: "g/kg"});
        }
        if (row["DEXTROSE_G_KG"]) {
          dextrose.push({start: start, end: end, value: row["DEXTROSE_G_KG"], unit: "g/kg"});
        }
      } else {
        console.log('start or end time null :', row);
      }      
    }
  }
  return {amino_acids, dextrose};
}

const getTpnNutrients = database.withConnection(async function(
  conn,
  binds
) {
  let rawResult = await tpnNutrQuerySQLExecutor(conn, binds);
  let result = _calculateRawRecords(rawResult);
  return result;
});

module.exports = {
  getTpnNutrients
};
