/*
 * @Author: Peng
 * @Date: 2020-04-06 10:31:08
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-10 19:04:31
 */

//~~~~~~~~~~ REDIS SETTINGS ~~~~~~~~
const REDIS_PORT = 6379; // redis default port is 6379
const USE_CACHE = true; // if true, will use redis cache
const REDIS_EXPIRE_TIME = 60; // redis cache expire after this time in seconds
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const database = require("../services/database");

const Redis = require("ioredis");
const redis = new Redis(REDIS_PORT);

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
const getApiFromRedis = async (res, apiFn, apiInput, apiName = "api") => {
  if (USE_CACHE) {
    let redisKey = `${apiName}:${JSON.stringify(apiInput)}`;
    console.log("redisKey :", redisKey);
    console.time(apiName);
    // Try fetching the result from Redis first in case we have it cached
    redis.get(redisKey, async (err, reply) => {
      if (USE_CACHE && reply) {
        res.send(reply);
        console.log("-> from cache");
        console.timeEnd(apiName);
      } else {
        let toSend = await apiFn(apiInput);
        // Save the API response in Redis store,  data expire time in 3600*24 seconds, it means one day
        redis.set(redisKey, JSON.stringify(toSend), "ex", REDIS_EXPIRE_TIME);
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

const initFetchToRedis = async (fetchFn, fetchInput, fetchName = "initFetch") => {
  let redisKey = `${fetchName}:${JSON.stringify(fetchInput)}`;
  console.log("initFetch redisKey :", redisKey);
  console.time(fetchName);
  const reply = await redis.get(redisKey);

  const result = await (async (reply) => {
    if (reply) {
      console.log("~> from cache");
      console.timeEnd(fetchName);
      return reply;
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

const calcEndpointToRedis = async (endpointFn, endpointInput, endpointName = "interface") => {
  let redisKey = `${endpointName}:${JSON.stringify(endpointInput)}`;
  console.log("endpoint redisKey :", redisKey);
  console.time(endpointName);
  const reply = await redis.get(redisKey);
  const result = (reply => {
    if (reply) {
      console.log("~> from cache");
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
};
