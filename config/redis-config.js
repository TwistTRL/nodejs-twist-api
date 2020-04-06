/*
 * @Author: Peng 
 * @Date: 2020-04-06 10:31:08 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-06 10:37:16
 */

//~~~~~~~~~~ REDIS SETTINGS ~~~~~~~~
const REDIS_PORT = 6379; // redis default port is 6379
const USE_CACHE = false; // if true, will use redis cache
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


const redis = require("redis");
// create and connect redis client to local instance.
const client = redis.createClient(REDIS_PORT);

client.on("error", (err) => {
  console.log("Error " + err);
});

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
const getApiFromRedis = async (res, apiFn, apiInput, apiName = "api", apiExpireTime = 3600 * 24) => {
  if (USE_CACHE) {
    let redisKey = `${apiName}:${JSON.stringify(apiInput)}`;
    console.log("redisKey :", redisKey);
    console.time(apiName);
    // Try fetching the result from Redis first in case we have it cached
    client.get(redisKey, async (err, reply) => {
      if (USE_CACHE && reply) {
        res.send(reply);
        console.log("-> from cache");
        console.timeEnd(apiName);
      } else {
        let toSend = await apiFn(apiInput);
        // Save the API response in Redis store,  data expire time in 3600*24 seconds, it means one day
        client.setex(redisKey, apiExpireTime, JSON.stringify(toSend));
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

module.exports = {
  getApiFromRedis,
};
