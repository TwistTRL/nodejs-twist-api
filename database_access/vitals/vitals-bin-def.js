/*
 * @Author: Peng Zeng
 * @Date: 2020-12-17 22:38:35
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-17 23:21:47
 */

const database = require("../../services/database");

const VITAL_TYPE_TO_BIN_COL = {
  DBP: ["DBP", "NBPD"],
  SBP: ["SBP1", "NBPS"],
  MBP: ["MBP1", "NBPM"],
  CVP: ["CVPM", "RAP", "LAPM"],
  TEMP: ["TEMP1", "TEMPCORE1"],
  SPO2: ["SPO2_1"],
  RR: ["RR"],
  HR: ["HR", "HR_PULSED"],
};

const getVitalType = (input_vital_type) =>
  VITAL_TYPE_TO_BIN_COL[input_vital_type].map((item) => `VITAL_TYPE = '${item}'`).join(" OR ");

const SQL_GET_BINID_DEF = (input_vital_type) => `
SELECT 
  VITAL_TYPE,
  BIN_ID,
  LMT_ST, 
  LMT_END 
FROM DEF_VITALS_LMT
WHERE ${getVitalType(input_vital_type)}
`;

async function vitalsBinDefQuerySQLExecutor(conn, binds) {
  const { input_vital_type } = binds;
  if (!(input_vital_type in VITAL_TYPE_TO_BIN_COL)) {
    return null;
  }
  const bin_def_records = await conn.execute(SQL_GET_BINID_DEF(input_vital_type));

  const ret = bin_def_records.rows;
  return ret;
}

const getVitalsBinDef = database.withConnection(vitalsBinDefQuerySQLExecutor);

module.exports = {
  getVitalsBinDef,
};
