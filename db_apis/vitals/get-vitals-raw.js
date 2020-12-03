/*
 * @Author: Peng
 * @Date: 2020-01-21 11:53:31
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-03 12:57:48
 */

 // for get-vitals-all-v2
// get raw vitals between two timestamp

const database = require("../../services/database");
const {
  getSingleBinnedResult,
  getSingleRawResult,
  CAT_VITAL_TYPE_ARRAY,
  SQLVitalTypeDict,
  SQLVitalTypeDict2ndChoice,
} = require("../../db_relation/vitals-db-relation");
const isValidJson = require("../../utils/isJson");
const InputInvalidError = require("../../utils/errors").InputInvalidError;
const { getSingleVitalCALCResult } = require("../../db_relation/vitals-calc-relation");

const cat2 = "data_type";
const cat3 = "data_resolution";
const catPersonId = "person_id";
const catVitalType = "vital_type";
const catFrom = "from";
const catTo = "to";
const cat2Array = ["binned", "calc"];
const cat3Array = ["1D", "12H", "5H", "5M"];


/**
 * query:
 * {
    "person_id": 11111111,
    "vital_type": "mbp",
    "from":2222,
    "to":334
}

 * @param {*} conn 
 * @param {*} query 
 */
async function getVitalsRaw(vitalsData) {  
  const {
    vitals_result,
    vitals_2nd_result,
    vital_v500_result,
    vital_aims__result,
  } = vitalsData;

  //TODO: 

  let jsonString = _calculateRawRecords(rawRecord, vitalType, rawRecord2nd, vitalType2nd);
  return jsonString;
}

function _calculateRawRecords(rawRecord, vitalType, rawRecord2nd, vitalType2nd) {
  if (!vitalType2nd && !rawRecord2nd) {
    var result = [];
    // rawRecord = {"metadata":[], "rows":[]}
    var arr = rawRecord.rows;
    console.log("vitals Raw record size :", arr.length);

    if (arr.length < 1) {
      return [];
    }

    for (let row of arr) {
      //example row = {"HR_EKG": 100, "DTUNIX": "1524700800"}
      if (row[vitalType] == null) {
        // skip null value vital records;
        continue;
      }
      // let singleResult = getSingleRawResult();
      let singleResult = {};
      singleResult.time = row.DTUNIX;
      singleResult.value = row[vitalType];
      result.push(singleResult);
    }
    return result;
  } else if (!vitalType2nd || !rawRecord2nd) {
    console.log("Error  vitalType2nd = ", vitalType2nd);
  } else {
    return combine2RawResults(rawRecord, vitalType, rawRecord2nd, vitalType2nd);
  }
}

function combine2RawResults(rawRecord, vitalType, rawRecord2nd, vitalType2nd) {
  var result = [];
  let arr1 = rawRecord.rows;
  let arr2 = rawRecord2nd.rows;
  console.log("vitals Raw record size :", arr1.length);
  console.log("vitals Raw2 record size :", arr2.length);

  let h1 = 0; // index of arr1
  let h2 = 0; // index of arr2
  while (h1 < arr1.length && h2 < arr2.length) {
    if (arr1[h1][vitalType] == null) {
      h1++;
      continue;
    }
    if (arr2[h2][vitalType2nd] == null) {
      h2++;
      continue;
    }
    if (arr1[h1].DTUNIX == arr2[h2].DTUNIX) {
      let singleResult = {};
      singleResult.name = vitalType;
      singleResult.time = arr1[h1].DTUNIX;
      singleResult.value = arr1[h1][vitalType];
      result.push(singleResult);
      h1++;
      h2++;
    } else if (arr1[h1].DTUNIX > arr2[h2].DTUNIX) {
      let singleResult = {};
      singleResult.name = vitalType2nd;
      singleResult.time = arr2[h2].DTUNIX;
      singleResult.value = arr2[h2][vitalType];
      result.push(singleResult);
      h2++;
    } else if (arr1[h1].DTUNIX < arr2[h2].DTUNIX) {
      let singleResult = {};
      singleResult.name = vitalType;
      singleResult.time = arr1[h1].DTUNIX;
      singleResult.value = arr1[h1][vitalType];
      result.push(singleResult);
      h1++;
    } else {
      console.log("Error h1 or h2");
    }
  }

  // the rest of arr1 or arr2
  while (h2 < arr2.length) {
    let singleResult = {};
    singleResult.name = vitalType2nd;
    singleResult.time = arr2[h2].DTUNIX;
    singleResult.value = arr2[h2][vitalType];
    result.push(singleResult);
    h2++;
  }

  while (h1 < arr1.length) {
    let singleResult = {};
    singleResult.name = vitalType;
    singleResult.time = arr1[h1].DTUNIX;
    singleResult.value = arr1[h1][vitalType];
    result.push(singleResult);
    h1++;
  }

  return result;
}



module.exports = {
  getVitalsRaw,
};
