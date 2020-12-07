/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-03 21:10:09 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-03 21:18:10
 */


const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const { getSingleVitalCALCResult } = require("../db_relation/vitals-calc-relation");

const cat2 = "data_type";
const cat3 = "data_resolution";
const catPersonId = "person_id";
const catVitalType = "vital_type";
const catFrom = "from";
const catTo = "to";
const cat2Array = ["binned", "calc"];
const cat3Array = ["1D", "12H", "5H", "5M"];

const getVitalsBin = async(vitalsData) => {

 
  let vitalsRecords = await conn.execute(sqlQuery);

  let timeInterval = convertTimeInterval(query[cat3]);
  let vitalType2nd = SQLVitalTypeDict2ndChoice[query[catVitalType]];
  console.log("vitalType2nd: ", vitalType2nd);

  if (vitalType2nd) {
    let sqlDict2nd = SQL_GET_DICT + "'" + vitalType2nd + "'";
    console.log("sqlDict2nd = ", sqlDict2nd);
    let dictRecord2nd = await conn.execute(sqlDict2nd);
    let [minBinId2nd, maxBinId2nd, dictResult2nd] = getMinMaxBinId(dictRecord2nd);

    let mapDictResult = getBinIdMapDictResult(dictResult, dictResult2nd);
    // console.log("mapDictResult = ", mapDictResult);

    let sqlQuery2nd = SQL_PART1 + sqlTable + SQL_PART2 + person_id + ` AND BIN_ID >= ` + minBinId2nd + ` AND BIN_ID <= ` + maxBinId2nd + SQL_PART3;
    console.log("sqlQuery2nd = ", sqlQuery2nd);
    console.time("getVitalBinned-2nd " + timestamp);
    let vitalsRecords2nd = await conn.execute(sqlQuery2nd);
    console.timeEnd("getVitalBinned-2nd " + timestamp);
    let binnedResult = _calculateBinnedRecords(vitalType, dictResult, timeInterval, vitalsRecords, vitalType2nd, mapDictResult, vitalsRecords2nd);
    console.timeEnd("getVitalBinned" + timestamp);
    return binnedResult;
  }

  let binnedResult = _calculateBinnedRecords(vitalType, dictResult, timeInterval, vitalsRecords);
  console.timeEnd("getVitalBinned" + timestamp);
  return binnedResult;
}

function getMinMaxBinId(dictRecord) {
  let dictResult = {};
  let maxBinId = 0;
  let minBinId = Number.MAX_SAFE_INTEGER;
  for (let row of dictRecord.rows) {
    if (row.BIN_ID > maxBinId) {
      maxBinId = row.BIN_ID;
    }
    if (row.BIN_ID < minBinId) {
      minBinId = row.BIN_ID;
    }
    dictResult[row.BIN_ID] = [row.LMT_ST, row.LMT_END];
  }
  return [minBinId, maxBinId, dictResult];
}

