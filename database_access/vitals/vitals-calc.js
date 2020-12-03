/*
 * @Author: Peng Zeng
 * @Date: 2020-12-03 09:46:17
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-03 10:09:22
 */

const database = require("../../services/database");

const caclTable = {
  "1D": "VITALS_CALC_1D",
  "12H": "VITALS_CALC_12H",
  "5H": "VITALS_CALC_5H",
  "5M": "VITALS_CALC_5M",
};

const SQL_CALC = (data_resolution) => `
SELECT 
  START_TM,
  END_TM,
  VAL_SIZE,
  VAL_MIN,
  VAL_MEAN,
  VAL_PERC1,
  VAL_PERC5,
  VAL_PERC25,
  VAL_PERC50,
  VAL_PERC75,
  VAL_PERC95,
  VAL_PERC99,
  VAL_MAX
FROM ${caclTable[data_resolution]}
WHERE PERSON_ID = :person_id
AND VITAL_TYPE = :vital_type
ORDER BY START_TM`;

async function vitalsCalcQuerySQLExecutor(conn, binds) {
  const { vital_type, person_id, data_resolution } = binds;
  const result = await conn
    .execute(SQL_CALC(data_resolution), { person_id, vital_type })
    .then((ret) => ret.rows);

  return result;
}

const getVitalsCalcData = database.withConnection(vitalsCalcQuerySQLExecutor);

module.exports = {
  getVitalsCalcData,
};
