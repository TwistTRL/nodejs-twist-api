/*
 * @Author: Peng Zeng
 * @Date: 2020-12-03 09:46:17
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-21 11:12:09
 */

const database = require("../../services/database");
const { VITALS_DICT } = require("../../db_relation/vitals-api");

const CALC_TABLE = {
  VITALS: {
    "1D": "VITALS_CALC_1D",
    "12H": "VITALS_CALC_12H",
    "5H": "VITALS_CALC_5H",
    "5M": "VITALS_CALC_5M",
  },
  VITAL_V500: {
    "1D": "VITALS_V500_PERC_1D",
    "12H": "VITALS_V500_PERC_12H",
    "5H": "VITALS_V500_PERC_5H",
  },
};

const SQL_CALC = (calc_table) => `
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
  VAL_MAX,
  VITAL_TYPE
FROM ${calc_table}
WHERE PERSON_ID = :person_id
ORDER BY START_TM`;

async function vitalsCalcQuerySQLExecutor(conn, binds) {
  const { input_vital_type, person_id, data_resolution } = binds;
  const vital_type_dict = VITALS_DICT[input_vital_type];

  let calc_data = [];
  for (let table_name in CALC_TABLE) {
    const calc_table = CALC_TABLE[table_name][data_resolution];
    // const vital_type_list = Object.values(vital_type_dict)
    // .map((item) => item[table_name])
    // .flat()
    // .filter(Boolean);

    const temp = Object.values(vital_type_dict).map((item) => item[table_name]);
    const vital_type_list = [].concat(...temp).filter(Boolean);
  
    console.log("vital_type_list :>> ", vital_type_list);
    if (calc_table) {
      const cur_result = await conn
        .execute(SQL_CALC(calc_table), { person_id })
        .then((ret) => ret.rows)
        .then((ret) => ret.filter((x) => vital_type_list.includes(x.VITAL_TYPE)))
        .then((ret) =>
          ret.map((x) => ({
            ...x,
            table_source: table_name,
            time: (Number(x.START_TM) + Number(x.END_TM)) / 2,
          }))
        );
      calc_data = [...calc_data, ...cur_result];
    }
  }

  return calc_data;
}

const getVitalsCalcData = database.withConnection(vitalsCalcQuerySQLExecutor);

module.exports = {
  getVitalsCalcData,
};
