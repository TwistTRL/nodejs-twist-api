/*
 * @Author: Peng 
 * @Date: 2020-01-29 08:32:39 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-03 15:37:51
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const {
  EVENT_CD_DICT,
  SL_TO_LABEL,
  SL_TO_SUBCAT,
  SL_TO_CAT,
  SL_TO_CALCS,
  IN_OUT_COLOR_MAP,
  CAT_CAP_TO_LOWER_MAP,
} = require("../db_relation/in-out-db-relation");

const PERSON_ID = "person_id";
const FROM = "from";
const TO = "to";
const RESOLUTION = "resolution";
var timeLable = 0;

// get raw in-out by event between two timestamp
const SQL_GET_IN_OUT_EVENT_PART1 = `
SELECT  
  DT_UNIX,
  EVENT_CD,
  IO_CALCS,
  VALUE
FROM INTAKE_OUTPUT
WHERE PERSON_ID = `
const SQL_GET_IN_OUT_EVENT_PART2 = `
AND DT_UNIX >= `
const SQL_GET_IN_OUT_EVENT_PART3 = ` AND DT_UNIX <= `
const SQL_GET_IN_OUT_EVENT_PART4 = ` 
ORDER BY DT_UNIX
`

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

async function inOutEventTooltipQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;

  let SQL_GET_IN_OUT_EVENT = SQL_GET_IN_OUT_EVENT_PART1 + query[PERSON_ID] + SQL_GET_IN_OUT_EVENT_PART2 + query[FROM] * 1 +
    SQL_GET_IN_OUT_EVENT_PART3 + query[TO] * 1 + SQL_GET_IN_OUT_EVENT_PART4;
  console.log("SQL for in-out Event: ", SQL_GET_IN_OUT_EVENT);
  console.time('getInOutEvent-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_EVENT);
  console.timeEnd('getInOutEvent-sql' + timestampLable);
  return rawRecord.rows;
}


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

function _calculateRawRecords(rawRecords, timeInterval, startTime, endTime) {
  // result will be [type1Dict, type2Dict], first item is "in" and second is "out".
  let type1Dict = {};
  let type2Dict = {};

  let {
    arr1,
    arr2,
  } = rawRecords;

  if (arr1 && arr1.length) {
    console.log("In-Out Event record size :", arr1.length);
    let countNull = 0;
    let currentTime = Math.floor(arr1[0].DT_UNIX / timeInterval) * timeInterval;


    for (let row of arr1) {
      //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "IO_CALCS": 1, "VALUE": 0.9}

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      //if current DISPLAY_IO != '1', or IO_CALCS == 0, skip it
      if (EVENT_CD_DICT[row.EVENT_CD].DISPLAY_IO != '1' || row.IO_CALCS == 0) {
        continue;
      }

      if (row.VALUE == null) {
        countNull++;
      }

      if (currentTime + timeInterval <= row.DT_UNIX) {
        // this row record has different time zone with currentTime, setting new currentTime
        currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
      }

      if (row.IO_CALCS == '1') {
        type1Dict = _updateRowToDict(currentTime, row, type1Dict);
      } else if (row.IO_CALCS == '2') {
        type2Dict = _updateRowToDict(currentTime, row, type2Dict);
      } else {
        console.log("Error IO_CALCS");
      }
    }
    console.log("null value number for In-Out Event records: ", countNull);
  }

  //example arr2 = {
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

  if (arr2 && arr2.length) {
    console.log("In-Out Diluents record size :", arr2.length);
    for (let row of arr2) {
      //example row = {"START_UNIX": 1524700800, "END_UNIX": "1524736800", "DRUG": "drug", "DILUENT": "aaa", "INFUSION_RATE": 0.9 .... }
      //(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES

      // console.log("row: ", row);
      let currentTime = Math.floor(Math.max(row.START_UNIX, startTime) / timeInterval) * timeInterval;

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      let zoneNumber = Math.floor((Math.min(row.END_UNIX, endTime) - currentTime) / timeInterval) + 1;
      for (let i = 0; i < zoneNumber; i++) {
        let value = 0;
        let calTime = currentTime + i * timeInterval;

        if (i == 0) {
          value = (Math.min(currentTime + timeInterval, row.END_UNIX) - Math.max(startTime, row.START_UNIX)) * row.INFUSION_RATE / 3600; 
        } else if (i == zoneNumber - 1) {
          value = Math.min((row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1)), timeInterval) * row.INFUSION_RATE / 3600;        
        } else {
          value = timeInterval * row.INFUSION_RATE / 3600;     
        }

        if (value < 0) {
          console.log("error value < 0: ", value);
        }
        
        let singleResult = {};
        singleResult.value = value;
        singleResult.drug = row.DRUG;
        singleResult.diluent = row.DILUENT;
        singleResult.rate = row.INFUSION_RATE;
        singleResult.unit = row.INFUSION_RATE_UNITS;
        singleResult.conc = row.CONC;
        singleResult.strength_unit = row.STRENGTH_UNIT;
        singleResult.vol_unit = row.VOL_UNIT;
        singleResult.location = "not ready";

        let typeFlush = (row.DRUG == 'papavarine' || row.DRUG == 'heparin flush') ? 1 : 0;
        if (!(calTime in type1Dict)) {
          type1Dict[calTime] = {};
        } 
          
        if (typeFlush) {
          // Flushes cat
          if (!type1Dict[calTime].Flushes){
            type1Dict[calTime].Flushes = {"acc_value": 0, "drugs": []};
          }
          type1Dict[calTime].Flushes.drugs.push(singleResult);
          type1Dict[calTime].Flushes.acc_value += value;
        } else {
          // Infusions cat
          if (!type1Dict[calTime].Infusions){
            type1Dict[calTime].Infusions = {"acc_value": 0, "drugs": []};
          }
          type1Dict[calTime].Infusions.drugs.push(singleResult);
          type1Dict[calTime].Infusions.acc_value += value;
        }        
      }
    }
  }

  // console.log('type1Dict :', type1Dict);

  return [type1Dict, type2Dict];
}

function _updateRowToDict(currentTime, row, dict) { 
  let newValue = row.IO_CALCS == '2' ? -1 * row.VALUE : row.VALUE;
  let newCat = EVENT_CD_DICT[row.EVENT_CD].IO_CAT;
  let newShortLabel = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;

  if (!(currentTime in dict)) {
    dict[currentTime] = {};
  } 
  if (!(newCat in dict[currentTime])) {
    dict[currentTime][newCat] = {"acc_value": 0};
  }
  dict[currentTime][newCat].acc_value += newValue;

  if (newShortLabel in dict[currentTime][newCat]) {
    dict[currentTime][newCat][newShortLabel].value += newValue;

  } else {
    let singleResult = {};
    singleResult.value = newValue;
    singleResult.sub_cat = EVENT_CD_DICT[row.EVENT_CD].Subcat;
    singleResult.label = EVENT_CD_DICT[row.EVENT_CD].LABEL;
    singleResult.short_label = newShortLabel;
    
    dict[currentTime][newCat][newShortLabel] = singleResult;
  }    
  return dict;
}

async function parallelQuery(conn, new_query) {

  // should parallel do the sql query
  const task1 = await inOutEventTooltipQuerySQLExecutor(conn, new_query);
  const task2 = await inOutDiluentsTooltipQuerySQLExecutor(conn, new_query);

  return {
    arr1: await task1,
    arr2: await task2,
  }
}


/**
 * query:
 * {
    "person_id": 11111111,
    "from":3600,   //optional
    "to":7200,     //optional
    "resolution":3600    //optional
}

 * @param {*} conn 
 * @param {*} query 
 */
