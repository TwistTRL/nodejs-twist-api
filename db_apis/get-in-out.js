/*
 * @Author: Peng 
 * @Date: 2020-01-21 10:12:26 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-01-23 14:33:09
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


// get raw in-out between two timestamp
const SQL_GET_IN_OUT_PART1 = `
SELECT  
  DT_UNIX,
  EVENT_CD,
  IO_CALCS,
  VALUE
FROM INTAKE_OUTPUT
WHERE PERSON_ID = `

const SQL_GET_IN_OUT_PART2 = `
AND DT_UNIX >= `

const SQL_GET_IN_OUT_PART3 = ` AND DT_UNIX <= `

const SQL_GET_IN_OUT_PART4 = ` 
ORDER BY DT_UNIX
`

const PERSON_ID = "person_id";
const FROM = "from";
const TO = "to";
const RESOLUTION = "resolution";

var timeLable = 0;

/**
 * query:
 * {
    "person_id": 11111111,
    "from":2222,
    "to":3344,
    "resolution":3600
}

 * @param {*} conn 
 * @param {*} query 
 */
async function inOutQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  console.time('getInOUt' + timestampLable);

  let SQL_GET_IN_OUT = SQL_GET_IN_OUT_PART1 + query[PERSON_ID] + SQL_GET_IN_OUT_PART2 + query[FROM] * 1 +
    SQL_GET_IN_OUT_PART3 + query[TO] * 1 + SQL_GET_IN_OUT_PART4;
  console.log("SQL for in-out: ", SQL_GET_IN_OUT);
  console.time('getInOUt-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT);
  console.timeEnd('getInOUt-sql' + timestampLable);

  let jsonString = _calculateRawRecords(rawRecord, query[RESOLUTION]);
  console.timeEnd('getInOUt' + timestampLable);
  return jsonString;
}

function _calculateRawRecords(rawRecord, timeInterval) {
  var result = [];
  var countNull = 0;
  // rawRecord = {"metadata":[], "rows":[]}
  var arr = rawRecord.rows;

  if (!arr || arr.length < 1) {
    return [];
  }
  console.log("In-OUt Raw record size :", arr.length);

  // 1. set currentTime, put all the records have the same time or in the same time slot with currentTime into an array
  // 2. using handelSameTimeArray() to calculate the array and push to result array
  // 3. continue step 1.
  let currentSameTimeArray = [];
  let currentTime = 0;

  for (let row of arr) {
    //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "IO_CALCS": 1, "VALUE": 0.9}

    // skip null value vital records;
    if (row.VALUE == null) {
      countNull++;
    }

    if (row.IO_CALCS != 0 && row.IO_CALCS != 1 && row.IO_CALCS != 2) {
      console.log("row.IO_CALCS error");
    }

    //if current DISPLAY_IO != '1', finish CurrentSameTimeArray 
    if (EVENT_CD_DICT[row.EVENT_CD].DISPLAY_IO != '1') {
      if (currentSameTimeArray.length != 0) {
        let combinedSameTimeArray = handelSameTimeArray(currentSameTimeArray, currentTime, timeInterval);
        result.push(...combinedSameTimeArray);
        currentSameTimeArray = [];
      }
      continue;
    }

    //if current SHORT_LABEL == '', finish CurrentSameTimeArray and push current record to result 
    row.SHORT_LABEL = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;
    if (row.SHORT_LABEL == '') {
      if (currentSameTimeArray.length != 0) {
        let combinedSameTimeArray = handelSameTimeArray(currentSameTimeArray, currentTime, timeInterval);
        result.push(...combinedSameTimeArray);
        currentSameTimeArray = [];
      }

      if (timeInterval != 3600) {
        continue;
      }
      
      let singleType0Result = {};
      singleType0Result.value = row.VALUE;
      singleType0Result.cat = EVENT_CD_DICT[row.EVENT_CD].IO_CAT;
      singleType0Result.sub_cat = EVENT_CD_DICT[row.EVENT_CD].Subcat;
      singleType0Result.label = EVENT_CD_DICT[row.EVENT_CD].LABEL;
      singleType0Result.short_label = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;
      singleType0Result.color = "#fafafa";
      singleType0Result.time = row.DT_UNIX;
      singleType0Result.type = row.IO_CALCS;
      result.push(singleType0Result);
      continue;
    }

    // first item or new array
    if (currentSameTimeArray.length == 0) {
      currentSameTimeArray.push(row);
      currentTime = row.DT_UNIX;
      continue;
    }

    // if same time with previous record, combine to category
    if (currentTime + timeInterval > row.DT_UNIX) {
      currentSameTimeArray.push(row);
      continue;
    }

    // if not same time, push the calculated previous array and start with this new one
    if (currentSameTimeArray.length != 0) {
      let combinedSameTimeArray = handelSameTimeArray(currentSameTimeArray, currentTime, timeInterval);
      result.push(...combinedSameTimeArray);
      currentSameTimeArray = [];
    }
    currentSameTimeArray.push(row);
    currentTime = row.DT_UNIX;
  }

  if (currentSameTimeArray.length != 0) {
    let combinedSameTimeArray = handelSameTimeArray(currentSameTimeArray, currentTime, timeInterval);
    result.push(...combinedSameTimeArray);
  }
  console.log("null value number: ", countNull);
  return result;
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
    if (timeInterval == 3600 || key != '') {
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


const getInOutQuery = database.withConnection(async function (conn, query) {
  console.log("query = ", query);
  if (!isValidJson.validate_inout(query)) {
    console.warn(query + " : not json");
    throw new InputInvalidError('Input not in valid json');
  }

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

  return await inOutQuerySQLExecutor(conn, new_query);
});

module.exports = {
  getInOutQuery
};