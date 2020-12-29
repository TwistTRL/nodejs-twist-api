/*
 * @Author: Peng
 * @Date: 2020-03-31 18:13:54
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-27 11:16:21
 */

// https://github.com/TwistTRL/nodejs-twist-utils/tree/master/nutrition

const { bisect_left } = require("bisect-js");
const database = require("../services/database");
const { IVF_TO_DEXTROSE } = require("../db_relation/in-out-db-relation");

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
};

const TPN_LIPID_RATIO = 0.2; //20% lipid, which is 0.2 grams fat/mL

const SQL_GET_WEIGHT_CALC = `
SELECT
  DT_UNIX,
  WEIGHT_CALC
FROM WEIGHTS_CALCS
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX`;

const SQL_GET_TPN_NUTR = `
SELECT 
  START_UNIX,
  END_UNIX,
  RESULT_VAL,
  "AMINO_ACIDS_G_KG",
  "DEXTROSE_G_KG"
FROM TPN
WHERE PERSON_ID = :person_id
ORDER BY START_UNIX`;

const SQL_GET_EN = `
SELECT  
  START_TIME_UNIX,
  "DISPLAY_LINE",
  "VOLUME",
  G_PTN_ROW,
  G_FAT_ROW,
  G_CHO_ROW
FROM EN
WHERE PERSON_ID = :person_id
ORDER BY START_TIME_UNIX`;

const SQL_GET_DILUENTS_NUTRI = `
SELECT  
  START_UNIX,
  END_UNIX,
  DRUG,
  DILUENT,
  INFUSION_RATE,
  DOSING_WEIGHT,
  INFUSION_RATE_UNITS
FROM DRUG_DILUENTS
WHERE PERSON_ID = :person_id
ORDER BY START_UNIX`;

const SQL_GET_TPN_LIPID = `
SELECT
  DT_UNIX,
  RESULT_VAL
FROM TPN_LIPID
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX`;

const SQL_GET_IN_OUT_EVENT = `
SELECT  
  DT_UNIX,
  EVENT_CD,
  RESULT_VAL
FROM INTAKE_OUTPUT
WHERE PERSON_ID = :person_id AND RESULT_VAL != 0
ORDER BY DT_UNIX`;

var timeLable = 0;

