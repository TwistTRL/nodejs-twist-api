/*
 * @Author: Peng 
 * @Date: 2020-03-31 18:13:54 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-03-31 23:02:11
 */

const { bisect_left } = require("bisect"); 
const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;

var timeLable = 0;

const SQL_GET_WEIGHT_CALC = `
SELECT
  DT_UNIX,
  WEIGHT_CALC
FROM WEIGHTS_CALCS
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX`

const SQL_GET_TPN_NUTR = `
SELECT 
  START_UNIX,
  END_UNIX,
  "Amino_Acids g/kg",
  "Dextrose g/kg"
FROM TPN
WHERE PERSON_ID = :person_id
ORDER BY START_UNIX`;

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

async function weightCalcQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL getting weight for fat-pro-cho: ", SQL_GET_WEIGHT_CALC);
  console.time('getWeightCalc-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_WEIGHT_CALC, binds);
  console.timeEnd('getWeightCalc-sql' + timestampLable);
  let ret = [];
  rawRecord.rows.forEach(element => {
    if (element["WEIGHT_CALC"]) {
      ret.push(element);
    }
  });
  return ret;
}

async function tpnNutrQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for TPN Nutr all time: ", SQL_GET_TPN_NUTR);
  console.time("getTpnNutr-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_TPN_NUTR, binds);
  console.timeEnd("getTpnNutr-sql" + timestampLable);
  return rawRecord.rows;
}

async function enQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for EN all time: ", SQL_GET_EN);
  console.time("getEN-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_EN, binds);
  console.timeEnd("getEN-sql" + timestampLable);
  return rawRecord.rows;
}

async function diluNutrQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for Diluents Nutr all time: ", SQL_GET_DILUENTS_NUTRI);
  console.time("getDiluNutr-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_DILUENTS_NUTRI, binds);
  console.timeEnd("getDiluNutr-sql" + timestampLable);
  return rawRecord.rows;
}


function _calculateRawRecords(arrTpnNutr, arrEN, arrDiluNutr, weightArr) {
  // get hour binned pro, fat, cho data 
  let retDict = {};

  if (arrTpnNutr && arrTpnNutr.length) {
    // TPN database is already binned by hour
    console.log("TpnNutr record size :", arrTpnNutr.length);
    for (let row of arrTpnNutr) {
      //example row = {"START_UNIX": 1524700800, "Amino_Acids g/kg": 2}
      let start = row["START_UNIX"];
      let end = row["END_UNIX"];
      if (start >= end) {
        console.log('TPN row error start/end time:', row);
        continue;
      }
      if (start && end) {
        let timestamp = Math.floor(start / 3600) * 3600;
        if (timestamp-start) {
          if (timestamp- Math.floor((end-1) / 3600) * 3600) {
            console.log('TPN row has abnormal start/end time :', row);
          }
        }
        
        if (row["Amino_Acids g/kg"]) {
          if (timestamp in retDict) {
            if ("pro" in retDict[timestamp]) {
              retDict[timestamp]["pro"] += row["Amino_Acids g/kg"];
            } else {
              retDict[timestamp]["pro"] = row["Amino_Acids g/kg"];
            }
          } else {
            retDict[timestamp] = {pro: row["Amino_Acids g/kg"]};
          }
        }
        if (row["Dextrose g/kg"]) {
          if (timestamp in retDict) {
            if ("cho" in retDict[timestamp]) {
              retDict[timestamp]["cho"] += row["Dextrose g/kg"];
            } else {
              retDict[timestamp]["cho"] = row["Dextrose g/kg"];
            }
          } else {
            retDict[timestamp] = {cho: row["Dextrose g/kg"]};
          }      
        }
      } else {
        console.log('TPN start or end time null :', row);
      }      
    }
  }

  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_DTUNIX": 1524700800, "VOLUME": 2}
      let timestamp = Math.floor(row["START_TIME_DTUNIX"] / 3600) * 3600;
      if (row["G_FAT"]) {
        let fatValue = row["G_FAT"] / getWeight(timestamp, weightArr);
        if (timestamp in retDict) {
          if ("fat" in retDict[timestamp]) {
            retDict[timestamp]["fat"] += fatValue;
          } else {
            retDict[timestamp]["fat"] = fatValue;
          }
        } else {
          retDict[timestamp] = {fat: fatValue};
        }     
      }

      if (row["G_PTN"]) {
        if (timestamp in retDict) {
          if ("pro" in retDict[timestamp]) {
            retDict[timestamp]["pro"] += row["G_PTN"];
          } else {
            retDict[timestamp]["pro"] = row["G_PTN"];
          }
        } else {
          retDict[timestamp] = {pro: row["G_PTN"]};
        }     
      }

      if (row["G_CHO"]) {
        if (timestamp in retDict) {
          if ("cho" in retDict[timestamp]) {
            retDict[timestamp]["cho"] += row["G_CHO"];
          } else {
            retDict[timestamp]["cho"] = row["G_CHO"];
          }
        } else {
          retDict[timestamp] = {cho: row["G_CHO"]};
        }     
      }
    }
  }

if (arrDiluNutr && arrDiluNutr.length) {
    console.log("DiluNutr record size :", arrDiluNutr.length);
    for (let row of arrDiluNutr) {
      if (row["DILUENT"] in DEXTROSE_DICT) {
        let rate = row["INFUSION_RATE"];
        let start = row["START_UNIX"];
        let end = row["END_UNIX"];
        if (start && end && rate && end > start) {

          let startTimestamp = Math.floor(start / 3600) * 3600;
          let binNumber = Math.ceil(end / 3600) - Math.floor(start / 3600);

          for (let i = 0; i < binNumber; i++) {
            let timestamp = startTimestamp + 3600 * i;
            if (timestamp in retDict) {
              if ("cho" in retDict[timestamp]) {
                retDict[timestamp]["cho"] += rate;
              } else {
                retDict[timestamp]["cho"] = rate;
              }
            } else {
              retDict[timestamp] = {cho: rate};
            }     
          }
        } else {
          console.warn('error: on start/end/rate for this row :', row);
        }
      } else if (row["DILUENT"].includes("Dextrose")) {
        console.warn("error: Dextrose key not in list: ", row);
      }      
    }
  }
  return retDict;
}

const getWeight = (timestamp, weightArr) => {
  let index = bisect_left(weightArr, timestamp, x=>x["DT_UNIX"]);
  if (index < 0) {
    console.log('at timestamp has no weight:', timestamp);
    return weightArr[0];
  } else {
    return weightArr[index];
  }
}

const getNutriFatProCho = database.withConnection(async function(
  conn,
  binds
) {
  let weightArr = await weightCalcQuerySQLExecutor(coon, binds)
  let tpnRaw = await tpnNutrQuerySQLExecutor(conn, binds);
  let enRaw = await enQuerySQLExecutor(conn, binds);
  let diluRaw = await diluNutrQuerySQLExecutor(conn, binds);
  // TODO add TPN_LIPID
  let result = _calculateRawRecords(tpnRaw, enRaw, diluRaw, weightArr);
  return result;
});

module.exports = {
  getNutriFatProCho
};
