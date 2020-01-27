/*
 * @Author: Peng 
 * @Date: 2020-01-21 10:12:26 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-01-27 10:57:52
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


async function inOutEventQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;

  let SQL_GET_IN_OUT_EVENT = SQL_GET_IN_OUT_EVENT_PART1 + query[PERSON_ID] + SQL_GET_IN_OUT_EVENT_PART2 + query[FROM] * 1 +
    SQL_GET_IN_OUT_EVENT_PART3 + query[TO] * 1 + SQL_GET_IN_OUT_EVENT_PART4;
  console.log("SQL for in-out Event: ", SQL_GET_IN_OUT_EVENT);
  console.time('getInOutEvent-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_EVENT);
  console.timeEnd('getInOutEvent-sql' + timestampLable);
  return rawRecord.rows;

  // let jsonString = _calculateRawRecords(rawRecord, query[RESOLUTION]);
  // return jsonString;
}



async function inOutDiluentsQuerySQLExecutor(conn, query) {
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
  let {
    arr1,
    arr2,
  } = rawRecords;

  let resultEvent = [];
  // let resultFlush = [];
  // let resultDrips = [];


  if (arr1 && arr1.length) {
    console.log("In-Out Event record size :", arr1.length);
    let countNull = 0;
    let currentSameTimeArray = [];
    let currentTime = Math.floor(arr1[0].DT_UNIX / timeInterval) * timeInterval;

    for (let row of arr1) {
      //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "IO_CALCS": 1, "VALUE": 0.9}

      //if current DISPLAY_IO != '1', skip it
      if (EVENT_CD_DICT[row.EVENT_CD].DISPLAY_IO != '1') {
        continue;
      }

      if (row.VALUE == null) {
        countNull++;
      }

      if (row.IO_CALCS != 0 && row.IO_CALCS != 1 && row.IO_CALCS != 2) {
        console.log("row.IO_CALCS error");
        continue;
      }

      //if current SHORT_LABEL == '', and if timeInterval == 3600 (seconds in 1 hour), push it directly to resultEvent 
      row.SHORT_LABEL = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;
      if (row.SHORT_LABEL == '' && timeInterval == 3600 && row.VALUE) {
        let singleType0Result = {};
        singleType0Result.value = row.VALUE;
        singleType0Result.cat = EVENT_CD_DICT[row.EVENT_CD].IO_CAT;
        singleType0Result.sub_cat = EVENT_CD_DICT[row.EVENT_CD].Subcat;
        singleType0Result.label = EVENT_CD_DICT[row.EVENT_CD].LABEL;
        singleType0Result.short_label = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;
        singleType0Result.color = "#fafafa";
        singleType0Result.time = currentTime;
        singleType0Result.type = row.IO_CALCS;
        resultEvent.push(singleType0Result);
        continue;
      }

      // first item or new array
      if (currentSameTimeArray.length == 0) {
        currentSameTimeArray.push(row);
        currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
        continue;
      }

      // if same time with previous record, combine to category
      if (currentTime + timeInterval > row.DT_UNIX) {
        currentSameTimeArray.push(row);
        continue;
      }

      // if not same time, push the calculated previous array and start with this new one
      let combinedSameTimeArray = handelSameTimeArray(currentSameTimeArray, currentTime, timeInterval);
      resultEvent.push(...combinedSameTimeArray);
      currentSameTimeArray = [];
      currentSameTimeArray.push(row);
      currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
    }

    if (currentSameTimeArray.length != 0) {
      let combinedSameTimeArray = handelSameTimeArray(currentSameTimeArray, currentTime, timeInterval);
      resultEvent.push(...combinedSameTimeArray);
    }
    console.log("null value number for In-Out Event records: ", countNull);
  }

  //example arr2[indexArr2] = {
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
    let timeFlushDict = {};
    let timeDripsDict = {};

    for (let row of arr2) {
      //example row = {"START_UNIX": 1524700800, "END_UNIX": "1524736800", "DRUG": "drug", "DILUENT": "aaa", "INFUSION_RATE": 0.9 .... }
      //(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES
      let currentTime = Math.floor(Math.max(row.START_UNIX, startTime) / timeInterval) * timeInterval;
      let zoneNumber = Math.floor((Math.min(row.END_UNIX, endTime) - currentTime) / timeInterval) + 1;
      for (let i = 0; i < zoneNumber; i++) {
        let singleResult = {};
        let value = 0;
        let cTime = currentTime + i * timeInterval;
        if (i == 0) {
          value = (Math.min(currentTime + timeInterval, row.END_UNIX) - row.START_UNIX) * row.INFUSION_RATE / 3600;
        } else if (i == zoneNumber - 1) {
          value = (row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1)) * row.INFUSION_RATE / 3600;
        } else {
          value = timeInterval * row.INFUSION_RATE / 3600;
        }

        if (value <= 0) {
          console.log("error value <= 0: ", value);
        }

        if (row.DRUG == 'papavarine' || row.DRUG == 'heparin flush') {
          // `Flushes`, write to timeFlushDict, key is start time of each binned time box
          // {1524700800: {singleResult}, ...}

          if (cTime in timeFlushDict) {
            timeFlushDict[cTime].value += value;
          } else {
            //FLUSHES	FLUSHES	FLUSH	FLUSH
            singleResult.value = value;
            singleResult.cat = "Flushes";
            singleResult.sub_cat = "Flushes";
            singleResult.label = "Flush";
            singleResult.short_label = "Flush";
            singleResult.color = IN_OUT_COLOR_MAP[singleResult.cat];
            singleResult.time = cTime;
            singleResult.type = "1";
            timeFlushDict[singleResult.time] = singleResult;
          }
        } else {
          // `Infusions`, write to timeDripsDict, key is start time of each binned time box

          if (cTime in timeDripsDict) {
            timeDripsDict[cTime].value += value;
          } else {
            //INFUSIONS	INFUSIONS	DRIPS	DRIPS
            singleResult.value = value;
            singleResult.cat = "Infusions";
            singleResult.sub_cat = "Infusions";
            singleResult.label = "Drips";
            singleResult.short_label = "Drips";
            singleResult.color = IN_OUT_COLOR_MAP[singleResult.cat];
            singleResult.time = cTime;
            singleResult.type = "1";
            timeDripsDict[singleResult.time] = singleResult;
          }
        }
      }
    }

    let resultFlush = Object.values(timeFlushDict);
    let resultDrips = Object.values(timeDripsDict);

    //unsorted array from Event, Flush, Drips
    let arr = [...resultEvent, ...resultFlush, ...resultDrips];
    arr.sort(function (a, b) {
      let keyA = a.time;
      let keyB = b.time;
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    return arr;
  }
}

/**
 * 
 * 
 * @param {*} array 
 * @param {*} timeOfArray 
 * @param {*} timeInterval timeInterval would be 3600 * n. if timeInterval === 3600, will return
 *                         record include short_label ==''. If timeInterval != 3600, won't return 
 *                         record include short_label ==''.
 */
