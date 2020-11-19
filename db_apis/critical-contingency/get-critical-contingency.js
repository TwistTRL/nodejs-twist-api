/*
 * @Author: Peng Zeng
 * @Date: 2020-11-18 21:26:45
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-19 15:41:11
 */

const {
  getCriticalContingencyData,
} = require("../../database_access/critical-contingency/critical-contingency");

// remove val empty
// group by same time
const getCriticalContingency = async (binds) => {
  const result = await getCriticalContingencyData(binds);
  return result
    .filter((item) => item.RESULT_VAL && item.RESULT_VAL !== " ")
    .map((item) => ({
      encntr_id: item.ENCNTR_ID,
      performed_dt_tm_utc: item.PERFORMED_DT_TM_UTC,
      event_cd: item.EVENT_CD,
      display: item.DISPLAY,
      result_val: item.RESULT_VAL,
      display_order: null,
    }));
};

module.exports = {
  getCriticalContingency,
};
