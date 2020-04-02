/*
 * @Author: Peng
 * @Date: 2020-04-01 17:31:22
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-02 10:50:12
 */

const { bisect_left } = require("bisect-js");
const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const { EVENT_CD_DICT } = require("../db_relation/in-out-db-relation");

var timeLable = 0;
const SQL_GET_WEIGHT_CALC = `
SELECT
  DT_UNIX,
  WEIGHT_CALC
FROM WEIGHTS_CALCS
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX`;

const SQL_GET_TPN_VOL = `
SELECT 
  START_UNIX,
  END_UNIX,
  RESULT_VAL
FROM TPN
WHERE PERSON_ID = :person_id
ORDER BY START_UNIX`;

const SQL_GET_EN_VOL = `
SELECT  
  START_TIME_DTUNIX,
  DISPLAY_LINE,
  "VOLUME"
FROM EN
WHERE PERSON_ID = :person_id
ORDER BY START_TIME_DTUNIX`;

const SQL_GET_DILUENTS_VOL = `
SELECT  
  START_UNIX,
  END_UNIX,
  DRUG,
  DILUENT,
  INFUSION_RATE,
  INFUSION_RATE_UNITS
FROM DRUG_DILUENTS
WHERE PERSON_ID = :person_id
ORDER BY START_UNIX`;

const SQL_GET_TPN_LIPID_VOL = `
SELECT
  DT_UNIX,
  RESULT_VAL
FROM TPN_LIPID
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX`;

const SQL_GET_IN_OUT_VOL = `
SELECT  
  DT_UNIX,
  EVENT_CD,
  VALUE
FROM INTAKE_OUTPUT
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX`;

const SQL_GET_MED_VOL = `
SELECT 
  DT_UNIX,
  INFUSED_VOLUME,
  VOLUME_UNITS
FROM DRUG_INTERMITTENT
WHERE PERSON_ID = :person_id 
  AND VOLUME_UNITS = 'mL' 
ORDER BY DT_UNIX`;

async function weightCalcQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL getting weight for fat-pro-cho: ", SQL_GET_WEIGHT_CALC);
  console.time("getWeightCalc-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_WEIGHT_CALC, binds);
  console.timeEnd("getWeightCalc-sql" + timestampLable);
  let ret = [];
  rawRecord.rows.forEach(element => {
    if (element["WEIGHT_CALC"]) {
      ret.push(element);
    }
  });
  return ret;
}

async function tpnVolQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for TPN Nutr all time: ", SQL_GET_TPN_VOL);
  console.time("getTpnVol-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_TPN_VOL, binds);
  console.timeEnd("getTpnVol-sql" + timestampLable);
  return rawRecord.rows;
}

async function tpnLipidVolQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for TPN Lipid all time: ", SQL_GET_TPN_LIPID_VOL);
  console.time("getTpnLipidVol-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_TPN_LIPID_VOL, binds);
  console.timeEnd("getTpnLipidVol-sql" + timestampLable);
  return rawRecord.rows;
}

async function enVolQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for EN all time: ", SQL_GET_EN_VOL);
  console.time("getENVol-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_EN_VOL, binds);
  console.timeEnd("getENVol-sql" + timestampLable);
  return rawRecord.rows;
}

async function inoutVolQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for inout volume all time: ", SQL_GET_IN_OUT_VOL);
  console.time("getInoutVol-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_VOL, binds);
  console.timeEnd("getInoutVol-sql" + timestampLable);
  return rawRecord.rows;
}

async function diluVolQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for Diluents volume all time: ", SQL_GET_DILUENTS_VOL);
  console.time("getDiluVol-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_DILUENTS_VOL, binds);
  console.timeEnd("getDiluVol-sql" + timestampLable);
  return rawRecord.rows;
}

