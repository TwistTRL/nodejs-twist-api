/*
 * @Author: Peng Zeng
 * @Date: 2020-12-10 20:09:00
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-28 22:17:21
 */

const { getCensusInfusionsData } = require("../../database_access/census/census-infusion");

async function getCensusInfusions(binds) {  
  const censusInfusionsData = await getCensusInfusionsData(binds);
  return censusInfusionsData; 
}

module.exports = {
  getCensusInfusions,
};
