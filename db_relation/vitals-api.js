/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-17 11:25:51 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-22 15:00:40
 */

const {
  VITALS_DICT,
} = require("twist-xlsx");

// TODO: now added SPO2 so all the keys could be captialized.
VITALS_DICT.SPO2 = VITALS_DICT.SpO2;

module.exports = {
  VITALS_DICT,
};
