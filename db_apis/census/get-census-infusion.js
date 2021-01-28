/*
 * @Author: Peng Zeng
 * @Date: 2020-12-10 20:09:00
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-28 13:18:47
 */

const { getCensusInfusionsData } = require("../../database_access/census/census-infusion");

// TODO: add to census page
async function getCensusInfusions(person_id, cutoff_unix) {
  // const cutoff_unix = Math.floor(Date.now() / 1000) - 8 * 60 * 60;
  const binds = {
    person_id,
    cutoff_unix,
  }

  const censusInfusions8HoursData = await getCensusInfusionsData(binds);
  return censusInfusions8HoursData.map((item) => ({
    drug: item.DRUG,
    infusion_rate: item.INFUSION_RATE,
    infusion_rate_units: item.INFUSION_RATE_UNITS,
    rxcui: item.RXCUI,
    end_unix: item.END_UNIX,
  }));
}

module.exports = {
  getCensusInfusions,
};
