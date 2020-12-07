/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-06 11:00:01 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-07 17:20:15
 */

const database = require("../../services/database");

const SQL_GET_ADT_CENSUS =`
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
          ROOM_DISP,
          PERSON.NAME_FIRST,
          PERSON.NAME_MIDDLE,
          PERSON.NAME_LAST,
          PERSON.BIRTH_UNIX_TS,
          PERSON.DECEASED_UNIX_TS,
          SEX_CD,
          SEX_CODE.VALUE AS SEX,
          CHB_MRN.MRN
      FROM ADT
      JOIN PERSON USING (PERSON_ID)
      JOIN SEX_CODE USING (SEX_CD)
      JOIN CHB_MRN USING (PERSON_ID)
      WHERE :timestamp BETWEEN START_UNIX AND END_UNIX
        AND :timestamp BETWEEN BEG_EFFECTIVE_UNIX_TS AND END_EFFECTIVE_UNIX_TS
    ),
    
    -- get latest weight for patient
    PATIENT_WEIGHT AS (
        SELECT PERSON_ID,          
          DT_UNIX,
          WEIGHT
        FROM PATIENT_BED
        JOIN WEIGHTS USING (PERSON_ID)    
    ),
    
    PATIENT_LATEST_WEIGHT AS (
      SELECT PERSON_ID, DT_UNIX, WEIGHT
      FROM (
        SELECT PERSON_ID, DT_UNIX, WEIGHT, ROW_NUMBER ()
        OVER (PARTITION BY PERSON_ID ORDER BY DT_UNIX DESC) LATEST_WEIGHT
        FROM PATIENT_WEIGHT
      )
      WHERE LATEST_WEIGHT = 1
    ),

    -- get latest RSS for patient
    PATIENT_RSS AS (
        SELECT PERSON_ID, RST, RSS, INO_DOSE, EVENT_END_DT_TM_UNIX
        FROM PATIENT_BED
        JOIN RSS_UPDATED USING (PERSON_ID)    
    ),
    
    PATIENT_LATEST_RSS AS (
      SELECT PERSON_ID, RST, RSS, INO_DOSE, EVENT_END_DT_TM_UNIX 
      FROM (
        SELECT PERSON_ID, RST, RSS, INO_DOSE, EVENT_END_DT_TM_UNIX, ROW_NUMBER () 
        OVER (PARTITION BY PERSON_ID ORDER BY EVENT_END_DT_TM_UNIX DESC) LATEST_RSS
        FROM PATIENT_RSS
      )
      WHERE LATEST_RSS = 1
    ),
    
    -- get latest ECMO for patient
    PATIENT_ECMO AS (
        SELECT PERSON_ID, ECMO_FLOW_NORM, ECMO_VAD_SCORE, VALID_FROM_DT_TM
        FROM PATIENT_BED
        JOIN ECMO_VAD_VARIABLE USING (PERSON_ID)    
    ),
    
    PATIENT_LATEST_ECMO AS (
      SELECT PERSON_ID, ECMO_FLOW_NORM, ECMO_VAD_SCORE, VALID_FROM_DT_TM
      FROM (
        SELECT PERSON_ID, ECMO_FLOW_NORM, ECMO_VAD_SCORE, VALID_FROM_DT_TM, ROW_NUMBER () 
        OVER (PARTITION BY PERSON_ID ORDER BY VALID_FROM_DT_TM DESC) LATEST_ECMO
        FROM PATIENT_ECMO
      )
      WHERE LATEST_ECMO = 1
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
      WHERE :timestamp BETWEEN START_UNIX AND END_UNIX
    )    
    
SELECT
    PERSON_ID,
    MRN,
    PATIENT_BED.NAME_FIRST AS PATIENT_FIRST_NAME,
    PATIENT_BED.NAME_MIDDLE AS PATIENT_MIDDLE_NAME,
    PATIENT_BED.NAME_LAST AS PATIENT_LAST_NAME,
    PATIENT_BED.BIRTH_UNIX_TS AS PATIENT_BIRTH_UNIX_TS,
    PATIENT_BED.DECEASED_UNIX_TS AS PATIENT_DECEASED_UNIX_TS,
    PATIENT_BED.SEX_CD AS PATIENT_SEX_CD,
    PATIENT_BED.SEX AS PATIENT_SEX,    
    PATIENT_BED.START_UNIX AS PATIENT_BED_START_UNIX,
    PATIENT_BED.END_UNIX AS PATIENT_BED_END_UNIX,
    LOC_NURSE_UNIT_CD,
    LOC_ROOM_CD,
    NURSE_UNIT_DISP,
    BED_DISP,
    ROOM_DISP,
    ASSIGN_ID,
    BED_ASSIGN_ID,
    NAME_FULL_FORMATTED AS PERSONNEL_NAME,
    CONTACT_NUM,
    ASSIGN_TYPE,
    BED_CD,
    PERSONNEL_BED.START_UNIX AS PERSONNEL_START_UNIX,
    PERSONNEL_BED.END_UNIX AS PERSONNEL_END_UNIX,
    PATIENT_LATEST_WEIGHT.DT_UNIX AS WEIGHT_UNIX,
    WEIGHT,
    RST, 
    RSS,
    INO_DOSE, 
    EVENT_END_DT_TM_UNIX AS RSS_UNIX,
    ECMO_FLOW_NORM, 
    ECMO_VAD_SCORE, 
    VALID_FROM_DT_TM AS ECMO_UNIX,
    ANATOMY,
    SUBCAT_ANAT,
    SUBCAT_NAME,
    SUBCAT_VALUE,
    COVARIATE
FROM PATIENT_BED
LEFT JOIN PERSONNEL_BED ON PATIENT_BED.LOC_BED_CD = PERSONNEL_BED.BED_CD
LEFT JOIN PATIENT_LATEST_WEIGHT USING (PERSON_ID)
LEFT JOIN PATIENT_LATEST_RSS USING (PERSON_ID)
LEFT JOIN PATIENT_LATEST_ECMO USING (PERSON_ID)
LEFT JOIN DIAGNOSIS USING (MRN)
ORDER BY MRN`;

//NOTE: for SQL using for getting latest weight/RSS/ECMO, see
//https://stackoverflow.com/questions/51860435/return-first-row-in-each-group-from-oracle-sql
//https://stackoverflow.com/questions/19920243/how-to-get-only-one-record-for-each-duplicate-rows-of-the-id-in-oracle/19920465


async function getCensusSqlExecutor(conn, binds) {
  let patientRecords = await conn.execute(SQL_GET_ADT_CENSUS, binds);
  var arr = patientRecords.rows;
  console.log("census data size :", arr.length);
  if (arr.length < 1) {
    return [];
  }
  return arr;
}

const getCensusData = database.withConnection(getCensusSqlExecutor);

module.exports = {
  getCensusData,
};

// -- census table part
// select * from RSS;
// --most recent rss, rst

// select * from ecmo_vad_variable;
// -- norm, value
// --past 12 hours, send the most recent rss/ecmo

// -- check ==> ecmo_flow_norm



// slow => person basic info first then rss + weight + age + diagnosis