/*
 * @Author: Peng 
 * @Date: 2020-02-05 16:33:06 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-18 16:43:32
 */


const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const {
  EVENT_CD_DICT,
  SL_ORDER_ARRAY,
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


const SQL_GET_WEIGHT_PART1 = `
SELECT
  DT_UNIX,
  WEIGHT
FROM WEIGHTS
WHERE PERSON_ID = `
const SQL_GET_WEIGHT_PART2 = ` 
ORDER BY DT_UNIX`


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

async function weightQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_WEIGHT = SQL_GET_WEIGHT_PART1 + query[PERSON_ID] + SQL_GET_WEIGHT_PART2;
  console.log("SQL for get weight: ", SQL_GET_WEIGHT);
  console.time('getWeight-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_WEIGHT);
  console.timeEnd('getWeight-sql' + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(rawRecords, timeInterval, startTime, endTime) {
  // result will be [type1Dict, type2Dict], first item is "in" and second is "out".
  let type1Dict = {};
  let type2Dict = {};

  let {
    arr1,
    arr2,
    weightArray,
  } = rawRecords;

  if (arr1 && arr1.length) {
    console.log("In-Out Event record size :", arr1.length);
    let countNull = 0;
    let currentTime = startTime;


    for (let row of arr1) {
      //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "VALUE": 0.9}
      let io_calcs = EVENT_CD_DICT[row.EVENT_CD].IO_CALCS;

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      //if current DISPLAY_IO != '1', or IO_CALCS == 0, skip it
      if (EVENT_CD_DICT[row.EVENT_CD].DISPLAY_IO != '1' || !io_calcs) {
        continue;
      }

      if (row.VALUE == null) {
        countNull++;
      }

      if (currentTime + timeInterval <= row.DT_UNIX) {
        // this row record has different time zone with currentTime, setting new currentTime
        currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
      }

      if (io_calcs == '1') {
        type1Dict = _updateRowToDict(currentTime, row, type1Dict, weightArray);
      } else if (io_calcs == '2') {
        type2Dict = _updateRowToDict(currentTime, row, type2Dict, weightArray);
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
      let currentTime = startTime;

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
          console.error("! value < 0: ", value);
          console.log('i :', i);
          console.log('zoneNumber :', zoneNumber);
          console.log('currentTime :', currentTime);
          console.log('startTime :', startTime);
          console.log('row.START_UNIX :', row.START_UNIX);
          console.log('row.END_UNIX :', row.END_UNIX);
          console.log('row.INFUSION_RATE :', row.INFUSION_RATE);

          console.log('Math.min(currentTime + timeInterval, row.END_UNIX) :', Math.min(currentTime + timeInterval, row.END_UNIX));
          console.log('Math.max(startTime, row.START_UNIX) :', Math.max(startTime, row.START_UNIX));

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
        singleResult.end_time = Math.min(row.END_UNIX, currentTime + timeInterval);

        if (!row.DRUG) {
          console.log('row :', row);
          continue;
        }

        // singleResult.location = "not ready";

        let typeFlush = (row.DRUG == 'papavarine' || row.DRUG == 'heparin flush') ? 1 : 0;
        if (!(calTime in type1Dict)) {
          let weightCalTime = getWeightOnTime(calTime, weightArray)
          type1Dict[calTime] = {"acc_value": 0, "weight": weightCalTime};
        }

        if (typeFlush) {
          // Flushes cat
          singleResult.location = "not ready";
          if (!type1Dict[calTime].Flushes) {
            type1Dict[calTime].Flushes = { "acc_value": 0, "drugs": [] };
            type1Dict[calTime].Flushes.drugs.push(singleResult);
          } else {

            let drugsArray = type1Dict[calTime].Flushes.drugs;
            let isMerged = false;

            for (let i = 0; i < drugsArray.length; i++) {
              if (drugsArray[i].drug == singleResult.drug
                && drugsArray[i].diluent == singleResult.diluent
                && drugsArray[i].location == singleResult.location) {

                type1Dict[calTime].Flushes.drugs[i].value += singleResult.value;
                if (singleResult.end_time >= type1Dict[calTime].Flushes.drugs[i].end_time) {
                  // updated to most recent rate
                  type1Dict[calTime].Flushes.drugs[i].end_time = singleResult.end_time;
                  type1Dict[calTime].Flushes.drugs[i].rate = singleResult.rate;
                  type1Dict[calTime].Flushes.drugs[i].unit = singleResult.unit;
                  type1Dict[calTime].Flushes.drugs[i].conc = singleResult.conc;
                  type1Dict[calTime].Flushes.drugs[i].strength_unit = singleResult.strength_unit;
                  type1Dict[calTime].Flushes.drugs[i].vol_unit = singleResult.vol_unit;
                }
                isMerged = true;
                break;
              }
            }

            if (!isMerged) {
              type1Dict[calTime].Flushes.drugs.push(singleResult);
            }
          }
          type1Dict[calTime].acc_value += value;
          type1Dict[calTime].Flushes.acc_value += value;

        } else {
          // Infusions cat
          if (!type1Dict[calTime].Infusions) {
            type1Dict[calTime].Infusions = { "acc_value": 0, "drugs": [] };
            type1Dict[calTime].Infusions.drugs.push(singleResult);
          } else {

            let drugsArray = type1Dict[calTime].Infusions.drugs;
            let isMerged = false;

            for (let i = 0; i < drugsArray.length; i++) {
              if (drugsArray[i].drug == singleResult.drug
                && drugsArray[i].diluent == singleResult.diluent) {

                type1Dict[calTime].Infusions.drugs[i].value += singleResult.value;
                if (singleResult.end_time >= type1Dict[calTime].Infusions.drugs[i].end_time) {
                  // updated to most recent rate
                  type1Dict[calTime].Infusions.drugs[i].end_time = singleResult.end_time;
                  type1Dict[calTime].Infusions.drugs[i].rate = singleResult.rate;
                  type1Dict[calTime].Infusions.drugs[i].unit = singleResult.unit;
                  type1Dict[calTime].Infusions.drugs[i].conc = singleResult.conc;
                  type1Dict[calTime].Infusions.drugs[i].strength_unit = singleResult.strength_unit;
                  type1Dict[calTime].Infusions.drugs[i].vol_unit = singleResult.vol_unit;
                }
                isMerged = true;
                break;
              }
            }

            if (!isMerged) {
              type1Dict[calTime].Infusions.drugs.push(singleResult);
            }
          }
          type1Dict[calTime].acc_value += value;
          type1Dict[calTime].Infusions.acc_value += value;
        }
      }
    }

    Object.values(type1Dict).forEach(elementTimestamp => {
      for (let [key, value] of Object.entries(elementTimestamp)) {
        if (key == "Infusions" || key == "Flushes") {
          if (value && value.drugs) {
            value.drugs.forEach(element => {
              delete element.end_time;              
            });
            value.drugs.sort((a, b) => b.rate - a.rate);
          }
        }
      }
    });    
  }
  // console.log('type1Dict :', type1Dict);
  return [type1Dict, type2Dict];
}

function _updateRowToDict(currentTime, row, dict, weightArray) {
  let io_calcs = EVENT_CD_DICT[row.EVENT_CD].IO_CALCS;
  let newValue = io_calcs == '2' ? -1 * row.VALUE : row.VALUE;
  let newCat = EVENT_CD_DICT[row.EVENT_CD].IO_CAT;
  let newShortLabel = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;

  if (!(currentTime in dict)) {
    let weightCurrentTime = getWeightOnTime(currentTime, weightArray)
    dict[currentTime] = {"acc_value": 0, "weight": weightCurrentTime};
  }
  if (!(newCat in dict[currentTime])) {
    dict[currentTime][newCat] = { "acc_value": 0, "short_labels": []};
  }
  dict[currentTime].acc_value += newValue;
  dict[currentTime][newCat].acc_value += newValue;

  let isNewSlInDict = false;
  for (let i = 0; i < dict[currentTime][newCat].short_labels.length; i++){
    if (dict[currentTime][newCat].short_labels[i].short_label == newShortLabel) {
      dict[currentTime][newCat].short_labels[i].value += newValue;
      isNewSlInDict = true;
      break;
    }
  }
  
  if (!isNewSlInDict){
    let singleResult = {};
    singleResult.short_label = newShortLabel;
    singleResult.value = newValue;
    singleResult.sub_cat = EVENT_CD_DICT[row.EVENT_CD].Subcat;
    singleResult.label = EVENT_CD_DICT[row.EVENT_CD].LABEL;
    if (dict[currentTime][newCat].short_labels.length == 0) {
      dict[currentTime][newCat].short_labels.push(singleResult);
    } else {
      dict[currentTime][newCat].short_labels.splice(binarySearch(dict[currentTime][newCat].short_labels, singleResult, comp), 0, singleResult)
    }
  }  
  return dict;
}

function getWeightOnTime(timestamp, weightArray) {
  let timeArr = weightArray.map(item => item.DT_UNIX);
  let index = getBinarySearchNearest(timestamp, timeArr);
  let roundWeight = Math.round((weightArray[index].WEIGHT + Number.EPSILON) * 1000) / 1000;
  return roundWeight;
}

function getBinarySearchNearest(num, arr) {
  if(!arr || !arr.length){
    return null;
  }

  if(arr.length == 1) {
    return 0;
  }

  let mid = Math.floor((arr.length - 1) / 2);
  if (arr[mid] == num){
    return mid;
  } else if (arr[mid] > num) {
    return getBinarySearchNearest(num, arr.slice(0, mid+1));
  } else {
    return getBinarySearchNearest(num, arr.slice(mid+1)) + mid+1;
  }
}

// "short_labels": [
//   {
//       "short_label": "FOL",
//       "value": -1685,
//       "sub_cat": "Foley",
//       "label": "FOLEY"
//   },
//   {
//       "short_label": "UOP",
//       "value": -10,
//       "sub_cat": "Void",
//       "label": "UOP"
//   }
// ]


function binarySearch(ar, el, compare_fn) {
  if (compare_fn(ar[0].short_label, el.short_label)){
    return 0;
  }      
  if (compare_fn(el.short_label, ar[ar.length-1].short_label)) {
    return ar.length;
  }

  var m = 0;
  var n = ar.length - 1;
  while (m <= n) {
      var k = (n + m) >> 1;
      var cmp = compare_fn(el.short_label, ar[k].short_label);
      if (cmp > 0) {
          m = k + 1;
      } else if(cmp < 0) {
          n = k - 1;
      } else {
          return k;
      }
  }
  return -m - 1;
}

function comp(a, b) {
  return SL_ORDER_ARRAY.indexOf(a) > SL_ORDER_ARRAY.indexOf(b);
}



async function parallelQuery(conn, new_query) {

  // should parallel do the sql query
  const task1 = await inOutEventTooltipQuerySQLExecutor(conn, new_query);
  const task2 = await inOutDiluentsTooltipQuerySQLExecutor(conn, new_query);
  const task3 = await weightQuerySQLExecutor(conn, new_query);

  return {
    arr1: await task1,
    arr2: await task2,
    weightArray: await task3,
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
const getInOutTooltipQueryV2 = database.withConnection(async function (conn, query) {
  let new_query = {
    person_id: query.person_id,
    from: query.from || 0,
    // "to" default value is Math.ceil of timestamp of now to query.resolution 
    to: query.to - 1 || (query.from + query.resolution - 1),
    resolution: query.resolution || 3600
  }
  console.log("query = ", new_query);

  if (!isValidJson.validate_inout(new_query)) {
    console.warn(new_query + " : not json");
    throw new InputInvalidError('Input not in valid json');
  }

  if (new_query.from > new_query.to) {
    throw new InputInvalidError('start time must > end time');
  }
  if (new_query.resolution <= 0 || new_query.resolution % 3600 != 0) {
    throw new InputInvalidError('"resolution" must be 3600 * n (n ∈ N)');
  }

  if (new_query.from % 3600 != 0) {
    throw new InputInvalidError('"start" time must be divisible by 3600');
  }

  
  let consoleTimeCount = timeLable++;
  console.time('getInOutTooltip' + consoleTimeCount);
  let rawResult = await parallelQuery(conn, new_query);
  let result = _calculateRawRecords(rawResult, new_query[RESOLUTION], new_query[FROM], new_query[TO]);
  console.timeEnd('getInOutTooltip' + consoleTimeCount);
  return result;
});

module.exports = {
  getInOutTooltipQueryV2
};