async function weightCalcQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL getting weight for fat-pro-cho: ", SQL_GET_WEIGHT_CALC);
  console.time("getWeightCalc-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_WEIGHT_CALC, binds);
  console.timeEnd("getWeightCalc-sql" + timestampLable);
  let ret = [];
  rawRecord.rows.forEach((element) => {
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

async function tpnLipidQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for TPN Lipid all time: ", SQL_GET_TPN_LIPID);
  console.time("getTpnLipid-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_TPN_LIPID, binds);
  console.timeEnd("getTpnLipid-sql" + timestampLable);
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

async function inoutQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for in-out all time: ", SQL_GET_IN_OUT_EVENT);
  console.time("getInout-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_EVENT, binds);
  console.timeEnd("getInout-sql" + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(arrTpnNutr, arrTpnLipid, arrEN, arrDiluNutr, arrInout, weightArr) {
  // console.log('arrTpnNutr.length :>> ', arrTpnNutr.length);
  // console.log('arrTpnLipid.length :>> ', arrTpnLipid.length);
  // console.log('arrEN.length :>> ', arrEN.length);
  // console.log('arrDiluNutr.length :>> ', arrDiluNutr.length);
  // console.log('arrInout.length :>> ', arrInout.length);
  // get hour binned pro, fat, cho data
  let retDict = {};

  if (arrTpnNutr && arrTpnNutr.length) {
    // TPN database is already binned by hour
    console.log("TpnNutr record size :", arrTpnNutr.length);
    for (let row of arrTpnNutr) {
      //example row = {"START_UNIX": 1524700800, "AMINO_ACIDS_G_KG": 2}
      let start = row["START_UNIX"];
      let end = row["END_UNIX"];
      if (start >= end) {
        // console.warn("TPN row error start/end time:", row);
        continue;
      }
      if (start && end) {
        let timestamp = Math.floor(start / 3600) * 3600;
        if (timestamp - start) {
          if (timestamp - Math.floor((end - 1) / 3600) * 3600) {
            // console.log('TPN row has abnormal start/end time :', row);
          }
        }

        if (row["AMINO_ACIDS_G_KG"]) {
          accValueToDict(row["AMINO_ACIDS_G_KG"], timestamp, "pro_tpn", retDict);
        }
        if (row["DEXTROSE_G_KG"]) {
          accValueToDict(row["DEXTROSE_G_KG"], timestamp, "cho_tpn", retDict);
        }
      } else {
        console.log("TPN start or end time null :", row);
      }
    }
  }

  if (arrTpnLipid && arrTpnLipid.length) {
    console.log("TpnLipid record size :", arrTpnLipid.length);
    for (let row of arrTpnLipid) {
      let timestamp = Math.floor(row["DT_UNIX"] / 3600) * 3600;
      if (timestamp && row["RESULT_VAL"]) {
        let fatValue = (row["RESULT_VAL"] * TPN_LIPID_RATIO) / getWeight(timestamp, weightArr);
        accValueToDict(fatValue, timestamp, "fat_tpnlipid", retDict);
      }
    }
  }

  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_UNIX": 1524700800, "VOLUME": 2}
      let timestamp = Math.floor(row["START_TIME_UNIX"] / 3600) * 3600;
      if (row["G_FAT_ROW"]) {
        let fatValue = row["G_FAT_ROW"] / getWeight(timestamp, weightArr);
        accValueToDict(fatValue, timestamp, "fat_en", retDict);
      }

      if (row["G_PTN_ROW"]) {
        let proValue = row["G_PTN_ROW"] / getWeight(timestamp, weightArr);
        accValueToDict(proValue, timestamp, "pro_en", retDict);
      }

      if (row["G_CHO_ROW"]) {
        let choValue = row["G_CHO_ROW"] / getWeight(timestamp, weightArr);
        accValueToDict(choValue, timestamp, "cho_en", retDict);
      }
    }
  }

  if (arrInout && arrInout.length) {
    // TPN database is already binned by hour
    console.log("inout record size :", arrInout.length);
    for (let row of arrInout) {
      //   DT_UNIX,  EVENT_CD,  VALUE
      if (row["EVENT_CD"] in IVF_TO_DEXTROSE) {
        let timestamp = Math.floor(row.DT_UNIX / 3600) * 3600;
        let ivfValue = (row["VALUE"] * (IVF_TO_DEXTROSE[row["EVENT_CD"]] / 100)) / getWeight(timestamp, weightArr);
        accValueToDict(ivfValue, timestamp, "cho_ivf", retDict);
      }
    }
  }


  if (arrDiluNutr && arrDiluNutr.length) {
    console.log("DiluNutr record size :", arrDiluNutr.length);
    for (let row of arrDiluNutr) {
      if (row["DILUENT"] in DEXTROSE_DICT) {
        // normalized rate: 'Dextrose 10% in Water' means rate * 0.1
        let rate = row["INFUSION_RATE"] * DEXTROSE_DICT[row["DILUENT"]] / row["DOSING_WEIGHT"]; //getWeight(timestamp, weightArr);
        let start = row["START_UNIX"];
        let end = row["END_UNIX"];
        if (start && end && rate && end > start) {
          let startTimestamp = Math.floor(start / 3600) * 3600;
          let binNumber = Math.ceil(end / 3600) - Math.floor(start / 3600);

          // calculate value for each bin
          // 1. binNumber == 1, `start` to `end`
          // 2. binNumber == 2, left value is `start` to left bin end, right value is right bin start to `end`
          // 3. binNumber == 3, first bin: left value, last bin: right value, middle others: all equal rate 
          if (binNumber === 1) {
            let value = (rate * (end - start)) / 3600;
            accValueToDict(value, startTimestamp, "cho_dilu", retDict);
          } else if (binNumber === 2) {
            let leftValue = (rate * (startTimestamp + 3600 - start)) / 3600;
            accValueToDict(leftValue, startTimestamp, "cho_dilu", retDict);
            let rightValue = (rate * (end - startTimestamp - 3600)) / 3600;
            accValueToDict(rightValue, startTimestamp + 3600, "cho_dilu", retDict);
          } else {
            for (let i = 0; i < binNumber; i++) {
              let timestamp = startTimestamp + 3600 * i;
              if (i === 0) {
                let leftValue = (rate * (startTimestamp + 3600 - start)) / 3600;
                accValueToDict(leftValue, timestamp, "cho_dilu", retDict);
              } else if (i === binNumber - 1) {
                let rightValue = (rate * (end - startTimestamp - 3600 * i)) / 3600;
                accValueToDict(rightValue, timestamp, "cho_dilu", retDict);
              } else {
                accValueToDict(rate, timestamp, "cho_dilu", retDict);
              }
            }
          }
        } else {
          console.warn("error: on start/end/rate for this row :", row);
        }
      } else if (row["DILUENT"].includes("Dextrose")) {
        console.warn("error: Dextrose key not in list: ", row);
      }
    }
  }

  let retArr = [];
  for (let timestamp in retDict) {
    let curObj = { timestamp: Number(timestamp) };
    if (retDict[timestamp].pro_tpn || retDict[timestamp].pro_en) {
      let proObj = { sum: (retDict[timestamp].pro_tpn || 0) + (retDict[timestamp].pro_en || 0) };
      if (retDict[timestamp].pro_tpn) {
        proObj.tpn = retDict[timestamp].pro_tpn;
      }
      if (retDict[timestamp].pro_en) {
        proObj.en = retDict[timestamp].pro_en;
      }
      curObj.pro = proObj;
    }

    if (retDict[timestamp].cho_tpn || retDict[timestamp].cho_en || retDict[timestamp].cho_dilu || retDict[timestamp].cho_ivf) {
      let choObj = {
        sum:
          (retDict[timestamp].cho_tpn || 0) +
          (retDict[timestamp].cho_en || 0) +
          (retDict[timestamp].cho_dilu || 0) +
          (retDict[timestamp].cho_ivf || 0),
      };
      if (retDict[timestamp].cho_tpn) {
        choObj.tpn = retDict[timestamp].cho_tpn;
      }
      if (retDict[timestamp].cho_en) {
        choObj.en = retDict[timestamp].cho_en;
      }
      if (retDict[timestamp].cho_dilu) {
        choObj.diluents = retDict[timestamp].cho_dilu;
      }
      if (retDict[timestamp].cho_ivf) {
        choObj.ivf = retDict[timestamp].cho_ivf;
      }
      curObj.cho = choObj;
    }

    if (retDict[timestamp].fat_en || retDict[timestamp].fat_tpnlipid) {
      let fatObj = {
        sum: (retDict[timestamp].fat_en || 0) + (retDict[timestamp].fat_tpnlipid || 0),
      };
      if (retDict[timestamp].fat_en) {
        fatObj.tpn = retDict[timestamp].fat_en;
      }
      if (retDict[timestamp].fat_tpnlipid) {
        fatObj.tpnlipid = retDict[timestamp].fat_tpnlipid;
      }
      curObj.fat = fatObj;
    }

    retArr.push(curObj);
  }

  return retArr.sort((a, b) => a.timestamp - b.timestamp);
}

const getWeight = (timestamp, weightArr) => {
  let index = bisect_left(weightArr, timestamp, (x) => x["DT_UNIX"]);
  if (index < 0) {
    // console.log("fpc: at timestamp has no weight:", timestamp);
    return weightArr[0]["WEIGHT_CALC"];
  } else {
    return weightArr[index]["WEIGHT_CALC"];
  }
};

const accValueToDict = (value, catKey, childKey, dict) => {
  if (catKey in dict) {
    if (childKey in dict[catKey]) {
      dict[catKey][childKey] += value;
    } else {
      dict[catKey][childKey] = value;
    }
  } else {
    dict[catKey] = {};
    dict[catKey][childKey] = value;
  }
};

const getNutriFatProCho = database.withConnection(async function (conn, binds) {
  let weightArr = await weightCalcQuerySQLExecutor(conn, binds);
  let tpnRaw = await tpnNutrQuerySQLExecutor(conn, binds);
  let tpnLipidRaw = await tpnLipidQuerySQLExecutor(conn, binds);
  let enRaw = await enQuerySQLExecutor(conn, binds);
  let diluRaw = await diluNutrQuerySQLExecutor(conn, binds);
  let inoutRaw = await inoutQuerySQLExecutor(conn, binds);
  let result = _calculateRawRecords(tpnRaw, tpnLipidRaw, enRaw, diluRaw, inoutRaw, weightArr);
  return result;
});

module.exports = {
  getNutriFatProCho,
};
