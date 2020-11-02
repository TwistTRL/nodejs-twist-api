/*
 * @Author: Peng Zeng
 * @Date: 2020-10-31 15:51:26
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-01 11:26:22
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

// FIXME:
// ORA-01036: illegal variable name/number

const TWIST_SQL = require("./sql-each-table");
const { calculateIO } = require("./calc-io");
const { calculateFPC } = require("./calc-nutrition-fpc");
const { calculateNutriVolume } = require("./calc-nutrition-volume");
const { calculateNutriCalories } = require("./calc-nutrition-calories");
const { calculateMed } = require("./calc-med");
const { getMedVolume } = require("./get-med-volume");

const { redis, REDIS_EXPIRE_TIME } = require("../../config/redis-config");
const database = require("../../services/database");

var console_time_count = 0;

// get from redis cache. if no data, get from database then save to redis
const fetchThroughRedis = async (fetchSQL, fetchBinds, fetchName = "initFetch") => {
  const redisKey = `${fetchName}:${JSON.stringify(fetchBinds)}`;
  console.log("initFetch redisKey :", redisKey);
  console.time(fetchName);

  const reply = await redis.get(redisKey);
  if (reply) {
    console.log("~> from Redis cache: ", fetchName);
    console.timeEnd(fetchName);
    return JSON.parse(reply);
  } else {
    console.log("~> no Redis cache, SQL~~: " + fetchName);
    let rawRecord = await database.withConnection(
      async (conn, fetchBinds) => await conn.execute(fetchSQL, fetchBinds)
    )(fetchBinds);
    if (!rawRecord || !rawRecord.rows) {
      console.log("rawRecord error:>> ", rawRecord);
      return null;
    }
    redis.set(redisKey, JSON.stringify(rawRecord.rows), "ex", REDIS_EXPIRE_TIME);
    console.timeEnd(fetchName);
    return rawRecord.rows;
  }
};

const calcThroughtRedis = async (endpointFn, endpointKey, endpointInput, endpointName = "interface") => {
  let redisKey = `${endpointName}:${JSON.stringify(endpointKey)}`;
  console.log("endpoint redisKey :", redisKey);
  console.time(endpointName);
  const reply = await redis.get(redisKey);
  const result = (async reply => {
    if (reply) {
      console.log("==> from Redis cache");
      console.timeEnd(endpointName);
      return reply;
    } else {
      let res = endpointFn(endpointInput);
      redis.set(redisKey, JSON.stringify(res), "ex", REDIS_EXPIRE_TIME);
      console.timeEnd(endpointName);
      return res;
    }
  })(reply);
  return result;
};

const getInOutInit = async (mrn) => {
  console.time(`=== initial fetch from mrn: ${mrn}`);

  const arrPersonId = await fetchThroughRedis(TWIST_SQL.SQL_GET_PERSON_ID, { mrn }, "sql-personid");
  if (!arrPersonId || !arrPersonId.length) {
    console.warn("Error getting person id");
    return null;
  } else if (arrPersonId.length > 1) {
    console.log("arrPersonId (more than 1 person_id):", arrPersonId);
    console.warn("arrPersonId.length :", arrPersonId.length);
  }

  // since "ORDER BY BEG_EFFECTIVE_UNIX_TS DESC", person_id is the latest person_id for this MRN
  // from_ is 0 an to_ is ceil to current next hour
  // resolution is 1 hour
  const person_id = arrPersonId[0]["PERSON_ID"];
  const from_ = 0;
  const to_ = Math.ceil(new Date().getTime() / 1000 / 3600) * 3600;

  if (!person_id) {
    console.error("Error person_id: ", person_id);
    console.timeEnd(`=== initial fetch from mrn: ${mrn}`);
    return null;
  }

  let consoleTimeCount = console_time_count++;
  console.time("total-fetch" + consoleTimeCount);
  console.log("~~getting arrWeight");
  const arrWeight = await fetchThroughRedis(TWIST_SQL.SQL_GET_WEIGHT, { person_id }, "sql-weight");

  console.log("~~getting arrEN");
  const arrEN = await fetchThroughRedis(TWIST_SQL.SQL_GET_EN, { person_id, from_, to_ }, "sql-en");

  console.log("~~getting arrTPN");
  const arrTPN = await fetchThroughRedis(TWIST_SQL.SQL_GET_TPN, { person_id, from_, to_ }, "sql-tpn");

  console.log("~~getting arrLipids");
  const arrLipids = await fetchThroughRedis(TWIST_SQL.SQL_GET_TPN_LIPID, { person_id, from_, to_ }, "sql-lipids");

  console.log("~~getting arrInOut");
  const arrInOut = await fetchThroughRedis(TWIST_SQL.SQL_GET_IN_OUT_EVENT, { person_id, from_, to_ }, "sql-inout");

  console.log("~~getting arrDiluents");
  const arrDiluents = await fetchThroughRedis(TWIST_SQL.SQL_GET_DILUENTS, { person_id, from_, to_ }, "sql-diluents");

  console.log("~~getting arrIOMed");
  const arrIOMed = await fetchThroughRedis(TWIST_SQL.SQL_GET_IO_MED_VOL, { person_id, from_, to_ }, "sql-io-med");

  console.log("~~getting arrInfusions");
  const arrInfusions = await fetchThroughRedis(
    TWIST_SQL.SQL_INFUSIONS,
    { person_id },
    "sql-infusions"
  );
  const arrInfusionsUnits = await fetchThroughRedis(
    TWIST_SQL.SQL_INFUSIONS_UNIT,
    { person_id },
    "sql-infusions-units"
  );

  console.log("~~getting arrIntermittent");
  const arrIntermittent = await fetchThroughRedis(
    TWIST_SQL.SQL_INTERMITTENT,
    { person_id },
    "sql-intermittent"
  );

  console.log("~~getting arrSuction");
  const arrSuction = await fetchThroughRedis(TWIST_SQL.SQL_SUCTION, { person_id }, "sql-suction");
  console.timeEnd("total-fetch" + consoleTimeCount);

  console.log("~~calculating");
  console.time("total-calculate" + consoleTimeCount);
  // calcThroughtRedis(calc_function, redis_key, calc_input, redis_name)
  // using query as redisKey  
  const resolution = 3600;
  const from = from_; // from_ === 0
  const to = to_;
  const query = { person_id, from, to, resolution };
  console.log("query :>> ", query);

  let calcInput = {
    arrEN,
    arrTPN,
    arrLipids,
    arrInOut,
    arrDiluents,
    arrIOMed,
    resolution,
    from,
    to,
  };
  const ioRes = await calcThroughtRedis(calculateIO, query, calcInput, "interface-inout");
  console.log("ioRes finished");
  console.log("ioRes.length :", ioRes.length);

  calcInput = { arrEN, arrTPN, arrLipids, arrDiluents, arrWeight };
  const nutriFPCRes = await calcThroughtRedis(
    calculateFPC,
    query,
    calcInput,
    "interface-nutri-fpc"
  );
  console.log("fpcRes finished");
  console.log("nutriFPCRes.length :", nutriFPCRes.length);

  calcInput = { arrIntermittent };
  const arrMedVolume = await calcThroughtRedis(
    getMedVolume,
    query,
    calcInput,
    "middle-med-volume"
  );
  console.log("arrMedVolume.length :", arrMedVolume.length);

  calcInput = { arrEN, arrTPN, arrLipids, arrDiluents, arrMedVolume, arrWeight, resolution, from };
  const nutriVolumeRes = await calcThroughtRedis(
    calculateNutriVolume,
    query,
    calcInput,
    "interface-nutri-volume"
  );

  console.log("nutriVolumeRes.length :", nutriVolumeRes.length);
  calcInput = { arrEN, arrTPN, arrLipids, arrDiluents, arrWeight, resolution, from };
  const nutriCaloriesRes = await calcThroughtRedis(
    calculateNutriCalories,
    query,
    calcInput,
    "interface-nutri-calories"
  );

  calcInput = { arrInfusions, arrIntermittent, arrSuction, arrInfusionsUnits };
  const medRes = await calcThroughtRedis(calculateMed, query, calcInput, "interface-med");

  calcInput = { arrWeight };
  const weightRes = await calcThroughtRedis((x) => x, query, calcInput, "interface-weight");
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
  getInOutInit,
};
