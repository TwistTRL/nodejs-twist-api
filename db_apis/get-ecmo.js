/*
 * @Author: Peng 
 * @Date: 2020-03-27 10:26:44 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-05 15:14:54
 */

const database = require("../services/database");
let timeLable = 0;


// TODO: ECMO_VAD_SCORE => ECMO_VAD

// const SQL_GET_ECMO = `
// SELECT
//   VALID_FROM_DT_TM,
//   ECMO_FLOW,
//   ECMO_FLOW_NORM,
//   LVAD_FILLING,
//   LVAD_EJECTION,
//   LVAD_RATE,
//   LVAD_VOLUME,
//   RVAD_RATE,
//   VAD_CI,
//   VAD_CO,
//   WEIGHT,
//   ECMO_VAD_SCORE
// FROM ECMO_VAD_VARIABLE
// WHERE PERSON_ID = :person_id
// ORDER BY VALID_FROM_DT_TM`;

const GET_ECMO_SQL = `
SELECT
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
  LVAD_VOLUME,
  LVAD_RATE,
  LVAD_SP,
  LVAD_DP,
  LVAD_STM,
  LVAD_FILLING,
  LVAD_EJECTION,
  LVAD_DEPOS,
  LVAD_DEPOS2,
  BERLIN_OUT_DEPOS,
  BERLIN_OUT_DEPOS2,
  BERLIN_CLOT,
  BERLIN_CLOT2,
  BERLIN_NOTE,
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
  ECMO_SERVO,
  ECMO_PREP1,
  ECMO_POSTP1,
  ECMO_POSTP2,
  ECMO_PREP2,
  ECMO_SVO2,
  ECMO_SVO22,
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

async function ecmoQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for ECMO all time: ", GET_ECMO_SQL);
  console.time("getECMO-sql" + timestampLable);
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
  let rawRecord = await conn.execute(GET_ECMO_SQL, binds);
  console.timeEnd("getECMO-sql" + timestampLable);
  return rawRecord.rows;
}

function _calculateRawRecords(arrECMO) {
  let ret = [];
  if (arrECMO && arrECMO.length) {
    console.log("ECMO record size :", arrECMO.length);
    for (let row of arrECMO) {
      //example row = {"VALID_FROM_DT_TM": 1500000000, "ECMO_VAD_SCORE": 90}
      if (row["ECMO_VAD_SCORE"] !== null) {
        for (const key in row) {
          if (row[key] === null) {
            row[key] = undefined;
          }
        }
        ret.push(row);
      }
    }
  }
  return ret;
}

const getECMO = database.withConnection(async function(
  conn,
  binds
) {
  let rawResult = await ecmoQuerySQLExecutor(conn, binds);
  let result = _calculateRawRecords(rawResult);
  return result;
});

module.exports = {
  getECMO
};