function handelSameTimeArray(array, timeOfArray, timeInterval) {

  let dict = {};
  let resultSameTime = [];

  for (let row of array) {
    //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "IO_CALCS": 1, "VALUE": 0.9, "SHORT_LABEL": "VAC"}

    // todo, now combined with event cd
    // color not working

    let value;
    if (row.SHORT_LABEL in dict) {
      if (row.IO_CALCS == 2) {
        value = Math.abs(row.VALUE) * -1;
      } else {
        value = Math.abs(row.VALUE) * 1;
      }
      dict[row.SHORT_LABEL] += value;
    } else {
      if (row.IO_CALCS == 2) {
        value = Math.abs(row.VALUE) * -1;
      } else {
        value = Math.abs(row.VALUE) * 1;
      }
      dict[row.SHORT_LABEL] = value;
    }
  }

  // {"VAC": 0.9, "PIG1": 1.1}
  for (let key in dict) {
    // skip for (timeInterval != 3600 and short_label is empty)
    if ((timeInterval == 3600 || key != '') && dict[key]) {
      let singleResult = {};
      // console.log("key: ", key);
      singleResult.value = dict[key];
      singleResult.cat = CAT_CAP_TO_LOWER_MAP[SL_TO_CAT[key]];
      singleResult.sub_cat = SL_TO_SUBCAT[key];
      singleResult.label = SL_TO_LABEL[key];
      singleResult.short_label = key;
      singleResult.color = IN_OUT_COLOR_MAP[singleResult.cat] || "#fafafa";
      singleResult.time = timeOfArray;
      singleResult.type = SL_TO_CALCS[key];
      resultSameTime.push(singleResult);
    }
  }
  return resultSameTime;
}

async function parallelQuery(conn, new_query) {

  // should parallel do the sql query
  const task1 = await inOutEventQuerySQLExecutor(conn, new_query);
  const task2 = await inOutDiluentsQuerySQLExecutor(conn, new_query);

  return {
    arr1: await task1,
    arr2: await task2,
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
const getInOutQuery = database.withConnection(async function (conn, query) {
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
    throw new InputInvalidError('"resolution" should be divisible by 3600');
  }
  if (new_query.from % new_query.resolution != 0) {
    throw new InputInvalidError('"from" should be divisible by "resolution"');
  }

  let consoleTimeCount = timeLable++;
  console.time('getInOut' + consoleTimeCount);
  let rawResults = await parallelQuery(conn, new_query);
  console.timeEnd('getInOut' + consoleTimeCount);
  return _calculateRawRecords(rawResults, query[RESOLUTION], query[FROM], query[TO]);
});

module.exports = {
  getInOutQuery
};