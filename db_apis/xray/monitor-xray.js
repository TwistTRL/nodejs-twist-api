/*
 * @Author: Peng Zeng
 * @Date: 2021-01-14 17:30:56
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-17 02:10:36
 */

const TRLDSC2_SERVER = "http://10.7.46.137:7001/";

const fetch = require("node-fetch");

const checkServerStat = async (name) => {
  if (name === "trldsc2") {
    const stat = await fetch(TRLDSC2_SERVER + "stat/self");
    return await stat.json();
  } else if (name === "synapse") {
    const stat = await fetch(TRLDSC2_SERVER + "stat/synapse");
    return await stat.json();
  }
  return null;
};

module.exports = {
  checkServerStat,
};
