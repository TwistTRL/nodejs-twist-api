/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-03 12:58:19 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-03 14:18:34
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

function _getQueryType(query) {
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



async function tempVitalSQLExecutor(conn, query) {
  console.log("~~SQL for get raw temp from V500: ", SQL_GET_TEMP_V500_RAW(query.person_id, query.from, query.to));
  // console.time("temp-vitals");
  let raw1 = await conn.execute(SQL_GET_TEMP_V500_RAW(query.person_id, query.from, query.to));
  // console.timeEnd("temp-vitals");
  console.log("~~SQL for get raw temp from VITALS: ", SQL_GET_TEMP_VITALS_RAW(query.person_id, query.from, query.to));
  let raw2 = await conn.execute(SQL_GET_TEMP_VITALS_RAW(query.person_id, query.from, query.to));

  let result = [];
  if (raw1.rows && raw1.rows.length) {
    raw1.rows.forEach((element) => {
      let time = element.DTUNIX;
      let value;
      let type;
      if (element.TEMPERATURE) {
        value = element.TEMPERATURE;
        type = "TEMPERATURE";
      } else if (element.TEMPERATURE_ESOPH) {
        value = element.TEMPERATURE_ESOPH;
        type = "TEMPERATURE_ESOPH";
      } else {
        value = element.TEMPERATURE_SKIN;
        type = "TEMPERATURE_SKIN";
      }
      result.push({ time, value, type });
    });
  }
  if (raw2.rows && raw2.rows.length) {
    raw2.rows.forEach((element) => {
      let time = element.DTUNIX;
      let value = element.TEMP1;
      let type = "VITALS";
      result.push({ time, value, type });
    });
  }

  console.log('temperature result.length :>> ', result.length);
  return result.sort((a, b) => a.time - b.time);
}

//TODO: 

const getVitalsQueryV2 = database.withConnection(async function (conn, query) {
  console.log("getVitalsQueryV2: query = ", query);
  if (_getQueryType(query) == DATATYPE.BINNED) {
    return await vitalsBinnedQuerySQLExecutor(conn, query);
  } else if (_getQueryType(query) == DATATYPE.CALC) {
    return await vitalsCalcQuerySQLExecutor(conn, query);
  } else if (_getQueryType(query) == DATATYPE.TEMP_RAW) {
    return await tempVitalSQLExecutor(conn, query);
  } else if (_getQueryType(query) == DATATYPE.RAW) {
    return await vitalsRawQuerySQLExecutor(conn, query);
  } else {
    throw new InputInvalidError("_getQueryType ERROR");
  }
});

module.exports = {
  getVitalsQueryV2,
};
