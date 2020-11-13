/*
 * @Author: Peng Zeng 
 * @Date: 2020-11-12 16:48:10 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 17:10:06
 */


const {getVesselData} = require("../../database_access/vessel/vessel");

module.exports = {
  getVessel: getVesselData,
};