function _calculateBinnedRecords(
  vitalType,
  dictResult,
  timeInterval,
  vitalsRecords,
  vitalType2nd = null,
  mapDictResult = null,
  vitalsRecords2nd = null
) {
  var result = [dictResult];
  // vitalsRecords = {"metadata":[], "rows":[]}
  var arr1 = vitalsRecords.rows;
  console.log("vitals Binned record size :", arr1.length);

  // vitalsRecords = {"metadata":[], "rows":[]}
  if (vitalsRecords2nd != null && vitalsRecords2nd.rows != null && vitalsRecords2nd.rows.length != 0) {
    let arr2 = vitalsRecords2nd.rows;
    console.log("vitals Binned 2nd record size :", arr2.length);
    let count2nd = 0;
    let currentStartTM = 0;
    var singleResult;
    let records_start_time = Math.min(arr1[0] ? arr1[0].START_TM : 0, arr2[0] ? arr2[0].START_TM : 0);
    //example one record = {"START_TM": "1524657600", "END_TM": "1524700800", "BIN_ID": "9", "VAL": 9}

    let h1 = 0; // index of arr1
    let h2 = 0; // index of arr2
    while (h1 < arr1.length && h2 < arr2.length) {
      // todo remove this later
      if (!(arr2[h2].START_TM - records_start_time) % timeInterval && arr2[h2].START_TM - records_start_time) {
        console.warn("1 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
        console.log("records_start_time :", records_start_time);
        console.log("arr1[0].START_TM :", arr1[0].START_TM);
        console.log("arr2[0].START_TM :", arr2[0].START_TM);

        console.log("timeInterval :", timeInterval);
      }

      if (arr1[h1].START_TM == arr2[h2].START_TM) {
        // both at this time, keep data from arr1

        if (arr1[h1].END_TM * 1 - arr1[h1].START_TM * 1 != timeInterval) {
          console.warn("2 Error for " + vitalType + " with " + arr1[h1].START_TM + ", " + arr1[h1].END_TM);
          console.log("records_start_time :", records_start_time);
          console.log("timeInterval :", timeInterval);
        }
        if (arr2[h2].END_TM * 1 - arr2[h2].START_TM * 1 != timeInterval) {
          console.warn("3 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
          console.log("records_start_time :", records_start_time);
          console.log("timeInterval :", timeInterval);
        }

        if (currentStartTM != arr1[h1].START_TM) {
          if (currentStartTM != 0) {
            result.push(singleResult);
          }
          // new singleResult
          currentStartTM = arr1[h1].START_TM;
          singleResult = getSingleBinnedResult(vitalType, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
        }
        singleResult[arr1[h1].BIN_ID] = arr1[h1].VAL;
        h1++;
        h2++;
      } else if (arr1[h1].START_TM > arr2[h2].START_TM) {
        // only data from arr2 at this time

        if (arr2[h2].END_TM * 1 - arr2[h2].START_TM * 1 != timeInterval) {
          console.warn("4 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
          console.log("records_start_time :", records_start_time);
          console.log("timeInterval :", timeInterval);
        }

        if (currentStartTM != arr2[h2].START_TM) {
          if (currentStartTM != 0) {
            result.push(singleResult);
          }
          // new singleResult
          currentStartTM = arr2[h2].START_TM;
          singleResult = getSingleBinnedResult(vitalType2nd, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
        }

        singleResult[mapDictResult[arr2[h2].BIN_ID]] = arr2[h2].VAL;
        count2nd++;
        h2++;
      } else if (arr1[h1].START_TM < arr2[h2].START_TM) {
        // only data from arr1 at this time

        if (currentStartTM != arr1[h1].START_TM) {
          if (currentStartTM != 0) {
            result.push(singleResult);
          }
          // new singleResult
          currentStartTM = arr1[h1].START_TM;
          singleResult = getSingleBinnedResult(vitalType, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
        }
        singleResult[arr1[h1].BIN_ID] = arr1[h1].VAL;
        h1++;
      } else {
        console.log("Error h1 or h2");
      }
    }

    // the rest of arr1 or arr2
    while (h2 < arr2.length) {
      if (arr2[h2].END_TM * 1 - arr2[h2].START_TM * 1 != timeInterval) {
        console.warn("5 Error for " + vitalType2nd + " with " + arr2[h2].START_TM + ", " + arr2[h2].END_TM);
        console.log("records_start_time :", records_start_time);
        console.log("timeInterval :", timeInterval);
      }

      if (currentStartTM != arr2[h2].START_TM) {
        if (currentStartTM != 0) {
          result.push(singleResult);
        }
        // new singleResult
        currentStartTM = arr2[h2].START_TM;
        singleResult = getSingleBinnedResult(vitalType2nd, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
      }
      singleResult[mapDictResult[arr2[h2].BIN_ID]] = arr2[h2].VAL;
      count2nd++;
      h2++;
    }
    while (h1 < arr1.length) {
      if (currentStartTM != arr1[h1].START_TM) {
        if (currentStartTM != 0) {
          result.push(singleResult);
        }
        // new singleResult
        currentStartTM = arr1[h1].START_TM;
        singleResult = getSingleBinnedResult(vitalType, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
      }
      singleResult[arr1[h1].BIN_ID] = arr1[h1].VAL;
      h1++;
    }

    // last item
    if (result[result.length - 1] != singleResult) {
      result.push(singleResult);
    }
    console.log(` 2nd used for binned = ${count2nd}`);
    return result;
  } else {
    // no source2 data
    // check source1 data
    if (arr1.length < 1) {
      return [];
    }
    var currentStartTM = 0;
    for (let vitalsRecord of arr1) {
      //example vitalsRecord = {"START_TM": "1524657600", "END_TM": "1524700800", "BIN_ID": "9", "VAL": 9}

      // if timeInterval is "12H", every end_tm is larger than start_tm 12 hours or 43200 seconds
      if (vitalsRecord.END_TM * 1 - vitalsRecord.START_TM * 1 != timeInterval) {
        console.warn("6 Error for " + timeInterval + " with " + vitalsRecord.START_TM + ", " + vitalsRecord.END_TM);
        console.log("vitalsRecord.START_TM :", vitalsRecord.START_TM);
        console.log("timeInterval :", timeInterval);
      }

      // start_time was sorted when sql query done.
      // for a currentStartTM same with last record, add all bin_id to this singleResult
      // for a new currentStartTM, create a new binDict with timestamp and binString with default value "0"
      var singleResult;
      if (currentStartTM != vitalsRecord.START_TM) {
        if (currentStartTM != 0) {
          result.push(singleResult);
        } else {
          // the first record
          // console.log("start pushing into array...");
        }
        currentStartTM = vitalsRecord.START_TM;
        singleResult = getSingleBinnedResult(vitalType, dictResult, currentStartTM, currentStartTM * 1 + timeInterval);
        // console.log("singleResult = ", singleResult);
      }

      // getBinString convert bin_id "8" to "100-110"
      // at the same record, same BIN_ID only has one VAL
      singleResult[vitalsRecord.BIN_ID] = vitalsRecord.VAL;
    }

    // last item
    if (result[result.length - 1] != singleResult) {
      result.push(singleResult);
    }
    return result;
  }
}

function getBinIdMapDictResult(dictResult, dictResult2nd) {
  let keyMap = {};
  for (let key2nd in dictResult2nd) {
    for (let key in dictResult) {
      if (dictResult2nd[key2nd][0] == dictResult[key][0] && dictResult2nd[key2nd][1] == dictResult[key][1]) {
        keyMap[key2nd] = key;
        continue;
      }
    }
  }
  return keyMap;
}

module.exports = {
  getVitalsBin,
};