async function medVolQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for med volume all time: ", SQL_GET_MED_VOL);
  console.time("getMedVol-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_MED_VOL, binds);
  console.timeEnd("getMedVol-sql" + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(
  arrTPN,
  arrTpnLipid,
  arrEN,
  arrDilu,
  arrInout,
  arrMed,
  weightArr
) {
  // get hour binned data
  let retDict = {};

  if (arrTPN && arrTPN.length) {
    // TPN database is already binned by hour
    console.log("Tpn record size :", arrTPN.length);
    for (let row of arrTPN) {
      //example row = {"START_UNIX": 1524700800, "Amino_Acids g/kg": 2}
      let start = row["START_UNIX"];
      let end = row["END_UNIX"];
      let tpn = row["RESULT_VAL"];
      if (start >= end) {
        // console.warn("TPN row error start/end time:", row);
        continue;
      }
      if (start && end && row["RESULT_VAL"]) {
        let timestamp = Math.floor(start / 3600) * 3600;
        if (timestamp - start) {
          if (timestamp - Math.floor((end - 1) / 3600) * 3600) {
            // console.log('TPN row has abnormal start/end time :', row);
          }
        }
        accValueToDict(tpn, timestamp, "TPN", retDict);
      } else {
        console.log("TPN start or end time null :", row);
      }
    }
  }

  if (arrTpnLipid && arrTpnLipid.length) {
    // TPN database is already binned by hour
    console.log("TpnLipid record size :", arrTpnLipid.length);
    for (let row of arrTpnLipid) {
      let timestamp = Math.floor(row["DT_UNIX"] / 3600) * 3600;
      if (timestamp && row["RESULT_VAL"]) {
        let tpnlipid = row["RESULT_VAL"] / getWeight(timestamp, weightArr);
        accValueToDict(tpnlipid, timestamp, "LIPIDS", retDict);
      }
    }
  }

  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_DTUNIX": 1524700800, "VOLUME": 2}
      let timestamp = Math.floor(row["START_TIME_DTUNIX"] / 3600) * 3600;
      if (timestamp && row["VOLUME"]) {
        let feeds = row["VOLUME"] / getWeight(timestamp, weightArr);
        accValueToDict(feeds, timestamp, "FEEDS", retDict);
      }
    }
  }

  if (arrMed && arrMed.length) {
    console.log("Med record size :", arrMed.length);
    for (let row of arrMed) {
      // DT_UNIX,  INFUSED_VOLUME
      let timestamp = Math.floor(row["DT_UNIX"] / 3600) * 3600;
      if (timestamp && row["INFUSED_VOLUME"]) {
        let medications = row["INFUSED_VOLUME"] / getWeight(timestamp, weightArr);
        accValueToDict(medications, timestamp, "MEDICATIONS", retDict);
      }
    }
  }

  if (arrDilu && arrDilu.length) {
    console.log("arrDilu record size :", arrDilu.length);
    for (let row of arrDilu) {
      // START_UNIX,  END_UNIX,  DRUG,  DILUENT,  INFUSION_RATE,  INFUSION_RATE_UNITS
      let rate = row["INFUSION_RATE"];
      let start = row["START_UNIX"];
      let end = row["END_UNIX"];
      if (start && end && rate && end > start) {
        let startTimestamp = Math.floor(start / 3600) * 3600;
        let binNumber = Math.ceil(end / 3600) - Math.floor(start / 3600);

        // flushes
        for (let i = 0; i < binNumber; i++) {
          let timestamp = startTimestamp + 3600 * i;
          if (row["DRUG"] === "papavarine" || row["DRUG"] === "heparin flush") {
            accValueToDict(rate, timestamp, "FLUSHES", retDict);
          } else {
            accValueToDict(rate, timestamp, "INFUSIONS", retDict);
          }
        }
      } else {
        console.warn("error: on start/end/rate for this row :", row);
      }
    }
  }

  if (arrInout && arrInout.length) {
    // TPN database is already binned by hour
    console.log("InOut record size :", arrInout.length);
    for (let row of arrInout) {
      // DT_UNIX,  EVENT_CD,  VALUE
      let timestamp = Math.floor(row["DT_UNIX"] / 3600) * 3600;
      if (timestamp > 0 && row["VALUE"]) {
        let tpnlipid = row["VALUE"] / getWeight(timestamp, weightArr);
        if (EVENT_CD_DICT[row["EVENT_CD"]]["IO_CAT"] === "IVF") {
          accValueToDict(tpnlipid, timestamp, "IVF", retDict);
        } else if (EVENT_CD_DICT[row["EVENT_CD"]["IO_CAT"]] === "BLOOD PRODUCT") {
          accValueToDict(tpnlipid, timestamp, "BLOOD PRODUCT", retDict);
        }
      }
    }
  }

  let retArr = [];
  for (let timestamp in retDict) {
    let curObj = { timestamp: Number(timestamp), ...retDict[timestamp] };   
    retArr.push(curObj);
  }
  console.log('return array length :', retArr.length);

  return retArr.sort((a, b) => a.timestamp - b.timestamp);
}

const getWeight = (timestamp, weightArr) => {
  let index = bisect_left(weightArr, timestamp, x => x["DT_UNIX"]);
  if (index < 0) {
    console.log("at timestamp has no weight:", timestamp);
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

const getNutriVolume = database.withConnection(async function(conn, binds) {
  let weightArr = await weightCalcQuerySQLExecutor(conn, binds);
  let tpnRaw = await tpnVolQuerySQLExecutor(conn, binds);
  let tpnLipidRaw = await tpnLipidVolQuerySQLExecutor(conn, binds);
  let enRaw = await enVolQuerySQLExecutor(conn, binds);
  let diluRaw = await diluVolQuerySQLExecutor(conn, binds);
  let inoutRaw = await inoutVolQuerySQLExecutor(conn, binds);
  let medRaw = await medVolQuerySQLExecutor(conn, binds);
  let result = _calculateRawRecords(
    tpnRaw,
    tpnLipidRaw,
    enRaw,
    diluRaw,
    inoutRaw,
    medRaw,
    weightArr
  );
  return result;
});

module.exports = {
  getNutriVolume
};
