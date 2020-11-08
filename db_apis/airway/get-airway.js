/*
 * @Author: Peng Zeng 
 * @Date: 2020-11-07 21:39:28 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-07 21:45:12
 */


const database = require("../../services/database");

const GET_AIRWAY_SQL = `
SELECT 
  PERSON_ID,
  PATIENTID,
  MRN,
  CURSORTIME_UTC,
  CURSORTIME_EST,
  FORMNAME,
  FRAMENAME,
  VALUE_F,
  PARAMETERNAME,
  ABBREVIATION,
  CATEGORYNAME,
  INSITU,
  TYPE_F,
  ORAL_NASAL,
  SIZE_F,
  CUFF_TYPE,
  CUFF_PRESS,
  LEAK,
  TAPED,
  LUNG_ISOLATION,
  TECHNIQUE,
  INTUBATOR,
  MASKDIFF,
  PREOX,
  ORALAIRWAY,
  BITEBLOCK,
  LIDOCAINE,
  DIFFAIRWAY,
  DEVICE,
  BLADETYPE,
  BLADESIZE,
  GRADEVIEW,
  CRICOID,
  NUMATT,
  COMMENTS,
  COMPLICATIONS,
  NATURAL_F
FROM AIRWAY_AIMS
WHERE PERSON_ID = :person_id
ORDER BY CURSORTIME_UTC
`;

async function getAirwaySqlExecutor(conn, binds) {
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
  let result = await conn.execute(GET_AIRWAY_SQL, binds).then((ret) => ret.rows);
  return result;
}

const getAirway = database.withConnection(getAirwaySqlExecutor);

module.exports = {
  getAirway,
};
