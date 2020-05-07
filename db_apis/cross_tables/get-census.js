/*
 * @Author: Peng
 * @Date: 2020-05-01 21:58:10
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-07 10:41:08
 */

const database = require("../../services/database");

const SQL_GET_PATIENT = (timestamp) => `
WITH 
    PATIENT_BED AS (
    SELECT
        CHB_MRN.MRN,
        PERSON.PERSON_ID AS PATIENT_ID,
        PERSON.NAME_FIRST AS PATIENT_FIRST_NAME,
        PERSON.NAME_LAST AS PATIENT_LAST_NAME,
        PERSON.BIRTH_UNIX_TS AS PATIENT_BIRTH_TS,
        NURSE_UNIT_CODE.VALUE AS NURSE_UNIT_NAME,
        BED_CODE.BED_CD,
        ROOM_CODE.VALUE AS ROOM_NAME,
        BED_CODE.VALUE AS BED_NAME        
    FROM NURSE_UNIT_CODE
        JOIN ROOM_CODE ON nurse_unit_code.nurse_unit_cd = room_code.nurse_unit_cd
        JOIN BED_CODE ON ROOM_CODE.ROOM_CD = BED_CODE.ROOM_CD
        JOIN ENCNTR_BED_SPACE ON ENCNTR_BED_SPACE.BED_CD = BED_CODE.BED_CD
        JOIN ENCOUNTER ON ENCOUNTER.ENCNTR_ID = ENCNTR_BED_SPACE.ENCNTR_ID
        JOIN PERSON ON PERSON.PERSON_ID = ENCOUNTER.PERSON_ID
        JOIN CHB_MRN ON CHB_MRN.PERSON_ID = PERSON.PERSON_ID
    WHERE ${timestamp} BETWEEN ENCNTR_BED_SPACE.START_UNIX_TS AND ENCNTR_BED_SPACE.END_UNIX_TS
        AND ${timestamp} BETWEEN CHB_MRN.BEG_EFFECTIVE_UNIX_TS AND CHB_MRN.END_EFFECTIVE_UNIX_TS
    ),
    
    PERSONNEL_BED AS (
    SELECT 
        CHB_TRK_ASSIGN.CHB_PRSNL_ID, 
        CHB_TRK_ASSIGN.ASSIGN_ID,
        CHB_TRK_ASSIGN.START_UNIX_TS,
        CHB_TRK_ASSIGN.END_UNIX_TS,
        ASSIGN_TYPE_CODE.VALUE as PERSONNEL_TYPE,
        CHB_PRSNL.PERSON_ID AS PERSONNEL_ID,
        CHB_TRK_BED_ASSIGN.BED_CD,
        PERSON.NAME_FIRST AS PERSONNEL_FIRST_NAME,
        PERSON.NAME_LAST AS PERSONNEL_LAST_NAME
    FROM CHB_PRSNL 
        JOIN CHB_TRK_ASSIGN ON CHB_PRSNL.CHB_PRSNL_ID = CHB_TRK_ASSIGN.CHB_PRSNL_ID
        JOIN ASSIGN_TYPE_CODE ON ASSIGN_TYPE_CODE.ASSIGN_TYPE_CD = CHB_TRK_ASSIGN.ASSIGN_TYPE_CD
        JOIN CHB_TRK_BED_ASSIGN ON CHB_TRK_ASSIGN.ASSIGN_ID = CHB_TRK_BED_ASSIGN.ASSIGN_ID
        JOIN PERSON ON PERSON.PERSON_ID = CHB_PRSNL.PERSON_ID
    WHERE ${timestamp} BETWEEN CHB_TRK_ASSIGN.START_UNIX_TS AND CHB_TRK_ASSIGN.END_UNIX_TS
    )
    
    SELECT
        MRN,
        PATIENT_ID,
        PATIENT_FIRST_NAME,
        PATIENT_LAST_NAME,
        PATIENT_BIRTH_TS,
        NURSE_UNIT_NAME,
        ROOM_NAME,
        BED_NAME,
        PERSONNEL_FIRST_NAME,
        PERSONNEL_LAST_NAME,
        PERSONNEL_TYPE,
        START_UNIX_TS,
        END_UNIX_TS
    FROM PATIENT_BED JOIN PERSONNEL_BED ON PATIENT_BED.BED_CD = PERSONNEL_BED.BED_CD
`;

async function getCensusPatientSqlExecutor(conn, ts) {
  console.time("get-patient-census");
  console.log(" sql: " + SQL_GET_PATIENT(ts));
  let patientRecords = await conn.execute(SQL_GET_PATIENT(ts));
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
