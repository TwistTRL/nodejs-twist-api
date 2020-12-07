/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-06 20:53:32 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-06 20:54:50
 */

const moment = require("moment");
const { getCensusInitData } = require("../../database_access/census/census-init");

async function getCensusInit(timestamp) {
  if (!timestamp) {
    // now
    timestamp = Math.floor(Date.now() / 1000);
  }
  const censusInitData = await getCensusInitData({ timestamp });  
  return censusInitData;
}

module.exports = {
  getCensusInit,
};
