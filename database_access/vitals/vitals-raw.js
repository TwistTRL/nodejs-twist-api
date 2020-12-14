/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 16:41:09
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-13 23:19:48
 */

const database = require("../../services/database");

const {
  VITAL_TYPE_TO_TWIST_NAME,
  TABLE_VITALS_DICT,
  TABLE_VITAL_V500_DICT,
  TABLE_VITAL_AIMS,
} = require("./vitals-table-settings");

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

const TABLE_NAME_TO_TABLE_DICT = {
  VITALS: TABLE_VITALS_DICT,
  VITAL_V500: TABLE_VITAL_V500_DICT,
  VITAL_AIMS: TABLE_VITAL_AIMS,
};

const getColumnName = (vital_type, table_name) => {
  const twist_names = VITAL_TYPE_TO_TWIST_NAME[vital_type];
  let column_list = [];
  const current_table_dict = TABLE_NAME_TO_TABLE_DICT[table_name];
  twist_names.forEach((item) => {
    if (item in current_table_dict) {
      column_list = [...column_list, current_table_dict[item]];
    }
  });
  if (!column_list.length) {
    return null;
  }
  return column_list.join(", ");
};

// const vitalsName = {
//   mbp: "MBP1",
//   sbp: "SBP1",
//   dbp: "DBP1",
//   spo2: "SPO2_1",
//   hr: "HR_EKG",
//   cvpm: "CVPM",
//   rap: "RAP",
//   lapm: "LAPM",
//   rr: "RR",
//   temp: "TEMP1",
//   tempcore: "TEMPCORE1",
// };

// const vitalsAltName = {
//   mbp: "NBPM",
//   sbp: "NBPS",
//   dbp: "NBPD",
// };

// const vitalV500Name = {
//   mbp: "MBP",
//   sbp: "SBP",
//   dbp: "DBP",
//   spo2: "SPO2",
//   hr: "HR",
//   cvpm: "CVP",
//   rap: "RAP",
//   lapm: "LAP",
//   rr: "RR",
//   // temp:   "TEMPERATURE",  "TEMPERATURE_ESOPH",  "TEMPERATURE_SKIN"
//   // tempcore: "TEMPCORE1",
// };

// const vitalAimsName = {
//   mbp: "NBPM",
//   sbp: "NBPS",
//   dbp: "NBPD",
//   spo2: "SPO2",
//   hr: "HR",
//   cvpm: "CVPM",
//   rap: "RAPM",
//   lapm: "LAPM",
//   // rr: ?,
//   // temp: TSCORE, TSCAME..
//   tempcore: "TCORE",
// };

const isValidValue = (item) => {
  for (let key in item) {
    if (key !== "DTUNIX" && item[key] !== null) {
      return true;
    }
  }
  return false;
}

async function getVitalsSqlExecutor(conn, binds) {
  const { vital_type, person_id, from_, to_ } = binds;

  const vitals_result = await conn
    .execute(GET_VITALS_SQL(getColumnName(vital_type, "VITALS")), { person_id, from_, to_ })
    .then((ret) => ret.rows)
    .then((arr) => arr.filter(isValidValue));

  const vital_v500_result = await conn
    .execute(GET_VITAL_V500_SQL(getColumnName(vital_type, "VITAL_V500")), { person_id, from_, to_ })
    .then((ret) => ret.rows)
    .then((arr) => arr.filter(isValidValue));
  const vital_aims_result = await conn
    .execute(GET_VITAL_AIMS_SQL(getColumnName(vital_type, "VITAL_AIMS")), { person_id, from_, to_ })
    .then((ret) => ret.rows)
    .then((arr) => arr.filter(isValidValue));

  return {
    vitals_result,
    vital_v500_result,
    vital_aims_result,
  };
}

const getVitalsRawData = database.withConnection(getVitalsSqlExecutor);

module.exports = {
  getVitalsRawData,
};
