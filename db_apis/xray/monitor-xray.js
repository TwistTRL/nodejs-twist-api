/*
 * @Author: Peng Zeng 
 * @Date: 2021-01-14 17:30:56 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-14 17:36:49
 */

const TRLDSC2_SERVER = "http://10.7.46.137:7001/images/";

const fetch = require("node-fetch");

const checkServerStat = (name) => {
  if (name === "trldsc2") {
    const response = await fetch(TRLDSC2_SERVER + "stat/self")
    return await response.json();
  } else if (name === "synapse") {
    const response = await fetch(TRLDSC2_SERVER + "stat/synapse")
    return await response.json();
  }
  return null;

}

module.exports = {
  checkServerStat,  
};
