/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 16:41:09
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-19 22:34:20
 */

const database = require("../../services/database");
const { VITALS_DICT } = require("../../db_relation/vitals-api");

// const VITAL_TYPE_TO_TWIST_NAME = {};
// for (let input_vital_type in VITALS_DICT) {
//   VITAL_TYPE_TO_TWIST_NAME[input_vital_type] = Object.keys(VITALS_DICT[input_vital_type]);
// }

const GET_VITALS_SQL = (column_name) => `
SELECT
  ${column_name},
  DTUNIX
FROM VITALS
WHERE PERSON_ID = :person_id
  AND DTUNIX >= :from_ 
  AND DTUNIX < :to_ 
ORDER BY DTUNIX
`;

const GET_VITAL_V500_SQL = (column_name) => `
SELECT
  ${column_name},
  DTUNIX
FROM VITAL_V500
WHERE PERSON_ID = :person_id
  AND DTUNIX >= :from_ 
  AND DTUNIX < :to_ 
ORDER BY DTUNIX
`;

const GET_VITAL_AIMS_SQL = (column_name) => `
SELECT
  ${column_name},
  DTUNIX_ET
FROM VITAL_AIMS
WHERE PERSON_ID = :person_id
  AND DTUNIX_ET >= :from_ 
  AND DTUNIX_ET < :to_ 
ORDER BY DTUNIX_ET
`;

const getColumnName = (input_vital_type, table_name) => {
  let column_list = [];
  Object.values(VITALS_DICT[input_vital_type]).forEach((item) => {
    column_list = [...column_list, item[table_name]];
  });

  return column_list.flat().filter(Boolean).join(", ");
};

const isValidValue = (item) => {
  for (let key in item) {
    if (key !== "DTUNIX" && key !== "DTUNIX_ET" && item[key] !== null) {
      return true;
    }
  }
  return false;
};

async function getVitalsSqlExecutor(conn, binds) {
  const { input_vital_type, person_id, from_, to_ } = binds;

  const SQL_VITALS_COLUMN = getColumnName(input_vital_type, "VITALS");
  const promise_vitals = SQL_VITALS_COLUMN
    ? conn.execute(GET_VITALS_SQL(SQL_VITALS_COLUMN), { person_id, from_, to_ })
    : null;

  const SQL_VITAL_V500_COLUMN = getColumnName(input_vital_type, "VITAL_V500");
  const promise_vital_v500 = SQL_VITAL_V500_COLUMN
    ? conn.execute(GET_VITAL_V500_SQL(SQL_VITAL_V500_COLUMN), { person_id, from_, to_ })
    : null;
    
  const SQL_VITAL_AIMS_COLUMN = getColumnName(input_vital_type, "VITAL_AIMS");
  const promise_vital_aims = SQL_VITAL_AIMS_COLUMN
    ? conn.execute(GET_VITAL_AIMS_SQL(SQL_VITAL_AIMS_COLUMN), { person_id, from_, to_ })
    : null;

  let [
    promise_result_vitals,
    promise_result_vital_v500,
    promise_result_vital_aims,
  ] = await Promise.all([promise_vitals, promise_vital_v500, promise_vital_aims]);

  return {
    vitals_result: promise_result_vitals ? promise_result_vitals.rows.filter(isValidValue) : [],
    vital_v500_result: promise_result_vital_v500
      ? promise_result_vital_v500.rows.filter(isValidValue)
      : [],
    vital_aims_result: promise_result_vital_aims
      ? promise_result_vital_aims.rows.filter(isValidValue)
      : [],
  };
}

const getVitalsRawData = database.withConnection(getVitalsSqlExecutor);

module.exports = {
  getVitalsRawData,
};
