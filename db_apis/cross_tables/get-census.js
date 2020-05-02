/*
 * @Author: Peng
 * @Date: 2020-05-01 21:58:10
 * @Last Modified by: Peng
 * @Last Modified time: 2020-05-01 22:28:47
 */

const database = require("../../services/database");

const SQL_GET_PATIENT = (timestamp, location) => {
  let sqlBase = `
SELECT 
    CHB_MRN.MRN,
    BED_CODE.BED_CD
FROM NURSE_UNIT_CODE 
    JOIN ROOM_CODE ON NURSE_UNIT_CODE.NURSE_UNIT_CD = ROOM_CODE.NURSE_UNIT_CD 
    JOIN BED_CODE ON ROOM_CODE.ROOM_CD = BED_CODE.ROOM_CD
    JOIN ENCNTR_BED_SPACE ON ENCNTR_BED_SPACE.BED_CD = BED_CODE.BED_CD
    JOIN ENCOUNTER ON ENCOUNTER.ENCNTR_ID = ENCNTR_BED_SPACE.ENCNTR_ID
    JOIN PERSON ON PERSON.PERSON_ID = ENCOUNTER.PERSON_ID
    JOIN CHB_MRN ON CHB_MRN.PERSON_ID = PERSON.PERSON_ID
WHERE ${timestamp} BETWEEN ENCNTR_BED_SPACE.START_UNIX_TS AND ENCNTR_BED_SPACE.END_UNIX_TS`;
  let sqlLocation = `
AND NURSE_UNIT_CODE.VALUE = '${location}'`;

  return location ? sqlBase + sqlLocation : sqlBase;
};

async function getCensusPatientSqlExecutor(conn, init) {
  console.time("get-patient-census");
  console.log('init :>> ', init);

  let timestamp = init.timestamp;
  let location = init.location;

  console.log(" sql: " + SQL_GET_PATIENT(timestamp, location));
  let patientRecords = await conn.execute(SQL_GET_PATIENT(timestamp, location));
  var arr = patientRecords.rows;
  console.log("record size :", arr.length);
  if (arr.length < 1) {
    return [];
  }
  console.timeEnd("get-patient-census");
  return arr;
}

const getCensus = database.withConnection(getCensusPatientSqlExecutor);

module.exports = {
  getCensus,
};
