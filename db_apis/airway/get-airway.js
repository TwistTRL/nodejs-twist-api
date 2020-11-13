/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 20:55:38
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 21:05:04
 */

const moment = require("moment");
const { getAirwayAims } = require("./get-airway-aims");
const { getAirwayV500 } = require("./get-airway-v500");

const getAirway = async (binds) => {
  const aimsData = await getAirwayAims(binds);
  const v500Data = await getAirwayV500(binds);
  const result = [
    ...aimsData.map((x) => ({ ...x, _source: "aims" })),
    ...v500Data.map((x) => ({ ...x, _source: "v500" })),
  ].sort((a, b) => moment(a.time) - moment(b.time));
  return result;
};

module.exports = {
  getAirway,
};
