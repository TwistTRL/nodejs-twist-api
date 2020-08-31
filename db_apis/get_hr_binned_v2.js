#!/usr/bin/env node

/**
 * API FUNCTIONS FOR GETTING HEARTRATE
 * 
 * PENG 
 * 12/4/19
 * 
 */

const database = require("../services/database");
const {getSingleHrResult} = require("../db_relation/hr-bin-config-v2");
var assert = require('assert');

// get header dict information from DEF_VITALS_LMT
const SQL_GET_DICT = `
SELECT 
  BIN_ID, 
  LMT_ST, 
  LMT_END 
FROM DEF_VITALS_LMT
WHERE VITAL_TYPE = 'HR_EKG'
`

const SQL_PART1 = `
SELECT 
  START_TM,
  END_TM,
  BIN_ID,
  VAL
FROM `

const SQL_PART2 = `
WHERE PERSON_ID = :person_id AND BIN_ID > 0 AND BIN_ID < 29
ORDER BY START_TM, BIN_ID
`

async function getHr12HSqlExecutor(conn,binds){
  console.time('getHr');

  let dictRecord = await conn.execute(SQL_GET_DICT);
  let dictResult = {};
  var arr = dictRecord.rows;
  for (let row of arr) {
    dictResult[row.BIN_ID] = [row.LMT_ST, row.LMT_END];
  }

  let SQL_GET_HR = SQL_PART1+`VITALS_BIN_12H`+SQL_PART2;
  console.log("SQL_GET_HR = ", SQL_GET_HR);

  let hrRecords = await conn.execute(SQL_GET_HR,binds);
    
  let jsonString = calculateRecords(dictResult, hrRecords, "12H");
  console.timeEnd('getHr');
  return jsonString;
}

async function getHr5HSqlExecutor(conn,binds){
  console.time('getHr');

  let dictRecord = await conn.execute(SQL_GET_DICT);
  let dictResult = {};
  var arr = dictRecord.rows;
  for (let row of arr) {
    dictResult[row.BIN_ID] = [row.LMT_ST, row.LMT_END];
  }

  let hrRecords = await conn.execute(SQL_PART1+`VITALS_BIN_5H`+SQL_PART2,binds);  
  let jsonString = calculateRecords(dictResult, hrRecords, "5H");
  console.timeEnd('getHr');
  return jsonString;
}

async function getHr1DSqlExecutor(conn,binds){
  console.time('getHr');

  let dictRecord = await conn.execute(SQL_GET_DICT);
  let dictResult = {};
  var arr = dictRecord.rows;
  for (let row of arr) {
    dictResult[row.BIN_ID] = [row.LMT_ST, row.LMT_END];
  }

  let SQL_GET_HR = SQL_PART1+`VITALS_BIN_1D`+SQL_PART2;
  console.log("SQL_GET_HR = ", SQL_GET_HR);

  let hrRecords = await conn.execute(SQL_GET_HR,binds);  
  let jsonString = calculateRecords(dictResult, hrRecords, "1D");
  console.timeEnd('getHr');
  return jsonString;
}

async function getHr5MSqlExecutor(conn,binds){
  console.time('getHr');

  let dictRecord = await conn.execute(SQL_GET_DICT);
  let dictResult = {};
  var arr = dictRecord.rows;
  for (let row of arr) {
    dictResult[row.BIN_ID] = [row.LMT_ST, row.LMT_END];
  }

  let hrRecords = await conn.execute(SQL_PART1+`VITALS_BIN_5M`+SQL_PART2,binds);  
  let jsonString = calculateRecords(dictResult, hrRecords, "5M");
  console.timeEnd('getHr');
  return jsonString;
}

function calculateRecords(dictResult, hrRecords, timeString) {
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

  // hrRecords = {"metadata":[], "rows":[]}
  var arr = hrRecords.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  var currentStartTM = 0;
  for (let hrRecord of arr) {
    //example hrRecord = {"START_TM": "1524657600", "END_TM": "1524700800", "BIN_ID": "9", "VAL": 9}

    // if timeString is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
    assert(hrRecord.END_TM*1 - hrRecord.START_TM*1 == timeInterval);

    // start_time was sorted when sql query done.
    // for a currentStartTM same with last record, add all bin_id to this singleResult
    // for a new currentStartTM, create a new binDict with timestamp and binString with default value "0"
    var singleResult;
    if (currentStartTM != hrRecord.START_TM) {

      if (currentStartTM != 0) {
        result.push(singleResult);
      } else {
        // the first record
        console.log("start pushing into heart rate array...");
      }
      currentStartTM = hrRecord.START_TM;
      singleResult = getSingleHrResult(dictResult, currentStartTM, (currentStartTM * 1 + timeInterval) + "");
      // console.log("singleResult = ", singleResult);
    }

    // getBinString convert bin_id "8" to "100-110"
    // at the same record, same BIN_ID only has one VAL
    singleResult[hrRecord.BIN_ID] = hrRecord.VAL;
  }

  // last item
  if (result[result.length - 1] != singleResult) {
    result.push(singleResult);
  }

  return result;
}

const getHr12Hv2 = database.withConnection(getHr12HSqlExecutor);
const getHr5Hv2 = database.withConnection(getHr5HSqlExecutor);
const getHr1Dv2 = database.withConnection(getHr1DSqlExecutor);
const getHr5Mv2 = database.withConnection(getHr5MSqlExecutor);


/**
 * 
 * [
      {
        "0-30": VAL
        "30-40": VAL
        ...
        "290": VAL
        from: START_TM
        to: END_TM
      },
      {
        ...
      },
      ...
 *  ]
 */


module.exports = {
  getHr12Hv2,
  getHr5Hv2,
  getHr1Dv2,
  getHr5Mv2
};