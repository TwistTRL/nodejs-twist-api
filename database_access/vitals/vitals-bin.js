/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-03 10:10:03 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-03 16:02:27
 */

const database = require("../../services/database");

const CACL_TABLE = {
  "1D": "VITALS_CALC_1D",
  "12H": "VITALS_CALC_12H",
  "5H": "VITALS_CALC_5H",
  "5M": "VITALS_CALC_5M",
};

const SQL_GET_DICT = `
SELECT 
  BIN_ID,
  LMT_ST, 
  LMT_END 
FROM DEF_VITALS_LMT
WHERE VITAL_TYPE = :vital_type'
`;

const SQL_BIN = `
SELECT
  START_TM,
  END_TM,
  BIN_ID,
  VAL
FROM :bin_talbe
WHERE PERSON_ID = :person_id
AND BIN_ID >= :minBinId
AND BIN_ID <= :maxBinId
ORDER BY START_TM`;

function getMinMaxBinId(dictRecord) {
  let dictResult = {};
  let maxBinId = 0;
  let minBinId = Number.MAX_SAFE_INTEGER;
  for (let row of dictRecord.rows) {
    if (row.BIN_ID > maxBinId) {
      maxBinId = row.BIN_ID;
    }
    if (row.BIN_ID < minBinId) {
      minBinId = row.BIN_ID;
    }
    dictResult[row.BIN_ID] = [row.LMT_ST, row.LMT_END];
  }
  return [minBinId, maxBinId, dictResult];
}

async function vitalsBinQuerySQLExecutor(conn, binds) {
  const { vital_type, person_id, data_resolution } = binds;
  const dictRecord = await conn.execute(SQL_GET_DICT, {vital_type});
  const [minBinId, maxBinId, dictResult] = getMinMaxBinId(dictRecord);
  // console.log('dictResult :>> ', dictResult);s
  const bin_talbe = CACL_TABLE[data_resolution];


  const result = await conn
    .execute(SQL_BIN, { bin_talbe, person_id, minBinId, maxBinId })
    .then((ret) => ret.rows);

  return result;
}

const getVitalsBinData = database.withConnection(vitalsBinQuerySQLExecutor);


module.exports = {
  getVitalsBinData,
};
