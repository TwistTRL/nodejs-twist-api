/*
 * @Author: Peng 
 * @Date: 2020-01-27 09:44:23 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-01-27 11:07:02
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;

const PERSON_ID = "person_id";
const FROM = "from";
const TO = "to";
const RESOLUTION = "resolution";
var timeLable = 0;

// get raw in-out by FLUSHES and INFUSIONS between two timestamp
//(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES
// others: INFUSIONS
// SEND: mL in each bin (calculated from rate), drug, diluent, conc, stength_unit,vol_unit, infusion_rate, infusion_rate_units, [admin site,]

//  ADMIN_SITE not avaelable
const SQL_GET_IN_OUT_DILUENTS_PART1 = `
SELECT  
  START_UNIX,
  END_UNIX,
  DRUG,
  DILUENT,
  CONC,
  STRENGTH_UNIT,
  VOL_UNIT,
  INFUSION_RATE,
  INFUSION_RATE_UNITS
FROM DRUG_DILUENTS
WHERE PERSON_ID = `
const SQL_GET_IN_OUT_DILUENTS_PART2 = ` 
ORDER BY START_UNIX`

async function inOutDiluentsTooltipQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;

  let SQL_GET_IN_OUT_DILUENTS = SQL_GET_IN_OUT_DILUENTS_PART1 + query[PERSON_ID] +
    ` 
    AND ((START_UNIX < ` + query[FROM] + ` AND END_UNIX > ` + query[FROM] + `)
    OR (START_UNIX >= ` + query[FROM] + ` AND END_UNIX <= ` + query[TO] + ` )
    OR (START_UNIX < ` + query[TO] + ` AND END_UNIX >  ` + query[TO] + `))` +
    SQL_GET_IN_OUT_DILUENTS_PART2;
  console.log("SQL for in-out Diluents: ", SQL_GET_IN_OUT_DILUENTS);
  console.time('getInOutDiluents-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_DILUENTS);
  console.timeEnd('getInOutDiluents-sql' + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(arr, timeInterval, startTime, endTime) {
  let resultEvent = [];  

  //example arr = {
  // START_UNIX,
  // END_UNIX,
  // DRUG,
  // DILUENT,
  // CONC,
  // STRENGTH_UNIT,
  // VOL_UNIT,
  // INFUSION_RATE,
  // INFUSION_RATE_UNITS,
  // ADMIN_SITE}

  console.log('arr[0].START_UNIX :', arr[0].START_UNIX);
  console.log('startTime :', startTime);
  
  if (arr && arr.length) {
    console.log("In-Out Diluents record size :", arr.length);
    let timeDict = {};

    for (let row of arr) {
      //example row = {"START_UNIX": 1524700800, "END_UNIX": "1524736800", "DRUG": "drug", "DILUENT": "aaa", "INFUSION_RATE": 0.9 .... }
      //(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES
      let currentTime = Math.floor(Math.max(row.START_UNIX, startTime) / timeInterval) * timeInterval;
      let zoneNumber = Math.floor((Math.min(row.END_UNIX, endTime) - currentTime) / timeInterval) + 1;
      for (let i = 0; i < zoneNumber; i++) {
        let value = 0;
        let calTime = currentTime + i * timeInterval;
        if (i == 0) {
          value = (Math.min(currentTime + timeInterval, row.END_UNIX) - row.START_UNIX) * row.INFUSION_RATE / 3600;
        } else if (i == zoneNumber - 1) {
          value = (row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1)) * row.INFUSION_RATE / 3600;
        } else {
          value = timeInterval * row.INFUSION_RATE / 3600;
        }

        if (value < 0) {
          console.log("error value < 0: ", value);
        }

        let typeFlush = (row.DRUG == 'papavarine' || row.DRUG == 'heparin flush') ? 1 : 0;
        if (calTime in timeDict) {

          if (typeFlush) {
            if (timeDict[calTime].Flushes) {
              timeDict[calTime].Flushes.value += value;
              if (!timeDict[calTime].Flushes.drug.includes(row.DRUG)) {
                timeDict[calTime].Flushes.drug.push(row.DRUG);
              }
            } else {
              let singleResult = {};
              singleResult.value = value;
              singleResult.drug = [row.DRUG];
              singleResult.diluent = row.DILUENT;
              singleResult.rate = row.INFUSION_RATE;
              singleResult.unit = row.INFUSION_RATE_UNITS;
              singleResult.conc = row.CONC;
              singleResult.strength_unit = row.STRENGTH_UNIT;
              singleResult.vol_unit = row.VOL_UNIT;    
              timeDict[calTime].Flushes = singleResult;
            }
          } else {
            if (timeDict[calTime].Infusions) {
              timeDict[calTime].Infusions.value += value;
              if (!timeDict[calTime].Infusions.drug.includes(row.DRUG)) {
                timeDict[calTime].Infusions.drug.push(row.DRUG);
              }
            } else {
              let singleResult = {};
              singleResult.value = value;
              singleResult.drug = [row.DRUG];
              singleResult.diluent = row.DILUENT;
              singleResult.rate = row.INFUSION_RATE;
              singleResult.unit = row.INFUSION_RATE_UNITS;
              singleResult.conc = row.CONC;
              singleResult.strength_unit = row.STRENGTH_UNIT;
              singleResult.vol_unit = row.VOL_UNIT;    
              timeDict[calTime].Infusions = singleResult;
            }
          }   

        } else {
          timeDict[calTime] = {};  

          let singleResult = {};
          singleResult.value = value;
          singleResult.drug = [row.DRUG];
          singleResult.diluent = row.DILUENT;
          singleResult.rate = row.INFUSION_RATE;
          singleResult.unit = row.INFUSION_RATE_UNITS;
          singleResult.conc = row.CONC;
          singleResult.strength_unit = row.STRENGTH_UNIT;
          singleResult.vol_unit = row.VOL_UNIT;    

          if (typeFlush) {            
            timeDict[calTime].Flushes = singleResult;
          } else {
            timeDict[calTime].Infusions = singleResult;
          }
        }
      }
    }

    return timeDict;
  }
}

/**
 * query:
 * {
    "person_id": 11111111,
    "from":2222,   //optional
    "to":3344,     //optional
    "resolution":3600    //optional
}

 * @param {*} conn 
 * @param {*} query 
 */
const getInOutTooltipQuery = database.withConnection(async function (conn, query) {
  console.log("query = ", query);

  if (!isValidJson.validate_inout(query)) {
    console.warn(query + " : not json");
    throw new InputInvalidError('Input not in valid json');
  }

  // todo: cut from to hour
  let new_query = {
    person_id: query.person_id,
    from: query.from || 0,
    to: query.to || new Date().getTime() / 1000,
    resolution: query.resolution || 3600
  }

  if (new_query.from > new_query.to) {
    throw new InputInvalidError('start time must >= end time');
  }
  if (new_query.resolution <= 0) {
    throw new InputInvalidError('"resolution" must be >= 3600');
  }
  if (new_query.resolution % 3600 != 0) {
    throw new InputInvalidError('"resolution" must be 3600 * n (n ∈ N)');
  }
  if (new_query.from % new_query.resolution != 0) {
    throw new InputInvalidError('"from" should be divisible by "resolution"');
  }

  let consoleTimeCount = timeLable++;
  console.time('getInOut' + consoleTimeCount);
  let rawResult = await inOutDiluentsTooltipQuerySQLExecutor(conn, new_query);
  console.timeEnd('getInOut' + consoleTimeCount);
  return _calculateRawRecords(rawResult, query[RESOLUTION], query[FROM], query[TO]);
});

module.exports = {
  getInOutTooltipQuery
};