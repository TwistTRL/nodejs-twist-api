#!/usr/bin/env node

/**
 * API FUNCTIONS FOR GETTING HEARTRATE
 * 
 * PENG 
 * 12/4/19
 * 
 */

const database = require("../services/database");
const {getSingleHrCALCResult} = require("../config/hr-calc-config");

const SQL_PART1 = `
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

const SQL_PART2 = `
WHERE PERSON_ID = :person_id AND VITAL_TYPE = 'HR_EKG'
ORDER BY START_TM
`

async function getHr12HCalcSqlExecutor(conn,binds){
  console.time('getHrCalc');

  let hrRecords = await conn.execute(SQL_PART1 + `STAGING_NEW_VITALS_CALC_12H` + SQL_PART2,binds);
    
  let jsonString = calculateRecords(hrRecords, "12H");
  console.timeEnd('getHrCalc');
  return jsonString;
}

async function getHr5HCalcSqlExecutor(conn,binds){
  console.time('getHrCalc');

  let hrRecords = await conn.execute(SQL_PART1 + `STAGING_NEW_VITALS_CALC_5H` + SQL_PART2,binds);
  let jsonString = calculateRecords(hrRecords, "5H");
  console.timeEnd('getHrCalc');
  return jsonString;
}

async function getHr1DCalcSqlExecutor(conn,binds){
  console.time('getHrCalc');

  let hrRecords = await conn.execute(SQL_PART1 + `STAGING_NEW_VITALS_CALC_1D` + SQL_PART2,binds);
  let jsonString = calculateRecords(hrRecords, "1D");
  console.timeEnd('getHrCalc');
  return jsonString;
}

async function getHr5MCalcSqlExecutor(conn,binds){
  console.time('getHrCalc');

  let hrRecords = await conn.execute(SQL_PART1 + `STAGING_NEW_VITALS_CALC_5M` + SQL_PART2,binds);
  let jsonString = calculateRecords(hrRecords, "5M");
  console.timeEnd('getHrCalc');
  return jsonString;
}

function calculateRecords(hrRecords, timeString) {
  var result = [];
  var timeInterval;

  // just for doublecheck START_TM and END_TM
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

  for (let hrRecord of arr) {
    //example hrRecord = {"START_TM": "1524657600", "END_TM": "1524700800", "VAL_MIN": "108"...}

    // if timeString is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
    if (hrRecord.END_TM*1 - hrRecord.START_TM*1 != timeInterval) {
      console.log("Error for " + timeString + " with " + hrRecord.START_TM + ", " + hrRecord.END_TM);
    }

    // start_time was sorted when sql query done.
    // at each start time (for a personid and a VITAL_TYPE), there is only one record

    singleResult = getSingleHrCALCResult(hrRecord);
    result.push(singleResult);
  }

  return result;
}

const getHrCalc12H = database.withConnection(getHr12HCalcSqlExecutor);
const getHrCalc5H = database.withConnection(getHr5HCalcSqlExecutor);
const getHrCalc1D = database.withConnection(getHr1DCalcSqlExecutor);
const getHrCalc5M = database.withConnection(getHr5MCalcSqlExecutor);


/**
 * 
 * [
      {
        perc0: VAL_MIN,
        perc25: VAL_PERC25,
        ...
        perc100: VAL_MAX,
        time: mean unix_time of START_TM and END_TM
      },
      {
        ...
      },
      ...
    ]
 *
 */


module.exports = {
  getHrCalc12H,
  getHrCalc5H,
  getHrCalc1D,
  getHrCalc5M
};