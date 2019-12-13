/**
 * VITALS DATABASE RELATIONS
 * 
 * PENG 
 * 12/6/19
 * 
 */

const CAT_VITAL_TYPE_ARRAY = ["mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp", "tempcore"];
const SQL_COLUNM_NAME_FOR_CAT_VITAL_TYPE_ARRAY = ["MBP1", "SBP1", "DBP1", "SPO2_1", "HR_EKG","CVPM","RAP","LAPM","RR","TEMP1","TEMPCORE1"];

let SQLVitalTypeDict = {};
CAT_VITAL_TYPE_ARRAY.forEach((catVitalType, SQLName) => SQLVitalTypeDict[catVitalType] = SQL_COLUNM_NAME_FOR_CAT_VITAL_TYPE_ARRAY[SQLName]);


/**
 * 
 * @param {*} dictResult  
 * @param {*} START_TM 
 * @param {*} END_TM 
 */
function getSingleResult(dictResult, START_TM, END_TM) {
  let binDict = {};
  for (var key in dictResult) {
    binDict[key] = 0;
  }

  binDict["from"] = START_TM*1;
  binDict["to"] = END_TM*1;
  binDict["time"] = START_TM/2 + END_TM/2;

  return binDict;
}


function getSingleRawResult() {
  return {"value":null, "time":null};
}

module.exports = {
  getSingleResult,
  getSingleRawResult,
  CAT_VITAL_TYPE_ARRAY,
  SQLVitalTypeDict
}