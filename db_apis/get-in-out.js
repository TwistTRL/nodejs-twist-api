/*
 * @Author: Peng 
 * @Date: 2020-01-21 10:12:26 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-01-21 17:17:46
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const IN_OUT_DICT = require("../db_relation/in-out-db-relation");


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
AND DT_UNIX > `

const SQL_GET_IN_OUT_PART3 = ` AND DT_UNIX < `

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

  console.log("get in-out: ", SQL_GET_IN_OUT);
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
  console.log("In-OUt Raw record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  let currentSameTimeArray = [];
  let currentTime = 0;

  for (let row of arr) {
    //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "IO_CALCS": 1, "VALUE": 0.9}

    // skip null value vital records;
    if (row.VALUE == null) {
      countNull++;
      continue;
    }

    if (row.IO_CALCS != 0 && row.IO_CALCS != 1 && row.IO_CALCS != 2) {
      console.log("row.IO_CALCS error");
    }

    // first item or new array
    if (currentSameTimeArray.length == 0) {
      currentSameTimeArray.push(row);
      currentTime = row.DT_UNIX;
      continue;    
    }

    // if same time with previous record, combine to category
    if (currentTime == row.DT_UNIX) {
      currentSameTimeArray.push(row);
      continue;
    } 

    if (currentSameTimeArray != null && currentSameTimeArray.length != 0) {
      let combinedSameTimeArray = handelSameTimeArray(currentSameTimeArray);
      result.push(...combinedSameTimeArray);
    }
    currentSameTimeArray = [];
  }

  if (currentSameTimeArray != null && currentSameTimeArray.length != 0) {
    let combinedSameTimeArray = handelSameTimeArray(currentSameTimeArray);
    result.push(...combinedSameTimeArray);
  }

  console.log("null value number: ", countNull);
  return result;
}


function handelSameTimeArray(array) {
  let dict = {};
  let resultSameTime = [];
  let timeOfArray = array[0].DT_UNIX;

  for (let row of array) {
    //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "IO_CALCS": 1, "VALUE": 0.9}

    // todo, now combined with event cd
    // color not working

    let value;
    if (row.EVENT_CD in dict) {
      if (row.IO_CALCS == 2) {
        value = Math.abs(row.VALUE) * -1;
      } else {
        value = Math.abs(row.VALUE) * 1;
      }
      dict[row.EVENT_CD] += value;
    } else {
      if (row.IO_CALCS == 2) {
        value = Math.abs(row.VALUE) * -1;
      } else {
        value = Math.abs(row.VALUE) * 1;
      }
      dict[row.EVENT_CD] = value;
    }
  }

  // {"2798974": 0.9, "2798975": 1.1}
  for (let key in dict) {
    let singleResult = {};
    let singleEventMap = IN_OUT_DICT[key];
    singleResult.value = dict[key];
    singleResult.cat = singleEventMap.IO_CAT;
    singleResult.sub_cat = singleEventMap.Subcat;
    singleResult.label = singleEventMap.LABEL;
    singleResult.short_label = singleEventMap.SHORT_LABEL;
    singleResult.color = "green";
    singleResult.time = timeOfArray;
    resultSameTime.push(singleResult);
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

  return await inOutQuerySQLExecutor(conn, new_query); 
});

module.exports = {
  getInOutQuery
};