/*
 * @Author: Peng
 * @Date: 2020-04-07 15:40:54
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-12 18:52:42
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

const database = require("../../services/database");
const TWIST_SQL = require("./sql-each-table");
const { initFetchToRedis, calcEndpointToRedis } = require("../../config/redis-config");
const { calculateIOTooltips } = require("./calc-io-tooltips");
const { calculateIO } = require("./calc-io");
const { calculateFPC } = require("./calc-nutrition-fpc");
const { calculateNutriVolume } = require("./calc-nutrition-volume");
const { calculateNutriCalories } = require("./calc-nutrition-calories");
const { calculateMed } = require("./calc-med");

var console_time_count = 0;

const getInitialFetch = async (mrn) => {
  // let redisKey = `sql-personid:${JSON.stringify(mrn)}`;
  let person_id;

  let arrPersonId = await initFetchToRedis(TWIST_SQL.SQL_GET_PERSON_ID, mrn, "sql-personid");
  console.log("arrPersonId :", arrPersonId);

  if (!arrPersonId || !arrPersonId.length) {
    console.warn("Error getting person id");
  } else if (arrPersonId.length > 1) {
    console.log('arrPersonId :', arrPersonId);
    console.log('arrPersonId.length :', arrPersonId.length);
  }

  console.log('arrPersonId :', arrPersonId);
  person_id = arrPersonId[0]["PERSON_ID"];
  console.log('person_id :', person_id);

  let from = 0;
  let to = Math.ceil(new Date().getTime() / 1000 / 86400) * 86400;
  let resolution = 3600;
  let query = { person_id, from, to, resolution };

  let consoleTimeCount = console_time_count++;
  console.time("totalFetch" + consoleTimeCount);
  const arrWeight = await initFetchToRedis(TWIST_SQL.SQL_GET_WEIGHT, query, "sql-weight");
  console.log('~~arrWeight :', arrWeight);
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
  console.timeEnd("totalFetch" + consoleTimeCount);

console.time("totalCalculate" + consoleTimeCount);
  const ioRes = calcEndpointToRedis(calculateIO, ({ arrEN, arrTPN, arrLipids, arrInOut, arrDiluents }, query), "interface-inout");
  const nutriFPCRes = calcEndpointToRedis(calculateFPC, { arrEN, arrTPN, arrLipids, arrDiluents, arrWeight }, "interface-nutri-fpc");
  const nutriVolumeRes = calcEndpointToRedis(
    calculateNutriVolume,
    ({ arrTPN, arrTpnLipid, arrEN, arrDiluents, arrInout, arrMed, arrWeight }, query),
    "interface-nutri-volume"
  );
  const nutriCaloriesRes = calcEndpointToRedis(
    calculateNutriCalories,
    ({ arrEN, arrTPN, arrLipids, arrDiluents, arrWeight }, query),
    "interface-nutri-calories"
  );
  const medRes = calcEndpointToRedis(calculateMed, { arrInfusions, arrIntermittent, arrSuction, arrInfusionsUnits }, "interface-med");
  const weightRes = calcEndpointToRedis((x) => x, arrWeight, "interface-weight");
  console.timeEnd("totalCalculate" + consoleTimeCount);
  return {
    inoutSize: ioRes.length,
    nutriFpcSize: nutriFPCRes.length,
    nutriVolumeSize: nutriVolumeRes.length,
    nutriCaloriesSize: nutriCaloriesRes.length,
    medSize: medRes.length,
  };

};

module.exports = {
  getInitialFetch,
};
