/*
 * @Author: Peng
 * @Date: 2020-04-29 23:41:40
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-30 12:57:00
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const { getSingleBinnedResult, getSingleRawResult, CAT_VITAL_TYPE_ARRAY, SQLVitalTypeDict } = require("../db_relation/vitals-db-relation");
const { getSingleVitalCALCResult } = require("../db_relation/vitals-calc-relation");
const { getVitalsQueryV2 } = require("../db_apis/get-vitals-all-v2");

var timeLable = 0;

const SQL_CALC = (table_name, person_id) => `
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
FROM ${table_name}
WHERE PERSON_ID = ${person_id} AND VITAL_TYPE = 'TEMPERATURE_NUM'
ORDER BY START_TM`;

const SQL_GET_DICT = (vital_type = "temp") => `
SELECT 
  BIN_ID,
  LMT_ST, 
  LMT_END 
FROM DEF_VITALS_LMT
WHERE VITAL_TYPE = '${SQLVitalTypeDict[vital_type]}'`;

// const maxBinId = 152;
// const minBinId = 135
const SQL_BINNED = (table_name, person_id, minBinId, maxBinId) => `
SELECT
  START_TM,
  END_TM,
  BIN_ID,
  VAL
FROM ${table_name}
WHERE PERSON_ID = ${person_id} AND BIN_ID >= ${minBinId} AND BIN_ID <= ${maxBinId} 
ORDER BY START_TM`;

const CALC_TABLE_MAP = {
  "1D": `STAGING_VITALS_V500_CALC_1D`,
  "12H": `STAGING_VITALS_V500_CALC_12H`,
  "5H": `STAGING_VITALS_V500_CALC_5H`,
  "5M": `STAGING_VITALS_V500_CALC_5M`,
};

const BIN_TABLE_MAP = {
  "1D": `STAGING_VITALS_V500_BIN_1D`,
  "12H": `STAGING_VITALS_V500_BIN_12H`,
  "5H": `STAGING_VITALS_V500_BIN_5H`,
  "5M": `STAGING_VITALS_V500_BIN_5M`,
};

const RESOLUTION_MAP = {
  "1D": 86400,
  "12H": 43200,
  "5H": 18000,
  "5M": 300,
};

async function temperatureQuerySQLExecutor(conn, query) {
  let timestamp = timeLable++;
  console.time("getTemp" + timestamp);

  let ret = null;
  let timeInterval = RESOLUTION_MAP[query.data_resolution];

  if (query.data_type === "calc") {
    // calc
    let sqlCalc = SQL_CALC(CALC_TABLE_MAP[query.data_resolution], query.person_id);
    console.log("sqlCalc = ", sqlCalc);
    let calcRecords = await conn.execute(sqlCalc);
    if (calcRecords) {
      ret = _calcRecords(calcRecords.rows, timeInterval);
    }
  } else {
    // binned
    let sqlDict = SQL_GET_DICT("temp");
    console.log("sqlDict = ", sqlDict);
    let dictRecord = await conn.execute(sqlDict);
    if (!dictRecord) {
      return "Error! no DEF_VITALS_LMT records";
    }
    let [minBinId, maxBinId, dictResult] = getMinMaxBinId(dictRecord);

    let sqlBinned = SQL_BINNED(BIN_TABLE_MAP[query.data_resolution], query.person_id, minBinId, maxBinId);
    console.log("sqlBinned = ", sqlBinned);
    let binnedRecords = await conn.execute(sqlBinned);
    if (binnedRecords) {
      ret = _binRecords(binnedRecords.rows, timeInterval, dictResult);
    }
  }

  console.timeEnd("getTemp" + timestamp);
  return ret;
}

const _calcRecords = (rows, timeInterval) => {
  let result = [];
  console.log("Temperature Calc record size :", rows.length);
  if (rows.length < 1) {
    return [];
  }
  for (let row of rows) {
    //example row = {"START_TM": "1524657600", "END_TM": "1524700800", "VAL_MIN": "108"...}
    // if timeString is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
    if (row.END_TM * 1 - row.START_TM * 1 != timeInterval) {
      console.log("timeInterval Error for " + timeInterval + " with " + row.START_TM + ", " + row.END_TM);
    }

    // start_time was sorted when sql query done.
    // at each start time (for a personid and a VITAL_TYPE), there is only one record
    let singleResult = getSingleVitalCALCResult(row);
    result.push(singleResult);
  }
  return result;
};

const _binRecords = (rows, timeInterval, dictResult) => {
  let result = [dictResult];

  if (rows.length < 1) {
    return [];
  }
  let currentStartTM = 0;
  for (let row of rows) {
    //example row = {"START_TM": "1524657600", "END_TM": "1524700800", "BIN_ID": "9", "VAL": 9}

    // if timeInterval is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
    if (row.END_TM * 1 - row.START_TM * 1 != timeInterval) {
      console.warn("binned timeInterval Error for " + timeInterval + " with " + row.START_TM + ", " + row.END_TM);
      console.log("row.START_TM :", row.START_TM);
      console.log("timeInterval :", timeInterval);
    }

    // start_time was sorted when sql query done.
    // for a currentStartTM same with last record, add all bin_id to this singleResult
    // for a new currentStartTM, create a new binDict with timestamp and binString with default value "0"
    var singleResult;
    if (currentStartTM != row.START_TM) {
      if (currentStartTM != 0) {
        result.push(singleResult);
      } else {
        // the first record
        // console.log("start pushing into array...");
      }
      currentStartTM = row.START_TM;
      singleResult = getSingleBinnedResult("temp", dictResult, currentStartTM, currentStartTM + timeInterval);
      // console.log("singleResult = ", singleResult);
    }

    // getBinString convert bin_id "8" to "100-110"
    // at the same record, same BIN_ID only has one VAL
    singleResult[row.BIN_ID] = row.VAL;
  }

  // last item
  if (result[result.length - 1] != singleResult) {
    result.push(singleResult);
  }
  return result;
};

const getMinMaxBinId = (dictRecord) => {
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
};

const getTemperature = database.withConnection(async function (conn, query) {
  console.log("getTemperature: query = ", query);
  query.person_id = Number(query.person_id);

  if (query.data_type === "raw") {
    let currentTime = new Date().getTime() / 1000;
    let year2000Time = 946684800;
    if (query.from == null || query.from > currentTime + 10 || query.from < year2000Time) {
      throw new InputInvalidError('Timestamp "from" is not valid');
    } else if (query.to == null || query.to < query.from) {
      throw new InputInvalidError('Timestamp "to" is not valid');
    } else if (query.to > currentTime + 10) {
      query.to = currentTime;
    }
    query.vital_type = "temp";
    return await getVitalsQueryV2(query);
  }
  if (query.data_type !== "calc" && query.data_type !== "binned") {
    console.log("query.data_type :>> ", query.data_type);
    return "data_type must be 'calc' or 'binned'";
  }
  if (query.data_resolution !== "12H" && query.data_resolution !== "1D" && query.data_resolution !== "5H" && query.data_resolution !== "5M") {
    return "data_resolution must be '1D', '12H', '5H', or '5M'";
  }
  return await temperatureQuerySQLExecutor(conn, query);
});

module.exports = {
  getTemperature,
};
