/*
 * @Author: Peng
 * @Date: 2020-04-06 10:31:08
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-22 21:23:44
 */

//~~~~~~~~~~ REDIS SETTINGS ~~~~~~~~
// redis default port is 6379
const REDIS_PORT = 6379; 

// if true, will use redis cache
const USE_CACHE = true; 

// redis cache expire after this time in seconds
const TWO_HOURS = 7200;
const REDIS_EXPIRE_TIME = process.env.NODE_ENV === "development" ? 120 : TWO_HOURS; 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const Redis = require("ioredis");
const redis = new Redis(REDIS_PORT);
const database = require("../services/database");

/**
 * 
 * @param {*} res 
 * @param {*} apiFn 
 * @param {*} apiInput 
 * @param {*} apiName 
 * @param {*} apiExpireTime 
 * 
 * note: redisKey = `${apiName}:${JSON.stringify(apiInput)}`;
 * 
 * use as:
 * 
    router.get("/:id", async (req, res) => {
      getApiFromRedis(res, apiForGetIdInfo, req.params.id, "id");
    });
 */
const getApiFromRedis = async (res, apiFn, apiInput, apiName = "api", expireTime = REDIS_EXPIRE_TIME) => {
  if (USE_CACHE) {
    let redisKey = `${apiName}:${JSON.stringify(apiInput)}`;
    console.log("redisKey :", redisKey);
    console.time(apiName);
    // Try fetching the result from Redis first in case we have it cached
    redis.get(redisKey, async (err, reply) => {
      if (USE_CACHE && reply) {
        res.send(reply);
        console.log("==> api from redis cache");
        console.timeEnd(apiName);
      } else {
        let toSend = await apiFn(apiInput);
        // Save the API response in Redis store,  data expire time in 3600*24 seconds, it means one day
        redis.set(redisKey, JSON.stringify(toSend), "ex", expireTime);
        res.send(toSend);
        console.timeEnd(apiName);
      }
    });
  } else {
    try {
      let toSend = await apiFn(apiInput);
      res.send(toSend);
      return;
    } catch (error) {
      console.log(new Date());
      console.log(error);
      res.status(400);
      res.send(error.toString());
    }
  }
};

const tryFetchFromRedis = async (endpointKey, endpointName) => {
  if (!USE_CACHE) {
    return false;
  }
  let redisKey = `${endpointName}:${JSON.stringify(endpointKey)}`;
  console.log("fetching from redis for redisKey :", redisKey);
  console.time(endpointName);
  const reply = await redis.get(redisKey);
  if (reply) {
    console.log("==> from redis cache");
    console.timeEnd(endpointName);
    return reply;
  } else {   
    console.log("==> no redis cache"); 
    return false;
  }
};

const initFetchToRedis = async (fetchFn, fetchInput, fetchName = "initFetch") => {
  let redisKey = `${fetchName}:${JSON.stringify(fetchInput)}`;
  console.log("initFetch redisKey :", redisKey);
  console.time(fetchName);
  const reply = await redis.get(redisKey);

  const result = await (async (reply) => {
    if (reply) {
      console.log("~> from cache");
      console.timeEnd(fetchName);
      return JSON.parse(reply);
    } else {
      console.log("~~SQL~~: " + fetchName + "\n" + fetchFn(fetchInput));
      let rawRecord = await database.withConnection(async (conn, fetchInput) => await conn.execute(fetchFn(fetchInput)))(fetchInput);
      redis.set(redisKey, JSON.stringify(rawRecord.rows), "ex", REDIS_EXPIRE_TIME);
      console.timeEnd(fetchName);
      return rawRecord.rows;
    }
  })(reply);

  return result;
};

const calcEndpointToRedis = async (endpointFn, endpointKey, endpointInput, endpointName = "interface") => {
  let redisKey = `${endpointName}:${JSON.stringify(endpointKey)}`;
  console.log("endpoint redisKey :", redisKey);
  console.time(endpointName);
  const reply = await redis.get(redisKey);
  const result = (async reply => {
    if (reply) {
      console.log("==> from cache");
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

module.exports = {
  getApiFromRedis,
  initFetchToRedis,
  calcEndpointToRedis,
  redis,
  REDIS_EXPIRE_TIME,
  tryFetchFromRedis, 
};
