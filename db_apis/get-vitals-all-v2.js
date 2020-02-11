/*
 * @Author: Peng 
 * @Date: 2020-01-21 11:53:31 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-11 16:36:58
 */


const database = require("../services/database");
const {
  getSingleBinnedResult,
  getSingleRawResult,
  CAT_VITAL_TYPE_ARRAY,
  SQLVitalTypeDict,
  SQLVitalTypeDict2ndChoice
} = require("../db_relation/vitals-db-relation");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const {
  getSingleVitalCALCResult
} = require("../db_relation/vitals-calc-relation")

const cat2 = "data_type";
const cat3 = "data_resolution";
const catPersonId = "person_id";
const catVitalType = "vital_type";
const catFrom = "from";
const catTo = "to";
const cat2Array = ["binned", "calc"];
const cat3Array = ["1D", "12H", "5H", "5M"];

const DATATYPE = Object.freeze({
  BINNED: "binned",
  CALC: "calc",
  RAW: "raw"
});


var timeLable = 0;

function _getQueryType(query) {
  if (Object.entries(query).length === 0 && query.constructor === Object) {
    console.error("query empty");
    throw new InputInvalidError('Input not valid, so query is empty.');
  }

  if (!isValidJson.validate_vitals_sampled(query) && !isValidJson.validate_vitals_raw(query)) {
    console.warn(query + " : not json");
    throw new InputInvalidError('Input not in valid json');
  }

  if (!CAT_VITAL_TYPE_ARRAY.includes(query[catVitalType])) {
    console.warn("catVitalType no included: " + query[catVitalType]);
    throw new InputInvalidError('vital_type not valid: ' + query[catVitalType] + '. \nAll vital_type: "mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp".');
  }
  if (query[catPersonId] == null) {
    console.warn("catPersonId is null");
    throw new InputInvalidError('person_id is null');
  }


  if (query[cat2] != null) {

    if (!cat2Array.includes(query[cat2])) {
      throw new InputInvalidError('"data_type" is not valid. All "data_type": "binned", "calc".');
    }

    if (query[cat3] == null || !cat3Array.includes(query[cat3])) {
      throw new InputInvalidError('"data_resolution" is not valid. All "data_resolution": "1D","12H", "5H", "5M".');
    }

    console.log("type: get down sampled");
    if (query[cat2] == cat2Array[0]) {
      return DATATYPE.BINNED;
    } else {
      return DATATYPE.CALC;
    }
  }

  let currentTime = new Date().getTime() / 1000;
  let year2000Time = 946684800;
  if (query[catFrom] == null || query[catFrom] > currentTime + 10 || query[catFrom] < year2000Time) {
    throw new InputInvalidError('Timestamp "from" is not valid');
  } else if (query[catTo] == null || query[catTo] < query[catFrom]) {
    throw new InputInvalidError('Timestamp "to" is not valid');
  } else if (query[catTo] > currentTime + 10) {
    query[catTo] = currentTime;
  }
  console.log("v2 type: get raw");
  return DATATYPE.RAW;
}

function _getSqlTable(query) {
  var sqlTable;
  console.log("query[cat2] = ", query[cat2]);

  if (query[cat2] == "binned") {
    switch (query[cat3]) {
      case "1D":
        sqlTable = "STAGING_VITALS_BIN_1D"
        break;
      case "12H":
        sqlTable = "STAGING_VITALS_BIN_12H"
        break;
      case "5H":
        sqlTable = "STAGING_VITALS_BIN_5H"
        break;
      case "5M":
        sqlTable = "STAGING_VITALS_BIN_5M"
        break;
      default:
        console.log("error for query.cat3");
        break;
    }
  } else if (query[cat2] == "calc") {
    switch (query[cat3]) {
      case "1D":
        sqlTable = "STAGING_VITALS_CALC_1D"
        break;
      case "12H":
        sqlTable = "STAGING_VITALS_CALC_12H"
        break;
      case "5H":
        sqlTable = "STAGING_VITALS_CALC_5H"
        break;
      case "5M":
        sqlTable = "STAGING_VITALS_CALC_5M"
        break;
      default:
        console.log("error for query.cat3");
        break;
    }
  } else {
    console.log("error for query.cat2");
  }
  return sqlTable;
}


