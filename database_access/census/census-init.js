/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-06 17:40:48 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-14 16:32:07
 */

const database = require("../../services/database");

const SQL_GET_INIT_CENSUS =`
SELECT DISTINCT
    PERSON_ID,
    MRN,
    PERSON.NAME_FIRST AS FIRST_NAME,
    PERSON.NAME_MIDDLE AS MIDDLE_NAME,
    PERSON.NAME_LAST AS LAST_NAME,
    PERSON.BIRTH_UNIX_TS,
    PERSON.DECEASED_UNIX_TS,
    SEX_CD,
    SEX_CODE.VALUE AS SEX,
    START_UNIX AS BED_START_UNIX,
    END_UNIX AS BED_END_UNIX,
    LOC_NURSE_UNIT_CD,
    LOC_BED_CD,
    LOC_ROOM_CD,
    NURSE_UNIT_DISP,
    BED_DISP,
    ROOM_DISP
FROM ADT
JOIN PERSON USING (PERSON_ID)
JOIN SEX_CODE USING (SEX_CD)
JOIN CHB_MRN USING (PERSON_ID)
WHERE :timestamp BETWEEN START_UNIX AND END_UNIX
  AND :timestamp BETWEEN BEG_EFFECTIVE_UNIX_TS AND END_EFFECTIVE_UNIX_TS
  AND (DECEASED_UNIX_TS IS NULL OR :timestamp BETWEEN BIRTH_UNIX_TS AND DECEASED_UNIX_TS)
`;

async function getCensusInitSqlExecutor(conn, binds) {
  let patientRecords = await conn.execute(SQL_GET_INIT_CENSUS, binds);
  var arr = patientRecords.rows;
  console.log("census init data size :", arr.length);
  if (arr.length < 1) {
    return [];
  }
  return arr;
}

const getCensusInitData = database.withConnection(getCensusInitSqlExecutor);

module.exports = {
  getCensusInitData,
};