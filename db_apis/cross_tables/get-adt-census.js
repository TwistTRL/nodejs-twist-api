/*
 * @Author: Peng Zeng 
 * @Date: 2020-05-12 12:23:29 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-13 10:26:02
 */

/**
 * new get-census api, from table ADT
 */

const database = require("../../services/database");

const SQL_GET_ADT_CENSUS = (timestamp) => `

WITH 
    PATIENT_BED AS (
    SELECT
        PERSON_ID,
        START_UNIX,
        END_UNIX,
        LOC_NURSE_UNIT_CD,
        LOC_BED_CD,
        LOC_ROOM_CD,
        NURSE_UNIT_DISP,
        BED_DISP,
        ROOM_DISP
    FROM ADT
    WHERE ${timestamp} BETWEEN START_UNIX AND END_UNIX
    ),

    PERSONNEL_BED AS (
    SELECT
        ASSIGN_ID,
        BED_ASSIGN_ID,
        NAME_FULL_FORMATTED,
        CONTACT_NUM,
        ASSIGN_TYPE,
        BED_CD,
        START_UNIX,
        END_UNIX
    FROM ADT_PERSONNEL
    WHERE ${timestamp} BETWEEN START_UNIX AND END_UNIX
    )

SELECT
    PATIENT_BED.START_UNIX AS PATIENT_BED_START_UNIX,
    PATIENT_BED.END_UNIX AS PATIENT_BED_END_UNIX,
    LOC_NURSE_UNIT_CD,
    LOC_ROOM_CD,
    NURSE_UNIT_DISP,
    BED_DISP,
    ROOM_DISP,
    ASSIGN_ID,
    BED_ASSIGN_ID,
    NAME_FULL_FORMATTED,
    CONTACT_NUM,
    ASSIGN_TYPE,
    BED_CD,
    PERSONNEL_BED.START_UNIX AS PERSONNEL_START_UNIX,
    PERSONNEL_BED.END_UNIX AS PERSONNEL_END_UNIX
FROM PATIENT_BED JOIN PERSONNEL_BED ON PATIENT_BED.LOC_BED_CD = PERSONNEL_BED.BED_CD
`;



async function getCensusSqlExecutor(conn, ts) {
  console.time("get-adt-census");
  console.log(" sql: " + SQL_GET_ADT_CENSUS(ts));
  let patientRecords = await conn.execute(SQL_GET_ADT_CENSUS(ts));
  var arr = patientRecords.rows;
  console.log("record size :", arr.length);
  if (arr.length < 1) {
    return [];
  }
  console.timeEnd("get-adt-census");
  return arr;
}

const getAdtCensus = database.withConnection(getCensusSqlExecutor);

module.exports = {
  getAdtCensus,
};