//~~~~~~~~~~~~~~~~~~~~~ raw ~~~~~~~~~~~~
// get raw vitals between two timestamp
const SQL_GET_RAW_PART1 = `
SELECT
`
const SQL_GET_RAW_PART2 = `, 
  DTUNIX
FROM VITALS
WHERE PERSON_ID = `

const SQL_GET_RAW_PART3 = `
AND DTUNIX > `

const SQL_GET_RAW_PART4 = ` AND DTUNIX < `
const SQL_GET_RAW_PART5 = ` 
ORDER BY DTUNIX
`

/**
 * query:
 * {
    "person_id": 11111111,
    "vital_type": "mbp",
    "from":2222,
    "to":334
}

 * @param {*} conn 
 * @param {*} query 
 */
async function vitalsRawQuerySQLExecutor(conn, query) {
  let timestamp = timeLable++;

  console.time('getVitalRaw' + timestamp);
  let vitalType = SQLVitalTypeDict[query[catVitalType]];
  console.log("vitalType: ", vitalType);
  let vitalType2nd = SQLVitalTypeDict2ndChoice[query[catVitalType]];
  console.log("vitalType2nd: ", vitalType2nd);

  let SQL_GET_RAW = SQL_GET_RAW_PART1 + vitalType +
    SQL_GET_RAW_PART2 + query[catPersonId] + SQL_GET_RAW_PART3 + query[catFrom] * 1 +
    SQL_GET_RAW_PART4 + query[catTo] * 1 + SQL_GET_RAW_PART5;

  console.log("get raw sql: ", SQL_GET_RAW);
  console.time('getVitalRaw-1st ' + timestamp);
  let rawRecord = await conn.execute(SQL_GET_RAW);
  console.timeEnd('getVitalRaw-1st ' + timestamp);

  let rawRecord2nd;
  if (vitalType2nd) {
    let SQL_GET_RAW_2nd = SQL_GET_RAW_PART1 + vitalType2nd +
      SQL_GET_RAW_PART2 + query[catPersonId] + SQL_GET_RAW_PART3 + query[catFrom] * 1 +
      SQL_GET_RAW_PART4 + query[catTo] * 1 + SQL_GET_RAW_PART5;

    console.log("get raw sql_2nd: ", SQL_GET_RAW_2nd);
    console.time('getVitalRaw-2nd ' + timestamp);
    rawRecord2nd = await conn.execute(SQL_GET_RAW_2nd);
    console.timeEnd('getVitalRaw-2nd ' + timestamp);
  }

  let jsonString = _calculateRawRecords(rawRecord, vitalType, rawRecord2nd, vitalType2nd);
  console.timeEnd('getVitalRaw' + timestamp);
  return jsonString;
}

function _calculateRawRecords(rawRecord, vitalType, rawRecord2nd, vitalType2nd) {
  if (!vitalType2nd && !rawRecord2nd) {
    var result = [];
    // rawRecord = {"metadata":[], "rows":[]}
    var arr = rawRecord.rows;
    console.log("vitals Raw record size :", arr.length);

    if (arr.length < 1) {
      return [];
    }

    for (let row of arr) {
      //example row = {"HR_EKG": 100, "DTUNIX": "1524700800"}  
      if (row[vitalType] == null) {
        // skip null value vital records;
        continue;
      }
      // let singleResult = getSingleRawResult();
      let singleResult = {};
      singleResult.time = row.DTUNIX;
      singleResult.value = row[vitalType];
      result.push(singleResult);
    }
    return result;
  } else if (!vitalType2nd || !rawRecord2nd) {
    console.log("Error  vitalType2nd = ", vitalType2nd);
  } else {
    return combine2RawResults(rawRecord, vitalType, rawRecord2nd, vitalType2nd);
  }
}

