#!/usr/bin/env node

/**
 * API FUNCTIONS FOR GETTING RAW HEARTRATE DATA DURING TIME
 * 
 * PENG 
 * 12/5/19
 * 
 */

const database = require("../services/database");
const {getSingleRawHr} = require("../config/hr-raw-config");
var assert = require('assert');

// get raw hr between two timestamp
const SQL_GET_RAW_HR = `
SELECT
 HR_EKG,
 DTUNIX
FROM VITALS
WHERE PERSON_ID = :person_id AND DTUNIX > :from_ AND DTUNIX < :to_
ORDER BY DTUNIX
`

async function getRawHrSqlExecutor(conn,binds){
  console.time('getRawHr');
  let rawRecord = await conn.execute(SQL_GET_RAW_HR, binds);  
  let jsonString = calculateRecords(rawRecord);
  console.timeEnd('getRawHr');
  return jsonString;
}

function calculateRecords(rawRecord) {
  var result = [];
  
  // rawRecord = {"metadata":[], "rows":[]}
  var arr = rawRecord.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  for (let singleHr of arr) {
    //example singleHr = {"HR_EKG": 100, "DTUNIX": "1524700800"}

    let singleResult = getSingleRawHr();
    singleResult.time = singleHr.DTUNIX;
    singleResult.value = singleHr.HR_EKG;
    result.push(singleResult);   
  }
  return result;
}

const getRawHr = database.withConnection(getRawHrSqlExecutor);

/**
 * 
 * [
      {
        time: unix_time in seconds
        value: HR_EKG
      }
 * ]
 */


module.exports = {
  getRawHr
};