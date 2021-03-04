/*
 * @Author: Peng Zeng
 * @Date: 2020-12-03 10:10:03
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-03-03 23:20:20
 */

const database = require("../../services/database");
// const {
//   VITAL_TYPE_TO_TWIST_NAME,
//   TABLE_VITALS_DICT,
//   TABLE_VITAL_V500_DICT,
//   TABLE_VITAL_AIMS,
// } = require("./vitals-table-settings");

const BIN_TABLE = {
  VITALS: {
    "1D": "VITALS_BIN_1D",
    "12H": "VITALS_BIN_12H",
    "5H": "VITALS_BIN_5H",
    "5M": "VITALS_BIN_5M",
  },
  VITAL_V500: {
    "1D": "VITALS_V500_BIN_1D",
    "12H": "VITALS_V500_BIN_12H",
    "5H": "VITALS_V500_BIN_5H",
  },
};

const SQL_BIN = (bin_table, binIdList) => `
SELECT
  START_TM,
  END_TM,
  BIN_ID,
  VAL
FROM ${bin_table}
WHERE PERSON_ID = :person_id
  AND BIN_ID IN (${binIdList})
ORDER BY START_TM`;

async function vitalsBinQuerySQLExecutor(conn, binds) {
  const { bin_def, person_id, data_resolution } = binds;
  const binIdList = bin_def.map((item) => item.BIN_ID);

  let bin_data = [];
  for (let table_name in BIN_TABLE) {
    const bin_table = BIN_TABLE[table_name][data_resolution];
    if (bin_table) {
      const cur_result = await conn
        .execute(SQL_BIN(bin_table, binIdList), { person_id })
        .then((ret) => ret.rows)
        .then((ret) =>
          ret.map((x) => ({
            START_TM: parseInt(x.START_TM),
            END_TM: parseInt(x.END_TM),
            BIN_ID: parseInt(x.BIN_ID),
            table_source: table_name,
          }))
        );
      bin_data = [...bin_data, ...cur_result];
    }
  }

  return bin_data;
}

const getVitalsBinData = database.withConnection(vitalsBinQuerySQLExecutor);

module.exports = {
  getVitalsBinData,
};
