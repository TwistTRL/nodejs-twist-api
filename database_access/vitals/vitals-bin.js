/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-03 10:10:03 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-14 08:56:29
 */

const database = require("../../services/database");
const {
  VITAL_TYPE_TO_TWIST_NAME,
  TABLE_VITALS_DICT,
  TABLE_VITAL_V500_DICT,
  TABLE_VITAL_AIMS,
} = require("./vitals-table-settings");


const BIN_TABLE = {
  "1D": "VITALS_BIN_1D",
  "12H": "VITALS_BIN_12H",
  "5H": "VITALS_BIN_5H",
  "5M": "VITALS_BIN_5M",
};

const SQL_GET_DICT = `
SELECT 
  BIN_ID,
  LMT_ST, 
  LMT_END 
FROM DEF_VITALS_LMT
WHERE VITAL_TYPE = :vital_type'
`;

const SQL_BIN = binIdList => `
SELECT
  START_TM,
  END_TM,
  BIN_ID,
  VAL
FROM :bin_table
WHERE PERSON_ID = :person_id
  AND BIN_ID IN (${binIdList})
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
  return {minBinId, maxBinId, dictResult};
}

async function vitalsBinQuerySQLExecutor(conn, binds) {
  const { vital_type, person_id, data_resolution } = binds;
  const dictRecord = await conn.execute(SQL_GET_DICT, {vital_type});
  const {minBinId, maxBinId, dictResult} = getMinMaxBinId(dictRecord);
  const bin_table = BIN_TABLE[data_resolution];

  const result = await conn
    .execute(SQL_BIN, { bin_table, person_id, minBinId, maxBinId })
    .then((ret) => ret.rows);

  return result;
}

const getVitalsBinData = database.withConnection(vitalsBinQuerySQLExecutor);


module.exports = {
  getVitalsBinData,
};
