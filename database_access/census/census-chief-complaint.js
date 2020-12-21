/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-12 11:35:52 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-21 10:37:07
 */

const database = require("../../services/database");

// ONE PERSON SHOULD HAVE ONLY ONE ENCNTR_ID AT ONE TIME (?)
const SQL_GET_CHIEF_COMPLAINT =`
SELECT
  PERSON_ID,
  EVENT_CD,
  EVENT_END_DT_TM_UTC,
  EVENT_NAME,
  EVENT_START_DT_TM_UTC,
  RESULT_VAL,
  VALID_FROM_DT_TM_UTC,
  VALID_UNTIL_DT_TM_UTC
FROM CHIEFCOMPLAINT
JOIN (
  SELECT
    PERSON_ID
    FROM ADT
    WHERE :timestamp BETWEEN START_UNIX AND END_UNIX
) USING (PERSON_ID)
`;

async function getChiefComplaintSqlExecutor(conn, binds) {
  const patientRecords = await conn.execute(SQL_GET_CHIEF_COMPLAINT, binds);
  const arr = patientRecords.rows;
  console.log("chief complaint data size :", arr.length);
  if (arr.length < 1) {
    return [];
  }
  return arr;
}

const getChiefComplaintData = database.withConnection(getChiefComplaintSqlExecutor);

module.exports = {
  getChiefComplaintData,
};