/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-03 12:58:19 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-03 21:08:58
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

const DATATYPE = Object.freeze({
  BINNED: "binned",
  CALC: "calc",
  RAW: "raw",
  TEMP_RAW: "temp_raw",
});

var timeLable = 0;

function getQueryType(query) {
  if (Object.entries(query).length === 0 && query.constructor === Object) {
    console.error("query empty");
    throw new InputInvalidError("Input not valid, so query is empty.");
  }

  if (!isValidJson.validate_vitals_sampled(query) && !isValidJson.validate_vitals_raw(query)) {
    console.warn(query + " : not json");
    throw new InputInvalidError("Input not in valid json");
  }

  if (!CAT_VITAL_TYPE_ARRAY.includes(query[catVitalType])) {
    console.warn("catVitalType no included: " + query[catVitalType]);
    throw new InputInvalidError(
      "vital_type not valid: " + query[catVitalType] + '. \nAll vital_type: "mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp".'
    );
  }
  if (query[catPersonId] == null) {
    console.warn("catPersonId is null");
    throw new InputInvalidError("person_id is null");
  }

  if (query[cat2] != null && query[cat2] !== "raw") {
    if (!cat2Array.includes(query[cat2])) {
      throw new InputInvalidError('"data_type" is not valid. All "data_type": "binned", "calc".');
    }

    if (query[cat3] == null || !cat3Array.includes(query[cat3])) {
      console.log('query[cat3] :>> ', query[cat3]);
      throw new InputInvalidError('"data_resolution" is not valid. All "data_resolution": "1D","12H", "5H", "5M".');
    }

    console.log("type: get down sampled");
    if (query[cat2] == cat2Array[0]) {
      return DATATYPE.BINNED;
    } else {
      return DATATYPE.CALC;
    }
  }

  let currentTime = new Date().getTime() / 1000;
  let year2000Time = 946684800;
  if (query[catFrom] == null || query[catFrom] > currentTime + 10 || query[catFrom] < year2000Time) {
    throw new InputInvalidError('Timestamp "from" is not valid');
  } else if (query[catTo] == null || query[catTo] < query[catFrom]) {
    throw new InputInvalidError('Timestamp "to" is not valid');
  } else if (query[catTo] > currentTime + 10) {
    query[catTo] = currentTime;
  }
  if (query[catVitalType] === "temp") {
    console.log("type: get temperature raw");
    return DATATYPE.TEMP_RAW;
  }
  console.log("v2 type: get raw");
  return DATATYPE.RAW;
}



//TODO: 

const getVitalsMain = async (query) => {
  console.log("getVitalsMain: query = ", query);
  if (getQueryType(query) == DATATYPE.BINNED) {
    const vitalsData = await getVitalsBinData(query);
    return getVitalsBin(vitalsData);

  } else if (getQueryType(query) == DATATYPE.CALC) {
    const vitalsData = await getVitalsCalcData(query)
    return getVitalsRaw(vitalsData);

  } else if (getQueryType(query) == DATATYPE.TEMP_RAW) {
    const vitalsData = await getVitalsTempData(query)
    return getVitalsRaw(vitalsData);

  } else if (getQueryType(query) == DATATYPE.RAW) {
    vitalsData = await getVitalsRawData(query);
    return getVitalsRaw(vitalsData); 

  } else {
    throw new InputInvalidError("getQueryType ERROR");
  }
  
};

module.exports = {
  getVitalsMain,
};
