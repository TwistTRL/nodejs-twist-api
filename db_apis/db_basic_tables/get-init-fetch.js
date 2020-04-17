/*
 * @Author: Peng
 * @Date: 2020-04-07 15:40:54
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-17 15:38:09
 */

/**
 * arrInOut from table `INTAKE_OUTPUT`,
 * arrDiluents from table `DRUG_DILUENTS`,
 * arrTPN from table `TPN`,
 * arrEN from table `EN`,
 * arrLipids from table `TPN_LIPIDS`
 *
 *
 * unit is mL only, because
 * `select distinct INFUSION_RATE_UNITS from drug_diluents` is `mL/hr`
 *
 *
 */

const TWIST_SQL = require("./sql-each-table");
const { initFetchToRedis, calcEndpointToRedis } = require("../../config/redis-config");
const { calculateIOTooltips } = require("./calc-io-tooltips");
const { calculateIO } = require("./calc-io");
const { calculateFPC } = require("./calc-nutrition-fpc");
const { calculateNutriVolume } = require("./calc-nutrition-volume");
const { calculateNutriCalories } = require("./calc-nutrition-calories");
const { calculateMed } = require("./calc-med");
const { getMedVolume } = require("./get-med-volume");

var console_time_count = 0;

const getInitialFetch = async (mrn) => {
  let person_id;
  console.time(`=== initial fetch from mrn: ${mrn}`);

  let arrPersonId = await initFetchToRedis(TWIST_SQL.SQL_GET_PERSON_ID, mrn, "sql-personid");

  if (!arrPersonId || !arrPersonId.length) {
    console.warn("Error getting person id");
  } else if (arrPersonId.length > 1) {
    console.log("arrPersonId :", arrPersonId);
    console.warn("arrPersonId.length :", arrPersonId.length);
  }
  person_id = arrPersonId[0]["PERSON_ID"];
  console.log("person_id :", person_id);
  if (!person_id) {
    console.error("Error person_id: ", person_id);
  console.timeEnd(`=== initial fetch from mrn: ${mrn}`);

    return null;
  }


  let from = 0;
  let to = Math.ceil(new Date().getTime() / 1000 / 86400) * 86400;
  let resolution = 3600;
  let query = { person_id, from, to, resolution };

  let consoleTimeCount = console_time_count++;
  console.time("total-fetch" + consoleTimeCount);
  const arrWeight = await initFetchToRedis(TWIST_SQL.SQL_GET_WEIGHT, query, "sql-weight");

  console.log("~~arrWeight finished");
  const arrEN = await initFetchToRedis(TWIST_SQL.SQL_GET_EN, query, "sql-en");
  console.log("~~arrEN");

  const arrTPN = await initFetchToRedis(TWIST_SQL.SQL_GET_TPN, query, "sql-tpn");
  console.log("~~arrTPN");

  const arrLipids = await initFetchToRedis(TWIST_SQL.SQL_GET_TPN_LIPID, query, "sql-lipids");
  console.log("~~arrLipids");
  const arrInOut = await initFetchToRedis(TWIST_SQL.SQL_GET_IN_OUT_EVENT, query, "sql-inout");
  const arrDiluents = await initFetchToRedis(TWIST_SQL.SQL_GET_DILUENTS, query, "sql-diluents");

  const arrInfusions = await initFetchToRedis(TWIST_SQL.SQL_INFUSIONS, query, "sql-infusions");
  const arrInfusionsUnits = await initFetchToRedis(TWIST_SQL.SQL_INFUSIONS_UNIT, query, "sql-infusions-units");
  const arrIntermittent = await initFetchToRedis(TWIST_SQL.SQL_INTERMITTENT, query, "sql-intermittent");
  const arrSuction = await initFetchToRedis(TWIST_SQL.SQL_SUCTION, query, "sql-suction");
  console.timeEnd("total-fetch" + consoleTimeCount);

  console.time("total-calculate" + consoleTimeCount);
  // calcEndpointToRedis(calc_function, redis_key, calc_input, redis_name)
  // using query as redisKey
  let calcInput = {arrEN, arrTPN, arrLipids, arrInOut, arrDiluents, resolution, from, to};
  const ioRes = await calcEndpointToRedis(calculateIO, query, calcInput, "interface-inout");
  console.log("ioRes finished");
  console.log('ioRes.length :', ioRes.length);

  calcInput = {arrEN, arrTPN, arrLipids, arrDiluents, arrWeight};
  const nutriFPCRes = await calcEndpointToRedis(calculateFPC, query, calcInput, "interface-nutri-fpc");
  console.log("fpcRes finished");
  console.log('nutriFPCRes.length :', nutriFPCRes.length);

  calcInput = {arrIntermittent};
  const arrMedVolume = await calcEndpointToRedis(getMedVolume, query, calcInput, "middle-med-volume");
  console.log('arrMedVolume.length :', arrMedVolume.length);

  calcInput = {arrEN, arrTPN, arrLipids, arrDiluents, arrMedVolume, arrWeight, resolution, from};  
  const nutriVolumeRes = await calcEndpointToRedis(calculateNutriVolume, query, calcInput, "interface-nutri-volume");

  console.log('nutriVolumeRes.length :', nutriVolumeRes.length);
  calcInput = {arrEN, arrTPN, arrLipids, arrDiluents, arrWeight, resolution, from};  
  const nutriCaloriesRes = await calcEndpointToRedis(calculateNutriCalories, query, calcInput, "interface-nutri-calories");

  calcInput = {arrInfusions, arrIntermittent, arrSuction, arrInfusionsUnits};  
  const medRes = await calcEndpointToRedis(calculateMed, query, calcInput, "interface-med");
    
  calcInput = {arrWeight};
  const weightRes = await calcEndpointToRedis((x) => x, query, calcInput, "interface-weight");
  console.timeEnd("total-calculate" + consoleTimeCount);

  console.timeEnd(`=== initial fetch from mrn: ${mrn}`);

  return {
    inoutSize: ioRes.length,
    nutriFpcSize: nutriFPCRes.length,
    nutriVolumeSize: nutriVolumeRes.length,
    nutriCaloriesSize: nutriCaloriesRes.length,
    medSize: medRes.length,
    weightSize: weightRes.length,
  };
};

module.exports = {
  getInitialFetch,
};
