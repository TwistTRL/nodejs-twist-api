const database = require("../services/database");
const {getSingleResult,getSingleRawResult} = require("../db_relation/vitals-db-relation");

const cat2 = "data_type";
const cat3 = "data_resolution";
const catPersonId = "person_id";
const catVitalType = "vital_type";

const catFrom = "from";
const catTo = "to";

const catVitalTypeArray = ["mbp", "sbp", "dbp", "spo2", "hr"];
const cat2Array = ["binned", "calc"];
const cat3Array = ["1D","12H", "5H", "5M"];

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
    "person_id": 25796315,
    "vital_type": "mbp",
    "from":2222,
    "to":334
}

 * @param {*} conn 
 * @param {*} query 
 */
async function vitalsRawQuerySQLExecutor(conn,query){
  console.time('getVitalRaw');
  let vitalType = _getSqlVitalType(query);
  
  let SQL_GET_RAW = SQL_GET_RAW_PART1 + vitalType 
  + SQL_GET_RAW_PART2 + query[catPersonId] + SQL_GET_RAW_PART3 + query[catFrom]*1 
  + SQL_GET_RAW_PART4 + query[catTo]*1 + SQL_GET_RAW_PART5;

  console.log("get raw sql: ", SQL_GET_RAW);
  let rawRecord = await conn.execute(SQL_GET_RAW);  
  let jsonString = _calculateRawRecords(rawRecord, vitalType);
  console.timeEnd('getVitalRaw');
  return jsonString;
}

function _calculateRawRecords(rawRecord, vitalType) {
  var result = [];
  
  // rawRecord = {"metadata":[], "rows":[]}
  var arr = rawRecord.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  for (let row of arr) {
    //example row = {"HR_EKG": 100, "DTUNIX": "1524700800"}
    let singleResult = getSingleRawResult();
    singleResult.time = row.DTUNIX;
    singleResult.value = row[vitalType];
    result.push(singleResult);   
  }
  return result;
}


/**
 * 
 * 
 * query:
 * 
 *{
    "person_id": 25796315,
    "vital_type": "mbp",
    "data_type": "binned",
    "data_resolution": "1D"
}
 *
 * @param {*} conn
 * @param {*} query
 * @returns
 */
async function vitalsQuerySQLExecutor(conn,query){
  console.time('getVital');

  let sqlDict = SQL_GET_DICT + "'" + _getSqlVitalType(query) + "'";
  console.log("sqlDict = ", sqlDict);
  let dictRecord = await conn.execute(sqlDict);
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

  let sqlTable = _getSqlTable(query);
  console.log("sqlTable = ", sqlTable);

  let person_id = query[catPersonId];

  let sqlQuery = SQL_PART1 + sqlTable + SQL_PART2 + person_id + ` AND BIN_ID > ` + minBinId + ` AND BIN_ID < ` + maxBinId + SQL_PART3;
  console.log("sqlQuery = ", sqlQuery);
  let vitalsRecords = await conn.execute(sqlQuery);  
  let jsonString = _calculateRecords(dictResult, vitalsRecords, query[cat3]);

  console.timeEnd('getVital');
  return jsonString;

}

function _getQueryType(query) {

  if (!_isJsonString(query)) {
    console.warn("not json");
    return 0;
  }
  if (!catVitalTypeArray.includes(query[catVitalType] || query[catPersonId] == null)) {
    return 0;
  }

  if (!cat2Array.includes(query[cat2]) || !cat3Array.includes(query[cat3])) {
    if (query[catFrom] == null || query[catTo] == null){
      return 0;
    } else {
      console.log("type: get raw");
      return 2;
    }
  }
  console.log("type: get down sampled");
  return 1;
}


function _isJsonString(str) {
  try {
    JSON.parse(JSON.stringify(str));
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}

function _getSqlVitalType(query) {

  var result;
  switch (query[catVitalType]) {
    case "mbp":
        result = "MBP1"
      break;
    case "sbp":
        result = "SBP1"
      break;
    case "dbp":
        result = "DBP1"
      break;
    case "spo2":
        result = "SPO2_1"
      break;
    case "hr":
        result = "HR_EKG"
      break;
    default:
        console.log("error for query.cat3");
      break;
  }
  return result;
}

function _getSqlTable(query) {
  var sqlTable;

  if (query[cat2] == "binned") {
    switch (query[cat3]) {
      case "1D":
        sqlTable = "STAGING_NEW_VITALS_BIN_1D"
        break;
      case "12H":
        sqlTable = "STAGING_NEW_VITALS_BIN_12H"
        break;
      case "5H":
        sqlTable = "STAGING_NEW_VITALS_BIN_5H"
        break;
      case "5M":
        sqlTable = "STAGING_NEW_VITALS_BIN_5M"
        break;
      default:
        console.log("error for query.cat3");
        break;
    }
  } else if (query[cat2] == "calc") {
    switch (query[cat3]) {
      case "1D":
        sqlTable = "STAGING_NEW_VITALS_BIN_1D"
        break;
      case "12H":
        sqlTable = "STAGING_NEW_VITALS_CALC_12H"
        break;
      case "5H":
        sqlTable = "STAGING_NEW_VITALS_CALC_5H"
        break;
      case "5M":
        sqlTable = "STAGING_NEW_VITALS_CALC_5M"
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

function _calculateRecords(dictResult, vitalsRecords, timeString) {
  var result = [dictResult];
  var timeInterval;

  switch (timeString) {
    case "12H":
      timeInterval = 43200;
      break;
    case "5H":
      timeInterval = 18000;
      break;
    case "1D":
      timeInterval = 86400;
      break;
    case "5M":
      timeInterval = 300;
      break;
    default:
      console.log("Invalid Time String...");
      return;
  }

  // vitalsRecords = {"metadata":[], "rows":[]}
  var arr = vitalsRecords.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  var currentStartTM = 0;
  for (let vitalsRecord of arr) {
    //example vitalsRecord = {"START_TM": "1524657600", "END_TM": "1524700800", "BIN_ID": "9", "VAL": 9}

    // if timeString is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
    if (vitalsRecord.END_TM*1 - vitalsRecord.START_TM*1 != timeInterval) {
      console.warn("Error for " + timeString + " with " + vitalsRecord.START_TM + ", " + vitalsRecord.END_TM);
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
        console.log("start pushing into array...");
      }
      currentStartTM = vitalsRecord.START_TM;
      singleResult = getSingleResult(dictResult, currentStartTM, (currentStartTM * 1 + timeInterval) + "");
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

const getVitalsQuery = database.withConnection(async function(conn,query){
  console.log("query = ", query);
  if (_getQueryType(query) == 0) {
    return "query not valid...";
  } else if (_getQueryType(query) == 1) {
    console.log("_getQueryType", 1)
    return await vitalsQuerySQLExecutor(conn,query);
  } else{
    console.log("_getQueryType", 2)
    return await vitalsRawQuerySQLExecutor(conn,query);
  }
});

module.exports = {
  getVitalsQuery
};