function combine2RawResults(rawRecord, vitalType, rawRecord2nd, vitalType2nd) {
  var result = [];
  let arr1 = rawRecord.rows;
  let arr2 = rawRecord2nd.rows;
  console.log("vitals Raw record size :", arr1.length);
  console.log("vitals Raw2 record size :", arr2.length);

  let h1 = 0; // index of arr1
  let h2 = 0; // index of arr2
  while (h1 < arr1.length && h2 < arr2.length) {
    if (arr1[h1][vitalType] == null) {
      h1++;
      continue;
    }
    if (arr2[h2][vitalType2nd] == null) {
      h2++;
      continue;
    }
    if (arr1[h1].DTUNIX == arr2[h2].DTUNIX) {
      let singleResult = {};
      singleResult.name = vitalType;
      singleResult.time = arr1[h1].DTUNIX;
      singleResult.value = arr1[h1][vitalType];
      result.push(singleResult);
      h1++;
      h2++;
    } else if (arr1[h1].DTUNIX > arr2[h2].DTUNIX) {
      let singleResult = {};
      singleResult.name = vitalType2nd;
      singleResult.time = arr2[h2].DTUNIX;
      singleResult.value = arr2[h2][vitalType];
      result.push(singleResult);
      h2++;
    } else if (arr1[h1].DTUNIX < arr2[h2].DTUNIX) {
      let singleResult = {};
      singleResult.name = vitalType;
      singleResult.time = arr1[h1].DTUNIX;
      singleResult.value = arr1[h1][vitalType];
      result.push(singleResult);
      h1++;
    } else {
      console.log("Error h1 or h2");
    }
  }

  // the rest of arr1 or arr2
  while (h2 < arr2.length) {
    let singleResult = {};
    singleResult.name = vitalType2nd;
    singleResult.time = arr2[h2].DTUNIX;
    singleResult.value = arr2[h2][vitalType];
    result.push(singleResult);
    h2++;
  }

  while (h1 < arr1.length) {
    let singleResult = {};
    singleResult.name = vitalType;
    singleResult.time = arr1[h1].DTUNIX;
    singleResult.value = arr1[h1][vitalType];
    result.push(singleResult);
    h1++;
  }

  return result;
}

//~~~~~~~~~~~~~~~~~~~~~ binned ~~~~~~~~~~~~
// get binned vitals
const SQL_GET_DICT = `
SELECT 
  BIN_ID,
  LMT_ST, 
  LMT_END 
FROM DEF_VITALS_LMT
WHERE VITAL_TYPE = 
`
const SQL_PART1 = `
SELECT
  START_TM,
  END_TM,
  BIN_ID,
  VAL
FROM `

const SQL_PART2 = `
WHERE PERSON_ID = `

const SQL_PART3 = `
ORDER BY START_TM
`


/**
 * 
 * 
 * query:
 * 
 *{
    "person_id": 11111111,
    "vital_type": "mbp",
    "data_type": "binned",
    "data_resolution": "1D"
}
 *
 * @param {*} conn
 * @param {*} query
 * @returns
 */
async function vitalsBinnedQuerySQLExecutor(conn, query) {
  let timestamp = timeLable++;
  console.time('getVitalBinned' + timestamp);

  let vitalType = SQLVitalTypeDict[query[catVitalType]];
  let sqlDict = SQL_GET_DICT + "'" + vitalType + "'";
  console.log("sqlDict = ", sqlDict);
  let dictRecord = await conn.execute(sqlDict);
  let [minBinId, maxBinId, dictResult] = getMinMaxBinId(dictRecord);

  let sqlTable = _getSqlTable(query);
  console.log("binned sqlTable = ", sqlTable);
  let person_id = query[catPersonId];

  let sqlQuery = SQL_PART1 + sqlTable + SQL_PART2 + person_id + ` AND BIN_ID >= ` + minBinId + ` AND BIN_ID <= ` + maxBinId + SQL_PART3;
  console.log("sqlQuery = ", sqlQuery);
  console.time('getVitalBinned-1st ' + timestamp);
  let vitalsRecords = await conn.execute(sqlQuery);
  console.timeEnd('getVitalBinned-1st ' + timestamp);


  let timeInterval = convertTimeInterval(query[cat3]);
  let vitalType2nd = SQLVitalTypeDict2ndChoice[query[catVitalType]];
  console.log("vitalType2nd: ", vitalType2nd);

  if (vitalType2nd) {
    let sqlDict2nd = SQL_GET_DICT + "'" + vitalType2nd + "'";
    console.log("sqlDict2nd = ", sqlDict2nd);
    let dictRecord2nd = await conn.execute(sqlDict2nd);
    let [minBinId2nd, maxBinId2nd, dictResult2nd] = getMinMaxBinId(dictRecord2nd);

    let mapDictResult = getBinIdMapDictResult(dictResult, dictResult2nd);
    // console.log("mapDictResult = ", mapDictResult);

    let sqlQuery2nd = SQL_PART1 + sqlTable + SQL_PART2 + person_id + ` AND BIN_ID >= ` + minBinId2nd + ` AND BIN_ID <= ` + maxBinId2nd + SQL_PART3;
    console.log("sqlQuery2nd = ", sqlQuery2nd);
    console.time('getVitalBinned-2nd ' + timestamp);
    let vitalsRecords2nd = await conn.execute(sqlQuery2nd);
    console.timeEnd('getVitalBinned-2nd ' + timestamp);
    let binnedResult = _calculateBinnedRecords(vitalType, dictResult, vitalsRecords, vitalType2nd, mapDictResult, vitalsRecords2nd, timeInterval);
    console.timeEnd('getVitalBinned' + timestamp);
    return binnedResult;
  }

  let binnedResult = _calculateBinnedRecords(vitalType, dictResult, vitalsRecords, timeInterval);
  console.timeEnd('getVitalBinned' + timestamp);
  return binnedResult;

}

