/*
 * @Author: Peng 
 * @Date: 2020-03-31 09:56:08 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-03-31 10:49:08
 */

const database = require("../services/database");

var timeLable = 0;
const SQL_GET_DILUENTS_NUTRI = `
SELECT  
  START_UNIX,
  END_UNIX,
  DILUENT,
  INFUSION_RATE,
  INFUSION_RATE_UNITS
FROM DRUG_DILUENTS
WHERE PERSON_ID = :person_id
ORDER BY START_UNIX`;

const DEXTROSE_DICT = {
"Dextrose 5% in Water": 0.05,
"Dextrose 30% in Water": 0.3,
"Dextrose 10% in Water": 0.1,
"Dextrose 40% in Water": 0.4,
"Dextrose 25% in Water": 0.25,
"Dextrose 12.5% in Water": 0.125,
"Dextrose 10% with 0.2% NaCl": 0.1,
"Dextrose 5% in Lactated Ringers Injection": 0.05,
"Dextrose 15% in Water": 0.15,
"Dextrose 5% with 0.225% NaCl": 0.05,
"Dextrose 20% in Water": 0.2,
"Dextrose 5% with 0.9% NaCl": 0.05,
"Dextrose 5% with 0.45% NaCl": 0.05,
"Dextrose 10% with 0.9% NaCl": 0.1,
"Dextrose 7.5% in Water": 0.075,
"Dextrose 17.5% in Water": 0.175,
"Dextrose 2.5% in Water": 0.025,
}

async function diluNutrQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for Diluents Nutr all time: ", SQL_GET_DILUENTS_NUTRI);
  console.time("getDiluNutr-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_DILUENTS_NUTRI, binds);
  console.timeEnd("getDiluNutr-sql" + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(arrDiluNutr) {
  let dextroseArr = [];
  if (arrDiluNutr && arrDiluNutr.length) {
    console.log("DiluNutr record size :", arrDiluNutr.length);
    for (let row of arrDiluNutr) {
      if (row["DILUENT"] in DEXTROSE_DICT) {
        let rate = row["INFUSION_RATE"];
        let start = row["START_UNIX"];
        let end = row["END_UNIX"];
        let unit = "g/mL";
        if (start && end && rate) {
          dextroseArr.push({start, end, rate, unit});
        } else {
          console.warn('error: on start/end/rate for this row :', row);
        }
      } else if (row["DILUENT"].includes("Dextrose")) {
        console.warn("error: Dextrose key not in list: ", row);
      }      
    }
  }
  return dextroseArr;
}

const getDiluNutrients = database.withConnection(async function(
  conn,
  binds
) {
  let rawResult = await diluNutrQuerySQLExecutor(conn, binds);
  let result = _calculateRawRecords(rawResult);
  return result;
});

module.exports = {
  getDiluNutrients
};
