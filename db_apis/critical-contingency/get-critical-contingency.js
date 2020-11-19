/*
 * @Author: Peng Zeng
 * @Date: 2020-11-18 21:26:45
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-19 09:32:40
 */

const {
  getCriticalContingencyData,
} = require("../../database_access/critical-contingency/critical-contingency");

const getCriticalContingency = async (binds) => {
  const result = await getCriticalContingencyData(binds);
  return result.map((item) => ({
    encntr_id: item.ENCNTR_ID,
    performed_dt_tm: item.PERFORMED_DT_TM,
    event_cd: item.EVENT_CD,
    display: item.DISPLAY,
    result_val: item.RESULT_VAL,
    display_order: null,
  }));
};

module.exports = {
  getCriticalContingency,
};