const getInOutTooltipQueryV3 = database.withConnection(async function (conn, query) {
  let new_query = {
    person_id: query.person_id,
    from: query.from || 0,
    // "to" default value is Math.ceil of timestamp of now to query.resolution 
    to: query.to || Math.ceil(new Date().getTime() / (1000 * query.resolution)) * query.resolution,
    resolution: query.resolution || 3600
  }
  console.log("query = ", new_query);

  if (!isValidJson.validate_inout(new_query)) {
    console.warn(new_query + " : not json");
    throw new InputInvalidError('Input not in valid json');
  }

  if (new_query.from > new_query.to) {
    throw new InputInvalidError('start time must >= end time');
  }
  if (new_query.resolution <= 0 || new_query.resolution % 3600 != 0) {
    throw new InputInvalidError('"resolution" must be 3600 * n (n ∈ N)');
  }
  if (new_query.from % new_query.resolution != 0 || new_query.to % new_query.resolution) {
    throw new InputInvalidError('"from" and "to" should be divisible by "resolution"');
  }

  let consoleTimeCount = timeLable++;
  console.time('getInOutTooltip' + consoleTimeCount);
  let rawResult = await parallelQuery(conn, new_query);
  let result = _calculateRawRecords(rawResult, new_query[RESOLUTION], new_query[FROM], new_query[TO]);
  console.timeEnd('getInOutTooltip' + consoleTimeCount); 
  return result;
});

module.exports = {
  getInOutTooltipQueryV3
};

