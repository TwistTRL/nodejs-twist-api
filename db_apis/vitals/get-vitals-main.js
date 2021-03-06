/*
 * @Author: Peng Zeng
 * @Date: 2020-12-03 12:58:19
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-22 15:46:51
 */

const isValidJson = require("../../utils/isJson");
const InputInvalidError = require("../../utils/errors").InputInvalidError;
const { getVitalsRaw } = require("./get-vitals-raw");
const { getVitalsBin } = require("./get-vitals-bin");
const { getVitalsCalc } = require("./get-vitals-calc");
const { getTempRaw } = require("./get-vitals-temp-raw");

const {getVitalsBinDef} = require('../../database_access/vitals/vitals-bin-def');
const {getVitalsRawData} = require('../../database_access/vitals/vitals-raw');
const {getVitalsBinData} = require('../../database_access/vitals/vitals-bin');
const {getVitalsCalcData} = require('../../database_access/vitals/vitals-calc');
const {getVitalsTempData} = require('../../database_access/vitals/vitals-temp');

const { VITALS_DICT } = require("../../db_relation/vitals-api");

const DATA_TYPE = "data_type";
const DATA_RESOLUTION = "data_resolution";
const catPersonId = "person_id";
const catVitalType = "vital_type";
const catFrom = "from";
const catTo = "to";
const CAT_TYPE_ARRAY = ["binned", "calc"];
const CAT_RESOLUTION_ARRAY = ["1D", "12H", "5H", "5M"];

const DATATYPE = Object.freeze({
  BINNED: "binned",
  CALC: "calc",
  RAW: "raw",
  TEMP_RAW: "temp_raw",
});

function getQueryType(query) {
  if (Object.entries(query).length === 0 && query.constructor === Object) {
    console.error("query empty");
    throw new InputInvalidError("Input not valid, so query is empty.");
  }

  if (!isValidJson.validate_vitals_sampled(query) && !isValidJson.validate_vitals_raw(query)) {
    console.warn(query + " : not json");
    throw new InputInvalidError("Input not in valid json");
  }

  const validInputType = [...Object.keys(VITALS_DICT), ...Object.keys(VITALS_DICT).map(x=>x.toLowerCase())];
  if (!validInputType.includes(query[catVitalType])) {
    console.warn("catVitalType no included: " + query[catVitalType]);
    throw new InputInvalidError(
      `vital_type not valid: ${query[catVitalType]}.
      All vital_type: ${Object.keys(VITALS_DICT)}.`
    );
  }
  if (query[catPersonId] == null) {
    console.warn("catPersonId is null");
    throw new InputInvalidError("person_id is null");
  }

  if (query[DATA_TYPE] != null && query[DATA_TYPE] !== "raw") {
    if (!CAT_TYPE_ARRAY.includes(query[DATA_TYPE])) {
      throw new InputInvalidError('"data_type" is not valid. All "data_type": "binned", "calc".');
    }

    if (query[DATA_RESOLUTION] == null || !CAT_RESOLUTION_ARRAY.includes(query[DATA_RESOLUTION])) {
      console.log("query[DATA_RESOLUTION] :>> ", query[DATA_RESOLUTION]);
      throw new InputInvalidError(
        '"data_resolution" is not valid. All "data_resolution": "1D","12H", "5H", "5M".'
      );
    }

    console.log("~~~ type: get down sampled");
    if (query[DATA_TYPE] == CAT_TYPE_ARRAY[0]) {
      return DATATYPE.BINNED;
    } else {
      return DATATYPE.CALC;
    }
  }

  let currentTime = new Date().getTime() / 1000;
  let year2000Time = 946684800;
  if (
    query[catFrom] == null ||
    query[catFrom] > currentTime + 10 ||
    query[catFrom] < year2000Time
  ) {
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


const getVitalsMain = async (query) => {
  console.log("getVitalsMain: query = ", query);
  const { vital_type, person_id, data_resolution, from, to } = query;
  const input_vital_type = vital_type.toUpperCase();
  console.log('input_vital_type :>> ', input_vital_type);

  const query_type = getQueryType(query);

  if (query_type == DATATYPE.BINNED) {
    console.log('DATATYPE is BINNED :>> ', DATATYPE.BINNED);
    const bin_def = await getVitalsBinDef({ input_vital_type });
    if (!bin_def) {
      return null;
    }
    const bin_data = await getVitalsBinData({ bin_def, input_vital_type, person_id, data_resolution});
    const ret = getVitalsBin(bin_data, bin_def);
    return ret;
  }

  if (query_type == DATATYPE.CALC) {
    const vitalsCalcData = await getVitalsCalcData({ input_vital_type, person_id, data_resolution});
    return getVitalsCalc(vitalsCalcData);
  }

  if (query_type == DATATYPE.TEMP_RAW) {
    const vitalsTempRawData = await getVitalsTempData({person_id, vital_type, from_: from, to_: to});
    return getTempRaw(vitalsTempRawData);
  }

  if (query_type == DATATYPE.RAW) {
    const vitalsRawData = await getVitalsRawData({person_id, input_vital_type, from_: from, to_: to});
    const { vitals_result, vital_v500_result, vital_aims_result } = vitalsRawData;

    console.log("vitals_result.length :>> ", vitals_result ? vitals_result.length : 0);
    console.log("vital_v500_result.length :>> ", vital_v500_result ? vital_v500_result.length : 0);
    console.log("vital_aims_result.length :>> ", vital_aims_result ? vital_aims_result.length : 0);
    return getVitalsRaw(vitalsRawData);
  } 
  
    throw new InputInvalidError("getQueryType ERROR");
 
    
};

module.exports = {
  getVitalsMain,
};
