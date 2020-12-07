/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 16:41:09
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-05 18:19:45
 */

const database = require("../../services/database");

const GET_VITALS_SQL = (vitalType) => `
SELECT
  ${vitalsName[vitalType]},
  DTUNIX
FROM VITALS
WHERE PERSON_ID = :person_id
  AND DTUNIX >= :from_ 
  AND DTUNIX < :to_ 
  AND ${vitalsName[vitalType]} IS NOT NULL
ORDER BY DTUNIX
`;

const GET_VITALS_ALT_SQL = (vitalType) => `
SELECT
  ${vitalsAltName[vitalType]},
  DTUNIX
FROM VITALS
WHERE PERSON_ID = :person_id
  AND DTUNIX >= :from_ 
  AND DTUNIX < :to_ 
  AND ${vitalsAltName[vitalType]} IS NOT NULL
ORDER BY DTUNIX
`;

const GET_VITAL_V500_SQL = (vitalType) => `
SELECT
  ${vitalV500Name[vitalType]},
  DTUNIX
FROM VITAL_V500
WHERE PERSON_ID = :person_id
  AND DTUNIX >= :from_ 
  AND DTUNIX < :to_ 
  AND ${vitalV500Name[vitalType]} IS NOT NULL
ORDER BY DTUNIX
`;

const GET_VITAL_AIMS_SQL = (vitalType) => `
SELECT
  ${vitalAimsName[vitalType]},
  DTUNIX
FROM VITAL_AIMS
WHERE PERSON_ID = :person_id
  AND DTUNIX >= :from_ 
  AND DTUNIX < :to_ 
  AND ${vitalAimsName[vitalType]} IS NOT NULL
ORDER BY DTUNIX
`;

const vitalsName = {
  mbp: "MBP1",
  sbp: "SBP1",
  dbp: "DBP1",
  spo2: "SPO2_1",
  hr: "HR_EKG",
  cvpm: "CVPM",
  rap: "RAP",
  lapm: "LAPM",
  rr: "RR",
  temp: "TEMP1",
  tempcore: "TEMPCORE1",
};

const vitalsAltName = {
  mbp: "NBPM",
  sbp: "NBPS",
  dbp: "NBPD",
};

const vitalV500Name = {
  mbp: "MBP",
  sbp: "SBP",
  dbp: "DBP",
  spo2: "SPO2",
  hr: "HR",
  cvpm: "CVP",
  rap: "RAP",
  lapm: "LAP",
  rr: "RR",
  // temp:   "TEMPERATURE",  "TEMPERATURE_ESOPH",  "TEMPERATURE_SKIN"
  // tempcore: "TEMPCORE1",
};

const vitalAimsName = {
  mbp: "NBPM",
  sbp: "NBPS",
  dbp: "NBPD",
  spo2: "SPO2",
  hr: "HR",
  cvpm: "CVPM",
  rap: "RAPM",
  lapm: "LAPM",
  // rr: ?,
  // temp: TSCORE, TSCAME..
  tempcore: "TCORE",
};

async function getVitalsSqlExecutor(conn, binds) {
  console.log('binds :>> ', binds);
  const { vital_type, person_id, from_, to_ } = binds;
  const vitals_result = await conn
    .execute(GET_VITALS_SQL(vital_type), { person_id, from_, to_ })
    .then((ret) => ret.rows);
  const vitals2ndType = vitalsAltName[vital_type];
  let vitals_2nd_result;
  if (vitals2ndType) {
    vitals_2nd_result = await conn
      .execute(GET_VITALS_ALT_SQL(vital_type), { person_id, from_, to_ })
      .then((ret) => ret.rows);
  }
  const vital_v500_result = await conn
    .execute(GET_VITAL_V500_SQL(vital_type), { person_id, from_, to_ })
    .then((ret) => ret.rows);
  // const vital_aims_result = await conn
  //   .execute(GET_VITAL_AIMS_SQL(vital_type), { person_id, from_, to_ })
  //   .then((ret) => ret.rows);

  return {
    vitals_result,
    vitals_2nd_result,
    vital_v500_result,
    vital_aims_result: [], // TODO: 
  };
}

const getVitalsRawData = database.withConnection(getVitalsSqlExecutor);

module.exports = {
  getVitalsRawData,
};