function getMinMaxBinId(dictRecord) {
  let dictResult = {};
  let maxBinId = 0;
  let minBinId = Number.MAX_SAFE_INTEGER;
  for (let row of dictRecord.rows) {
    if (row.BIN_ID > maxBinId) {
      maxBinId = row.BIN_ID;
    }
    if (row.BIN_ID < minBinId) {
      minBinId = row.BIN_ID;
    }
    dictResult[row.BIN_ID] = [row.LMT_ST, row.LMT_END];
  }
  return [minBinId, maxBinId, dictResult];
}

function _calculateBinnedRecords(vitalType, dictResult, vitalsRecords, vitalType2nd = null, mapDictResult = null, vitalsRecords2nd = null, timeInterval) {
  var result = [dictResult];
  // vitalsRecords = {"metadata":[], "rows":[]}
  var arr1 = vitalsRecords.rows;
  console.log("vitals Binned record size :", arr1.length);

  // vitalsRecords = {"metadata":[], "rows":[]}
  if (vitalsRecords2nd != null && vitalsRecords2nd.rows != null && vitalsRecords2nd.rows.length != 0) {
    let arr2 = vitalsRecords2nd.rows;
    console.log("vitals Binned 2nd record size :", arr2.length);
    let count2nd = 0;
    let currentStartTM = 0;
    var singleResult;
    let records_start_time = Math.min(arr1[0].START_TM, arr2[0].START_TM);
    //example one record = {"START_TM": "1524657600", "END_TM": "1524700800", "BIN_ID": "9", "VAL": 9}

    let h1 = 0; // index of arr1
    let h2 = 0; // index of arr2
    while (h1 < arr1.length && h2 < arr2.length) {


      // todo remove this later
      if ( !(arr2[h2].START_TM - records_start_time) % timeInterval && (arr2[h2].START_TM - records_start_time)) {
        console.warn("1 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
        console.log('records_start_time :', records_start_time);
        console.log('arr1[0].START_TM :', arr1[0].START_TM);
        console.log('arr2[0].START_TM :', arr2[0].START_TM);

        console.log('timeInterval :', timeInterval);
      }

      if (arr1[h1].START_TM == arr2[h2].START_TM) {
        // both at this time, keep data from arr1

        if (arr1[h1].END_TM * 1 - arr1[h1].START_TM * 1 != timeInterval) {
          console.warn("2 Error for " + vitalType + " with " + arr1[h1].START_TM + ", " + arr1[h1].END_TM);
          console.log('records_start_time :', records_start_time);
          console.log('timeInterval :', timeInterval);
        }
        if (arr2[h2].END_TM * 1 - arr2[h2].START_TM * 1 != timeInterval) {
          console.warn("3 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
          console.log('records_start_time :', records_start_time);
          console.log('timeInterval :', timeInterval);
        }

        if (currentStartTM != arr1[h1].START_TM) {
          if (currentStartTM != 0) {
            result.push(singleResult);
          }
          // new singleResult
          currentStartTM = arr1[h1].START_TM;
          singleResult = getSingleBinnedResult(vitalType, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
        }
        singleResult[arr1[h1].BIN_ID] = arr1[h1].VAL;
        h1++;
        h2++;
      } else if (arr1[h1].START_TM > arr2[h2].START_TM) {
        // only data from arr2 at this time

        if (arr2[h2].END_TM * 1 - arr2[h2].START_TM * 1 != timeInterval) {
          console.warn("4 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
          console.log('records_start_time :', records_start_time);
          console.log('timeInterval :', timeInterval);
        }

        if (currentStartTM != arr2[h2].START_TM) {
          if (currentStartTM != 0) {
            result.push(singleResult);
          }
          // new singleResult
          currentStartTM = arr2[h2].START_TM;
          singleResult = getSingleBinnedResult(vitalType2nd, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
        }

        singleResult[mapDictResult[arr2[h2].BIN_ID]] = arr2[h2].VAL;
        count2nd++;
        h2++;
      } else if (arr1[h1].START_TM < arr2[h2].START_TM) {
        // only data from arr1 at this time

        if (currentStartTM != arr1[h1].START_TM) {
          if (currentStartTM != 0) {
            result.push(singleResult);
          }
          // new singleResult
          currentStartTM = arr1[h1].START_TM;
          singleResult = getSingleBinnedResult(vitalType, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
        }
        singleResult[arr1[h1].BIN_ID] = arr1[h1].VAL;
        h1++;
      } else {
        console.log("Error h1 or h2");
      }
    }

    // the rest of arr1 or arr2
    while (h2 < arr2.length) {
      if (arr2[h2].END_TM * 1 - arr2[h2].START_TM * 1 != timeInterval) {
        console.warn("5 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
        console.log('records_start_time :', records_start_time);
        console.log('timeInterval :', timeInterval);
      }

      if (currentStartTM != arr2[h2].START_TM) {
        if (currentStartTM != 0) {
          result.push(singleResult);
        }
        // new singleResult
        currentStartTM = arr2[h2].START_TM;
        singleResult = getSingleBinnedResult(vitalType2nd, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
      }
      singleResult[mapDictResult[arr2[h2].BIN_ID]] = arr2[h2].VAL;
      count2nd++;
      h2++;
    }
    while (h1 < arr1.length) {
      if (currentStartTM != arr1[h1].START_TM) {
        if (currentStartTM != 0) {
          result.push(singleResult);
        }
        // new singleResult
        currentStartTM = arr1[h1].START_TM;
        singleResult = getSingleBinnedResult(vitalType, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
      }
      singleResult[arr1[h1].BIN_ID] = arr1[h1].VAL;
      h1++;
    }

    // last item
    if (result[result.length - 1] != singleResult) {
      result.push(singleResult);
    }
    console.log(` 2nd used for binned = ${count2nd}`);
    return result;
  } else {
    // no source2 data
    // check source1 data
    if (arr1.length < 1) {
      return [];
    }
    var currentStartTM = 0;
    for (let vitalsRecord of arr1) {
      //example vitalsRecord = {"START_TM": "1524657600", "END_TM": "1524700800", "BIN_ID": "9", "VAL": 9}

      // if timeInterval is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
      if (vitalsRecord.END_TM * 1 - vitalsRecord.START_TM * 1 != timeInterval) {
        console.warn("6 Error for " + timeInterval + " with " + vitalsRecord.START_TM + ", " + vitalsRecord.END_TM);
        console.log('vitalsRecord.START_TM :', vitalsRecord.START_TM);
        console.log('timeInterval :', timeInterval);
      }

      // start_time was sorted when sql query done.
      // for a currentStartTM same with last record, add all bin_id to this singleResult
      // for a new currentStartTM, create a new binDict with timestamp and binString with default value "0"
      var singleResult;
      if (currentStartTM != vitalsRecord.START_TM) {

        if (currentStartTM != 0) {
          result.push(singleResult);
        } else {
          // the first record
          // console.log("start pushing into array...");
        }
        currentStartTM = vitalsRecord.START_TM;
        singleResult = getSingleBinnedResult(vitalType, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
        // console.log("singleResult = ", singleResult);
      }

      // getBinString convert bin_id "8" to "100-110"
      // at the same record, same BIN_ID only has one VAL
      singleResult[vitalsRecord.BIN_ID] = vitalsRecord.VAL;
    }

    // last item
    if (result[result.length - 1] != singleResult) {
      result.push(singleResult);
    }
    return result;
  }


}


function getBinIdMapDictResult(dictResult, dictResult2nd) {
  let keyMap = {};
  for (let key2nd in dictResult2nd) {
    for (let key in dictResult) {
      if (dictResult2nd[key2nd][0] == dictResult[key][0] && dictResult2nd[key2nd][1] == dictResult[key][1]) {
        keyMap[key2nd] = key;
        continue;
      }
    }
  }
  return keyMap;
}

//~~~~~~~~~~~~~~~~~~~~~ calc ~~~~~~~~~~~~
// get calc vitals
const SQL_CALC_PART1 = `
SELECT 
  START_TM,
  END_TM,
  VAL_MIN,
  VAL_MEAN,
  VAL_PERC1,
  VAL_PERC5,
  VAL_PERC25,
  VAL_PERC50,
  VAL_PERC75,
  VAL_PERC95,
  VAL_PERC99,
  VAL_MAX
FROM `

const SQL_CALC_PART2 = `
WHERE PERSON_ID = `

const SQL_CALC_PART3 = ` AND VITAL_TYPE = '`
const SQL_CALC_PART4 = `'
ORDER BY START_TM`

async function vitalsCalcQuerySQLExecutor(conn, query) {
  let timestamp = timeLable++;

  console.time('getVitalCalc-total' + timestamp);
  let sqlTable = _getSqlTable(query);
  console.log("calc sqlTable = ", sqlTable);
  let person_id = query[catPersonId];
  let vitalType = SQLVitalTypeDict[query[catVitalType]];
  console.log("vitalType: ", vitalType);
  let vitalType2nd = SQLVitalTypeDict2ndChoice[query[catVitalType]];
  console.log("vitalType2nd: ", vitalType2nd);

  let sqlQuery = SQL_CALC_PART1 + sqlTable + SQL_CALC_PART2 + person_id + SQL_CALC_PART3 + vitalType + SQL_CALC_PART4;
  console.log("sqlQuery = ", sqlQuery);

  console.time('getVitalCalc-1st' + timestamp);
  let vitalsRecords = await conn.execute(sqlQuery);
  console.timeEnd('getVitalCalc-1st' + timestamp);

  let vitalsRecords2nd;
  if (vitalType2nd) {
    let sqlQuery2nd = SQL_CALC_PART1 + sqlTable + SQL_CALC_PART2 + person_id + SQL_CALC_PART3 + vitalType2nd + SQL_CALC_PART4;
    console.log("sqlQuery2nd = ", sqlQuery2nd);
    console.time('getVitalCalc-2nd ' + timestamp);
    vitalsRecords2nd = await conn.execute(sqlQuery2nd);
    console.timeEnd('getVitalCalc-2nd ' + timestamp);
  }

  let timeInterval = convertTimeInterval(query[cat3]);


  if (!vitalType2nd && !vitalsRecords2nd) {
    // only 1 source
    var result = [];
    // vitalsRecords = {"metadata":[], "rows":[]}
    var arr = vitalsRecords.rows;
    console.log("vitals Calc record size :", arr.length);

    if (arr.length < 1) {
      return [];
    }
    for (let vitalRecord of arr) {
      //example vitalRecord = {"START_TM": "1524657600", "END_TM": "1524700800", "VAL_MIN": "108"...}
      // if timeString is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
      if (vitalRecord.END_TM * 1 - vitalRecord.START_TM * 1 != timeInterval) {
        console.log("7 Error for " + timeInterval + " with " + vitalRecord.START_TM + ", " + vitalRecord.END_TM);
        
      }

      // start_time was sorted when sql query done.
      // at each start time (for a personid and a VITAL_TYPE), there is only one record
      let singleResult = getSingleVitalCALCResult(vitalRecord);
      result.push(singleResult);
    }
    console.timeEnd('getVitalCalc-total' + timestamp);
    return result;

  } else if (!vitalType2nd || !vitalsRecords2nd) {
    console.log("Error  vitalType2nd = ", vitalType2nd);
  } else {
    return combine2CalcResults(vitalsRecords, vitalType, vitalsRecords2nd, vitalType2nd, timeInterval);
  }

}

function combine2CalcResults(vitalsRecords, vitalType, vitalsRecords2nd, vitalType2nd, timeInterval) {
  var result = [];
  // var timeInterval = convertTimeInterval(query[cat3]);

  let arr1 = vitalsRecords.rows;
  let arr2 = vitalsRecords2nd.rows;
  console.log("vitals calc record size :", arr1.length);
  console.log("vitals calc2 record size :", arr2.length);
  let records_start_time = Math.min(arr1[0].START_TM, arr2[0].START_TM);

  let h1 = 0; // index of arr1
  let h2 = 0; // index of arr2
  let count2nd = 0;
  while (h1 < arr1.length && h2 < arr2.length) {

    if ( !(arr2[h2].START_TM - records_start_time) % timeInterval) {
      console.warn("8 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
      console.log('records_start_time :', records_start_time);
      console.log('timeInterval :', timeInterval);

    }


    if (arr1[h1].END_TM * 1 - arr1[h1].START_TM * 1 != timeInterval) {
      console.log("9 Error for " + vitalType + " with " + arr1[h1].START_TM + ", " + arr1[h1].END_TM);
      console.log('records_start_time :', records_start_time);
      console.log('timeInterval :', timeInterval);
    }

    if (arr2[h2].END_TM * 1 - arr2[h2].START_TM * 1 != timeInterval) {
      console.log("10 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
      console.log('records_start_time :', records_start_time);
      console.log('timeInterval :', timeInterval);
    }

    if (arr1[h1].START_TM == arr2[h2].START_TM) {
      let singleResult = getSingleVitalCALCResult(arr1[h1]);
      singleResult.name = vitalType;
      result.push(singleResult);
      h1++;
      h2++;
    } else if (arr1[h1].START_TM > arr2[h2].START_TM) {
      let singleResult = getSingleVitalCALCResult(arr2[h2]);
      singleResult.name = vitalType2nd;
      result.push(singleResult);
      count2nd++;
      h2++;
    } else if (arr1[h1].START_TM < arr2[h2].START_TM) {
      let singleResult = getSingleVitalCALCResult(arr1[h1]);
      singleResult.name = vitalType;
      result.push(singleResult);
      h1++;
    } else {
      console.log(`Error h1 or h2: h1 = ${h1}, h2 = ${h2}`);
    }
  }

  // the rest of arr1 or arr2

  while (h2 < arr2.length) {
    let singleResult = getSingleVitalCALCResult(arr2[h2]);
    singleResult.name = vitalType2nd;
    result.push(singleResult);
    count2nd++;
    h2++;
  }

  while (h1 < arr1.length) {
    let singleResult = getSingleVitalCALCResult(arr1[h1]);
    singleResult.name = vitalType;
    result.push(singleResult);
    h1++;
  }

  console.log(` 2nd used = ${count2nd}`);
  return result;
}

function convertTimeInterval(timeString) {
  switch (timeString) {
    case "12H":
      return 43200;
    case "5H":
      return 18000;
    case "1D":
      return 86400;
    case "5M":
      return 300;
    default:
      return null;
  }
}




const getVitalsQueryV2 = database.withConnection(async function (conn, query) {
  console.log("getVitalsQueryV2: query = ", query);
  if (_getQueryType(query) == DATATYPE.BINNED) {
    return await vitalsBinnedQuerySQLExecutor(conn, query);
  } else if (_getQueryType(query) == DATATYPE.CALC) {
    return await vitalsCalcQuerySQLExecutor(conn, query);
  } else if (_getQueryType(query) == DATATYPE.RAW) {
    return await vitalsRawQuerySQLExecutor(conn, query);
  } else {
    throw new InputInvalidError('_getQueryType ERROR');
  }
});

module.exports = {
  getVitalsQueryV2
};