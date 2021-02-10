/*
 * @Author: Peng
 * @Date: 2020-03-27 10:26:44
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-10 11:27:36
 */

const database = require("../services/database");
const { ECMO_DICT } = require("../db_relation/ecmo-db-relation");

const GET_ECMO_SQL = `
SELECT
  MODE_1,
  LVAD_VOLUME,
  LVAD_RATE,
  LVAD_SP,
  LVAD_DP,
  LVAD_STM,
  LVAD_FILLING,
  LVAD_EJECTION,
  LVAD_DEPOS,
  LVAD_DEPOS2,
  RVAD_VOLUME,
  RVAD_RATE,
  RVAD_SP,
  RVAD_DP,
  RVAD_STM,
  RVAD_FILLING,
  RVAD_EJECTION,
  RVAD_DEPOS,
  RVAD_DEPOS2,
  BERLIN_OUT_DEPOS,
  BERLIN_OUT_DEPOS2,
  BERLIN_CLOT,
  BERLIN_CLOT2,
  BERLIN_NOTE,
  ECMO_NOTE,
  DRAINAGE,
  REINFUSION,
  ECMO_DAY,
  ECMO_HR,
  ECMO_CIR_HR,
  ECMO_CIR_NUM,
  ECMO_CIR_TP,
  ECMO_ECPR,
  ECMO_FLOW_TT,
  ECMO_FLOW_SET,
  ECMO_FLOW_SET2,
  ECMO_RPM,
  ECMO_FIO2,
  ECMO_O2SWP,
  ECMO_FCO2,
  ECMO_MAP_TT,
  ECMO_HCT_TT,
  ECMO_PLT_TT,
  ECMO_TEMP_TT,
  ECMO_UF_TT,
  ECMO_FLOW,
  ECMO_FLOW_MEAS,
  ECMO_FLOW_MEAS2,
  ECMO_FLOW_NORM,
  ECMO_SERVO,
  ECMO_PREP1,
  ECMO_POSTP1,
  ECMO_POSTP2,
  ECMO_PREP2,
  ECMO_SVO2,
  ECMO_SVO22,
  ECMO_UF,
  ECMO_CIR_CLTS,
  QUAD_CIR_NUM,
  QUAD_CLTS,
  QUAD_DAY,
  QUAD_HR,
  QUAD_FLOW,
  QUAD_NOTES,
  QUAD_SWEEP,
  RTF_FLOW_MEAS,
  RTF_IN_DEPOS,
  RTF_NOTES,
  RTF_NOTES2,
  RTF_OUT_DEPOS,
  RTF_OUT_DEPOS2,
  RTF_RPM,
  HM3_MODE,
  HM3_PI,
  HM3_POWER,
  HM3_RPM,
  HW_CO,
  HW_MODE,
  HW_POWER,
  HW_PULSATILITY,
  HW_SPEED,
  HW_TROUGH,
  IMP_ART,
  IMP_CO,
  IMP_CURRENT,
  IMP_DEPTH,
  IMP_LEVEL,
  IMP_PURGE,
  IMP_SIDE,
  IMP_SIZE,
  HM3_CO,
  ABIO_CI,
  ABIO_CLT,
  ABIO_CLT_DES,
  ABIO_MODE,
  EVENT_END_DT_TM_UTC AS TIME,
  ECMO_VAD_SCORE
FROM ECMO_VAD
WHERE PERSON_ID = :person_id
ORDER BY EVENT_END_DT_TM_UTC
`;

// MODE_1 then column, send all of the data from that table, including display name, display units, display order, and section.
const getECMO = async (binds) => {
  const getEcmoQuery = database.withConnection(async (conn, binds) => {
    await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
    return await conn.execute(GET_ECMO_SQL, binds).then((res) => res.rows);
  });

  console.log('binds :>> ', binds);

  const now = Date.now();
  console.time("get-ECMO-sql" + now);
  let arrECMO = await getEcmoQuery(binds);
  console.timeEnd("get-ECMO-sql" + now);

  // console.log('arrECMO :>> ', arrECMO);
  if (!arrECMO) {
    console.log('arrECMO :>> ', arrECMO);
    return [];
  }

  const ret = [];
  let countNullMode = 0;

  arrECMO.forEach((element) => {
    const modes = Object.keys(ECMO_DICT).filter(
      (basic_mode) => element.MODE_1 && element.MODE_1.includes(basic_mode)
    );

    if (!modes.length) {
      countNullMode++;
      return;
    }

    for (const mode of modes) {
      const ecmo_data = Object.keys(ECMO_DICT[mode])
        .map((item) => ({
          name: ECMO_DICT[mode][item].RSS_COLUMN,
          value: element[item],
          section: ECMO_DICT[mode][item].SECTION,
          display_order: ECMO_DICT[mode][item].DISPLAY_ORDER,
          display_name: ECMO_DICT[mode][item].DISPLAY_NAME,
          display_units: ECMO_DICT[mode][item].DISPLAY_UNITS,
        }))
        .filter((item) => item.value !== null)
        .sort((a, b) => a.display_order - b.display_order);
      ret.push({
        time: element.TIME,
        ecmo_score: element.ECMO_VAD_SCORE,
        ecmo_data,
      });
    }
  });

  console.log("countNullMode :>> ", countNullMode);

  return ret;
};

module.exports = {
  getECMO,
};
