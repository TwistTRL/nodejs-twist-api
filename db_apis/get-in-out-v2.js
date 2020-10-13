/*
 * @Author: Peng
 * @Date: 2020-01-21 10:12:26
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-13 03:06:45
 */

/**
 * arr1 from table `INTAKE_OUTPUT`,
 * arr2 from table `DRUG_DILUENTS`,
 * arr3 from table `TPN`,
 * arrEN from table `EN`,
 * arrLipids from table `TPN_LIPIDS`
 * arrMed from table `DRUG_INTERMITTENT`
 *
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

// cache table API_CACHE_INOUT
const GET_INOUT_CACHE_SQL = `
SELECT
  INOUT_VALUE, 
  SHORT_LABEL, 
  DT_UNIX, 
  INOUT_TYPE
FROM API_CACHE_INOUT
WHERE PERSON_ID = :person_id
`;

const SQL_GET_EN_PART1 = `
SELECT  
  START_TIME_UNIX,
  "VOLUME"
FROM EN
WHERE PERSON_ID = `;
const SQL_GET_EN_PART2 = `
AND START_TIME_UNIX <= `;
const SQL_GET_EN_PART3 = ` AND START_TIME_UNIX >= `;
const SQL_GET_EN_PART4 = ` 
ORDER BY START_TIME_UNIX`;

const SQL_GET_TPN_PART1 = `
SELECT  
  START_UNIX,
  END_UNIX, 
  RESULT_VAL
FROM TPN
WHERE PERSON_ID = `;
const SQL_GET_TPN_PART2 = `
AND START_UNIX <= `;
const SQL_GET_TPN_PART3 = ` AND END_UNIX >= `;
const SQL_GET_TPN_PART4 = ` 
ORDER BY START_UNIX`;

const SQL_GET_TPN_LIPID_PART1 = `
SELECT
  DT_UNIX,
  RESULT_VAL
FROM TPN_LIPID
WHERE PERSON_ID = `;
const SQL_GET_TPN_LIPID_PART2 = `
AND DT_UNIX <= `;
const SQL_GET_TPN_LIPID_PART3 = ` AND DT_UNIX >= `;
const SQL_GET_TPN_LIPID_PART4 = ` 
ORDER BY DT_UNIX`;

// get raw in-out by event between two timestamp
// const SQL_GET_IN_OUT_EVENT_PART1 = `
// SELECT
//   DT_UNIX,
//   EVENT_CD,
//   IO_CALCS,
//   RESULT_VAL
// FROM INTAKE_OUTPUT
// WHERE PERSON_ID = `
const SQL_GET_IN_OUT_EVENT_PART1 = `
SELECT  
  DT_UNIX,
  EVENT_CD,
  RESULT_VAL
FROM INTAKE_OUTPUT
WHERE PERSON_ID = `;
const SQL_GET_IN_OUT_EVENT_PART2 = `
AND DT_UNIX >= `;
const SQL_GET_IN_OUT_EVENT_PART3 = ` AND DT_UNIX <= `;
const SQL_GET_IN_OUT_EVENT_PART4 = ` 
ORDER BY DT_UNIX
`;

// get raw in-out by FLUSHES and INFUSIONS between two timestamp
//(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES
// others: INFUSIONS
// SEND: mL in each bin (calculated from rate), drug, diluent, conc, stength_unit,vol_unit, infusion_rate, infusion_rate_units, [admin site,]

//  ADMIN_SITE not available
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
WHERE PERSON_ID = `;
const SQL_GET_IN_OUT_DILUENTS_PART2 = ` 
ORDER BY START_UNIX`;

const SQL_GET_MED_VOL = `
SELECT 
  DT_UNIX,
  INFUSED_VOLUME,
  VOLUME_UNITS
FROM DRUG_INTERMITTENT
WHERE PERSON_ID = :person_id 
  AND (VOLUME_UNITS = 'mL' OR VOLUME_UNITS = 'L')
  AND DT_UNIX BETWEEN :from_ AND :to_
ORDER BY DT_UNIX`;

async function enQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_EN =
    SQL_GET_EN_PART1 +
    query[PERSON_ID] +
    SQL_GET_EN_PART2 +
    Number(query[TO]) +
    SQL_GET_EN_PART3 +
    Number(query[FROM]) +
    SQL_GET_EN_PART4;
  console.log("~~SQL for EN: ", SQL_GET_EN);
  console.time("getEN-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_EN);
  console.timeEnd("getEN-sql" + timestampLable);
  return rawRecord.rows;
}

async function tpnQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_TPN =
    SQL_GET_TPN_PART1 +
    query[PERSON_ID] +
    SQL_GET_TPN_PART2 +
    Number(query[TO]) +
    SQL_GET_TPN_PART3 +
    Number(query[FROM]) +
    SQL_GET_TPN_PART4;
  console.log("~~SQL for TPN: ", SQL_GET_TPN);
  console.time("getTPN-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_TPN);
  console.timeEnd("getTPN-sql" + timestampLable);
  return rawRecord.rows;
}

async function lipidsQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_LIPIDS =
    SQL_GET_TPN_LIPID_PART1 +
    query[PERSON_ID] +
    SQL_GET_TPN_LIPID_PART2 +
    Number(query[TO]) +
    SQL_GET_TPN_LIPID_PART3 +
    Number(query[FROM]) +
    SQL_GET_TPN_LIPID_PART4;
  console.log("~~SQL for LIPIDS: ", SQL_GET_LIPIDS);
  console.time("getLipids-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_LIPIDS);
  console.timeEnd("getLipids-sql" + timestampLable);
  return rawRecord.rows;
}

async function inOutEventQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;

  let SQL_GET_IN_OUT_EVENT =
    SQL_GET_IN_OUT_EVENT_PART1 +
    query[PERSON_ID] +
    SQL_GET_IN_OUT_EVENT_PART2 +
    query[FROM] * 1 +
    SQL_GET_IN_OUT_EVENT_PART3 +
    query[TO] * 1 +
    SQL_GET_IN_OUT_EVENT_PART4;
  console.log("~~SQL for in-out Event: ", SQL_GET_IN_OUT_EVENT);
  console.time("getInOutEvent-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_EVENT);
  console.timeEnd("getInOutEvent-sql" + timestampLable);
  return rawRecord.rows;
}

async function inOutDiluentsQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;

  let SQL_GET_IN_OUT_DILUENTS =
    SQL_GET_IN_OUT_DILUENTS_PART1 +
    query[PERSON_ID] +
    ` 
    AND ((START_UNIX < ` +
    query[FROM] +
    ` AND END_UNIX > ` +
    query[FROM] +
    `)
    OR (START_UNIX >= ` +
    query[FROM] +
    ` AND END_UNIX <= ` +
    query[TO] +
    ` )
    OR (START_UNIX < ` +
    query[TO] +
    ` AND END_UNIX >  ` +
    query[TO] +
    `))` +
    SQL_GET_IN_OUT_DILUENTS_PART2;
  console.log("~~SQL for in-out Diluents: ", SQL_GET_IN_OUT_DILUENTS);
  console.time("getInOutDiluents-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_DILUENTS);
  console.timeEnd("getInOutDiluents-sql" + timestampLable);
  return rawRecord.rows;
}

async function medVolQuerySQLExecutor(conn, query) {
  let binds = {
    person_id: Number(query.person_id),
    from_: Number(query[FROM]),
    to_: Number(query[TO]),
  };
  console.log("binds :>> ", binds);
  let timestampLable = timeLable++;
  console.log("~~SQL for med volume in out v2: ", SQL_GET_MED_VOL);
  console.time("getMedVol-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_MED_VOL, binds);
  console.timeEnd("getMedVol-sql" + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(rawRecords, timeInterval, startTime, endTime) {
  let { arr1, arr2, arr3, arrEN, arrLipids, arrMed } = rawRecords;

  let resultEvent = [];
  if (arr1 && arr1.length) {
    console.log("In-Out Event record size :", arr1.length);
    let countValue0 = 0;
    let countType0 = 0;
    let currentSameTimeArray = [];
    let currentTime = Math.floor(arr1[0].DT_UNIX / timeInterval) * timeInterval;

    for (let row of arr1) {
      //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "RESULT_VAL": 0.9}
      if (!EVENT_CD_DICT[row.EVENT_CD]) {
        console.log("~~ error for row");
        console.log("EVENT_CD_DICT[row.EVENT_CD] :>> ", EVENT_CD_DICT[row.EVENT_CD]);
        console.log("row :>> ", row);
        continue;
      }
      let io_calcs = EVENT_CD_DICT[row.EVENT_CD].IO_CALCS;

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      //if current DISPLAY_IO != '1', skip it
      if (EVENT_CD_DICT[row.EVENT_CD].DISPLAY_IO != "1") {
        continue;
      }

      if (!row.RESULT_VAL) {
        countValue0++;
        continue;
      }

      if (io_calcs != 1 && io_calcs != 2) {
        countType0++;
        continue;
      }

      //if current SHORT_LABEL == '', and if timeInterval == 3600 (seconds in 1 hour), push it directly to resultEvent
      row.SHORT_LABEL = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;
      if (row.SHORT_LABEL == "" && timeInterval == 3600 && row.RESULT_VAL) {
        let singleType0Result = {};
        singleType0Result.value = row.RESULT_VAL;
        singleType0Result.short_label = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;
        singleType0Result.time = currentTime;
        singleType0Result.type = io_calcs;
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
      let combinedSameTimeArray = handelSameTimeArray(
        currentSameTimeArray,
        currentTime,
        timeInterval
      );
      resultEvent.push(...combinedSameTimeArray);
      currentSameTimeArray = [];
      currentSameTimeArray.push(row);
      currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
    }

    if (currentSameTimeArray.length != 0) {
      let combinedSameTimeArray = handelSameTimeArray(
        currentSameTimeArray,
        currentTime,
        timeInterval
      );
      resultEvent.push(...combinedSameTimeArray);
    }
    console.log("In-Out Event records with 0/null value count: ", countValue0);
    console.log("In-Out Event records with type `0` count: ", countType0);

    // console.log('resultEvent :', resultEvent);
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

  let timeFlushDict = {};
  let timeDripsDict = {};
  if (arr2 && arr2.length) {
    console.log("In-Out Diluents record size :", arr2.length);

    for (let row of arr2) {
      //example row = {"START_UNIX": 1524700800, "END_UNIX": "1524736800", "DRUG": "drug", "DILUENT": "aaa", "INFUSION_RATE": 0.9 .... }
      //(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES
      let currentTime =
        Math.floor(Math.max(row.START_UNIX, startTime) / timeInterval) * timeInterval;

      // console.log('row.START_UNIX :', row.START_UNIX);
      // console.log('startTime :', startTime);

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      let zoneNumber =
        Math.floor((Math.min(row.END_UNIX, endTime) - currentTime) / timeInterval) + 1;
      for (let i = 0; i < zoneNumber; i++) {
        let singleResult = {};
        let value = 0;
        let cTime = currentTime + i * timeInterval;
        // if (i == 0) {
        //   value = (Math.min(currentTime + timeInterval, row.END_UNIX) - row.START_UNIX) * row.INFUSION_RATE / 3600;
        // } else if (i == zoneNumber - 1) {
        //   value = (row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1)) * row.INFUSION_RATE / 3600;
        // } else {
        //   value = timeInterval * row.INFUSION_RATE / 3600;
        // }

        if (i == 0) {
          value =
            ((Math.min(currentTime + timeInterval, row.END_UNIX) -
              Math.max(startTime, row.START_UNIX)) *
              row.INFUSION_RATE) /
            3600;
          // let value1 =
          //   ((Math.min(currentTime + timeInterval, row.END_UNIX) -
          //     row.START_UNIX) *
          //     row.INFUSION_RATE) /
          //   3600;
          // if (value1 != value) {
          //   console.log("value1 :", value1);
          //   console.log('value :', value);
          // }
        } else if (i == zoneNumber - 1) {
          value =
            (Math.min(row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1), timeInterval) *
              row.INFUSION_RATE) /
            3600;
          // let value2 =
          //   ((row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1)) *
          //     row.INFUSION_RATE) /
          //   3600;
          // if (value2 != value) {
          //   console.log("value2 :", value2);
          // }
        } else {
          value = (timeInterval * row.INFUSION_RATE) / 3600;
        }

        if (value <= 0) {
          console.log("error value <= 0: ", value);
        }

        if (row.DRUG == "papavarine" || row.DRUG == "heparin flush") {
          // `Flushes`, write to timeFlushDict, key is start time of each binned time box
          // {1524700800: {singleResult}, ...}

          if (cTime in timeFlushDict) {
            timeFlushDict[cTime].value += value;
          } else {
            //FLUSHES	FLUSHES	FLUSH	FLUSH
            singleResult.value = value;
            singleResult.short_label = "Flushes";
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
            singleResult.short_label = "Infusions";
            singleResult.time = cTime;
            singleResult.type = "1";
            timeDripsDict[singleResult.time] = singleResult;
          }
        }
      }
    }
  }
  //example arr3[indexArr3] = {
  // START_UNIX
  // EVENT_TAG
  // RESULT_VAL
  // END_UNIX}
  let timeTPNDict = {};

  if (arr3 && arr3.length) {
    console.log("TPN record size :", arr3.length);

    for (let row of arr3) {
      //example row = {"START_UNIX": 1524700800, "END_UNIX": "1524736800", "DRUG": "drug", "DILUENT": "aaa", "INFUSION_RATE": 0.9 .... }
      //(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES

      let rowStart = row.START_UNIX;
      let rowEnd = row.END_UNIX + 1;

      let currentTime =
        Math.floor(Math.max(row.START_UNIX, startTime) / timeInterval) * timeInterval;

      // console.log('row.START_UNIX :', row.START_UNIX);
      // console.log('startTime :', startTime);

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      let zoneNumber = Math.floor((Math.min(rowEnd, endTime) - currentTime) / timeInterval) + 1;
      for (let i = 0; i < zoneNumber; i++) {
        let singleResult = {};
        let value = 0;
        let cTime = currentTime + i * timeInterval;

        if (i == 0) {
          value =
            ((Math.min(currentTime + timeInterval, rowEnd) - Math.max(startTime, row.START_UNIX)) *
              row.RESULT_VAL) /
            3600;
          let value1 =
            ((Math.min(currentTime + timeInterval, rowEnd) - row.START_UNIX) * row.RESULT_VAL) /
            3600;
          if (value1 != value) {
            console.log("value1 :", value1);
          }
        } else if (i == zoneNumber - 1) {
          value =
            (Math.min(rowEnd - currentTime - timeInterval * (zoneNumber - 1), timeInterval) *
              row.RESULT_VAL) /
            3600;
          let value2 =
            ((rowEnd - currentTime - timeInterval * (zoneNumber - 1)) * row.RESULT_VAL) / 3600;
          if (value2 != value) {
            console.log("value2 :", value2);
          }
        } else {
          value = (timeInterval * row.RESULT_VAL) / 3600;
        }

        if (value < 0) {
          console.log("error value <= 0: ", value);
        }

        // if (value == 0 && row.RESULT_VAL != 0) {
        //   console.log('row.RESULT_VAL :', row.RESULT_VAL);

        // }

        if (cTime in timeTPNDict) {
          timeTPNDict[cTime].value += value;
        } else {
          singleResult.value = value;
          singleResult.short_label = "TPN";
          singleResult.time = cTime;
          singleResult.type = "1";
          timeTPNDict[singleResult.time] = singleResult;
        }
      }
    }
  }

  let timeLipidsDict = {};
  if (arrLipids && arrLipids.length) {
    console.log("Lipids record size :", arrLipids.length);
    for (let row of arrLipids) {
      //example row = {"DT_UNIX": 1524700800, "RESULT_VAL": 2}
      let currentTime = Math.floor(Math.max(row.DT_UNIX, startTime) / timeInterval) * timeInterval;

      let singleResult = {};
      let value = Number(row.RESULT_VAL);

      if (currentTime in timeLipidsDict) {
        timeLipidsDict[currentTime].value += value;
      } else {
        singleResult.value = value;
        singleResult.short_label = "Lipids";
        singleResult.time = currentTime;
        singleResult.type = "1";
        timeLipidsDict[singleResult.time] = singleResult;
      }
    }
  }

  //example arrEN[indexArrEN] = {
  // START_TIME_UNIX
  // VOLUME

  let timeENDict = {};
  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_UNIX": 1524700800, "VOLUME": 2}
      let currentTime =
        Math.floor(Math.max(row.START_TIME_UNIX, startTime) / timeInterval) * timeInterval;

      let singleResult = {};
      let value = row.VOLUME;

      if (currentTime in timeENDict) {
        timeENDict[currentTime].value += value;
      } else {
        singleResult.value = value;
        singleResult.short_label = "EN";
        singleResult.time = currentTime;
        singleResult.type = "1";
        timeENDict[singleResult.time] = singleResult;
      }
    }
  }

  let resultMed = [];
  if (arrMed && arrMed.length) {
    console.log("Med record size :", arrMed.length);
    let currentSameTimeArray = [];

    for (let row of arrMed) {
      //example row = {"DT_UNIX": "1524700800", "INFUSED_VOLUME": 0.9}
      let currentTime = Math.floor(arrMed[0].DT_UNIX / timeInterval) * timeInterval;

      if (currentTime < startTime) {
        continue;
      }
      if (currentTime > endTime) {
        break;
      }

      let value =
        row.VOLUME_UNITS === "mL" ? Number(row.INFUSED_VOLUME) : Number(row.INFUSED_VOLUME) * 1000;

      resultMed.push({
        value,
        short_label: "Medications",
        time: row.DT_UNIX,
        type: "1",
      });
    }
  }

  let resultFlush = Object.values(timeFlushDict);
  let resultDrips = Object.values(timeDripsDict);
  let resultTPN = Object.values(timeTPNDict);
  let resultEN = Object.values(timeENDict);
  let resultLipids = Object.values(timeLipidsDict);

  //unsorted array from Event, Flush, Drips, TPN
  let arr = [
    ...resultEvent,
    ...resultFlush,
    ...resultDrips,
    ...resultTPN,
    ...resultEN,
    ...resultLipids,
    ...resultMed,
  ];
  console.log('in out result arr.length :>> ', arr.length);
  arr.sort(function (a, b) {
    let keyA = a.time;
    let keyB = b.time;
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
  return arr;
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
    //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "RESULT_VAL": 0.9, "SHORT_LABEL": "VAC"}
    let io_calcs = EVENT_CD_DICT[row.EVENT_CD].IO_CALCS;

    // todo, now combined with event cd
    // color not working

    let value;
    if (row.SHORT_LABEL in dict) {
      if (io_calcs == 2) {
        value = Math.abs(row.RESULT_VAL) * -1;
      } else {
        value = Math.abs(row.RESULT_VAL) * 1;
      }
      dict[row.SHORT_LABEL] += value;
    } else {
      if (io_calcs == 2) {
        value = Math.abs(row.RESULT_VAL) * -1;
      } else {
        value = Math.abs(row.RESULT_VAL) * 1;
      }
      dict[row.SHORT_LABEL] = value;
    }
  }

  // {"VAC": 0.9, "PIG1": 1.1}
  for (let key in dict) {
    // skip for (timeInterval != 3600 and short_label is empty)
    if ((timeInterval == 3600 || key != "") && dict[key]) {
      let singleResult = {};
      // console.log("key: ", key);
      singleResult.value = dict[key];
      singleResult.short_label = key;
      singleResult.time = timeOfArray;
      singleResult.type = SL_TO_CALCS[key];
      resultSameTime.push(singleResult);
    }
  }
  return resultSameTime;
}

async function parallelQuery(conn, query) {
  // should parallel do the sql query
  const task1 = await inOutEventQuerySQLExecutor(conn, query);
  const task2 = await inOutDiluentsQuerySQLExecutor(conn, query);
  const task3 = await tpnQuerySQLExecutor(conn, query);
  const task4 = await enQuerySQLExecutor(conn, query);
  const task5 = await lipidsQuerySQLExecutor(conn, query);
  const task6 = await medVolQuerySQLExecutor(conn, query);

  return {
    arr1: await task1,
    arr2: await task2,
    arr3: await task3,
    arrEN: await task4,
    arrLipids: await task5,
    arrMed: await task6,
  };
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
const getInOutQueryV2 = database.withConnection(async function (conn, query) {
  let result = [];
  let consoleTimeCount = timeLable++;
  console.time("getInOut " + consoleTimeCount);

  // USE CACHE
  if (Number(query.resolution) === 3600) {
    // try cache
    const binds = {
      person_id: query.person_id,
    };
    result = await conn.execute(GET_INOUT_CACHE_SQL, binds).then( ret=>ret.rows ); 
    if (result && result[0]) {
      console.timeEnd("getInOut " + consoleTimeCount);
      console.log("~~> from cache table: ", query.person_id);
      return result.map( item => {
        return {
          value: item.INOUT_VALUE,
          short_label: item.SHORT_LABEL,
          time: item.DT_UNIX,
          type: item.INOUT_TYPE,   
        }
      });
    }
  }

  // while no cache
  let rawResults = await parallelQuery(conn, query);
  result = _calculateRawRecords(rawResults, query[RESOLUTION], query[FROM], query[TO]);
  console.timeEnd("getInOut" + consoleTimeCount);
  return result;
});

module.exports = {
  getInOutQueryV2,
};
