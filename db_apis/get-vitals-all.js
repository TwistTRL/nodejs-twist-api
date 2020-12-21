const database = require("../services/database");
const {
  getSingleResult,
  getSingleRawResult,
  CAT_VITAL_TYPE_ARRAY,
  SQLVitalTypeDict
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

var timeLable = 0;

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
  let timestamp =  timeLable++;

  console.time('getVitalRaw' + timestamp);
  let vitalType = SQLVitalTypeDict[query[catVitalType]];

  let SQL_GET_RAW = SQL_GET_RAW_PART1 + vitalType +
    SQL_GET_RAW_PART2 + query[catPersonId] + SQL_GET_RAW_PART3 + query[catFrom] * 1 +
    SQL_GET_RAW_PART4 + query[catTo] * 1 + SQL_GET_RAW_PART5;

  console.log("get raw sql: ", SQL_GET_RAW);
  console.time('getVitalRaw-sql' + timestamp);

  let rawRecord = await conn.execute(SQL_GET_RAW);
  console.timeEnd('getVitalRaw-sql' + timestamp);

  let jsonString = _calculateRawRecords(rawRecord, vitalType);
  console.timeEnd('getVitalRaw' + timestamp);
  return jsonString;
}

function _calculateRawRecords(rawRecord, vitalType) {
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
  let timestamp =  timeLable++;
  console.time('getVitalBinned' + timestamp);

  let sqlDict = SQL_GET_DICT + "'" + SQLVitalTypeDict[query[catVitalType]] + "'";
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
  console.log("binned sqlTable = ", sqlTable);

  let person_id = query[catPersonId];

  let sqlQuery = SQL_PART1 + sqlTable + SQL_PART2 + person_id + ` AND BIN_ID >= ` + minBinId + ` AND BIN_ID <= ` + maxBinId + SQL_PART3;
  console.log("sqlQuery = ", sqlQuery);
  console.time('getVitalBinned-sql' + timestamp);
  let vitalsRecords = await conn.execute(sqlQuery);
  console.timeEnd('getVitalBinned-sql' + timestamp);

  let jsonString = _calculateRecords(dictResult, vitalsRecords, query[cat3]);

  console.timeEnd('getVitalBinned' + timestamp);
  return jsonString;

}


async function vitalsCalcQuerySQLExecutor(conn, query) {
  let timestamp =  timeLable++;

  console.time('getVitalCalc-total' + timestamp);
  let sqlTable = _getSqlTable(query);
  console.log("calc sqlTable = ", sqlTable);
  let person_id = query[catPersonId];
  let vitalType = SQLVitalTypeDict[query[catVitalType]];

  let sqlQuery = SQL_CALC_PART1 + sqlTable + SQL_CALC_PART2 + person_id + SQL_CALC_PART3 + vitalType + SQL_CALC_PART4;
  console.log("sqlQuery = ", sqlQuery);

  console.time('getVitalCalc-sql' + timestamp);
  let vitalsRecords = await conn.execute(sqlQuery);
  console.timeEnd('getVitalCalc-sql' + timestamp);

  var result = [];
  var timeInterval;

  // just for doublecheck START_TM and END_TM
  switch (query[cat3]) {
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
  console.log("vitals Calc record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }
  for (let vitalRecord of arr) {
    //example vitalRecord = {"START_TM": "1524657600", "END_TM": "1524700800", "VAL_MIN": "108"...}

    // if timeString is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
    if (vitalRecord.END_TM * 1 - vitalRecord.START_TM * 1 != timeInterval) {
      console.log("Error for " + timeString + " with " + vitalRecord.START_TM + ", " + vitalRecord.END_TM);
    }

    // start_time was sorted when sql query done.
    // at each start time (for a personid and a VITAL_TYPE), there is only one record

    let singleResult = getSingleVitalCALCResult(vitalRecord);
    result.push(singleResult);
  }

  console.timeEnd('getVitalCalc-total' + timestamp);
  return result;
}


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

    console.log("~~ type: get down sampled");
    if (query[cat2] == cat2Array[0]) {
      return DATATYPE.BINNED;
    } else {
      return DATATYPE.CALC;
    }
  }

  let currentTime = new Date().getTime() / 1000 | 0;
  let year2000Time = 946684800;
  if (query[catFrom] == null || query[catFrom] > currentTime + 10 || query[catFrom] < year2000Time) {
    throw new InputInvalidError('Timestamp "from" is not valid');
  } else if (query[catTo] == null || query[catTo] < query[catFrom]) {
    throw new InputInvalidError('Timestamp "to" is not valid');
  } else if (query[catTo] > currentTime + 10) {
    query[catTo] = currentTime;
  }
  console.log("type: get raw");
  return DATATYPE.RAW;

}

function _getSqlTable(query) {
  var sqlTable;
  console.log("query[cat2] = ", query[cat2]);

  if (query[cat2] == "binned") {
    switch (query[cat3]) {
      case "1D":
        sqlTable = "VITALS_BIN_1D"
        break;
      case "12H":
        sqlTable = "VITALS_BIN_12H"
        break;
      case "5H":
        sqlTable = "VITALS_BIN_5H"
        break;
      case "5M":
        sqlTable = "VITALS_BIN_5M"
        break;
      default:
        console.log("error for query.cat3");
        break;
    }
  } else if (query[cat2] == "calc") {
    switch (query[cat3]) {
      case "1D":
        sqlTable = "VITALS_CALC_1D"
        break;
      case "12H":
        sqlTable = "VITALS_CALC_12H"
        break;
      case "5H":
        sqlTable = "VITALS_CALC_5H"
        break;
      case "5M":
        sqlTable = "VITALS_CALC_5M"
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
  console.log("vitals Binned record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  var currentStartTM = 0;
  for (let vitalsRecord of arr) {
    //example vitalsRecord = {"START_TM": "1524657600", "END_TM": "1524700800", "BIN_ID": "9", "VAL": 9}

    // if timeString is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
    if (vitalsRecord.END_TM * 1 - vitalsRecord.START_TM * 1 != timeInterval) {
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
        // console.log("start pushing into array...");
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

const getVitalsQuery = database.withConnection(async function (conn, query) {
  console.log("query = ", query);
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
  getVitalsQuery
};