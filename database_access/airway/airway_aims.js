/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 09:14:20
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 14:25:21
 */

const database = require("../../services/database");

const GET_AIRWAY_AIMS_SQL = `
SELECT 
  CURSORTIME_UTC,
  BLADETYPE,
  BLADESIZE,
  GRADEVIEW,
  FORMNAME,
  FRAMENAME,
  TYPE_F,
  VALUE_F,
  ORAL_NASAL,
  SIZE_F,
  CUFF_TYPE,
  NUMATT,
  COMPLICATIONS,
  COMMENTS
FROM AIRWAY_AIMS
WHERE PERSON_ID = :person_id
  AND FORMNAME != 'In-Situ'
ORDER BY CURSORTIME_UTC
`;

async function getAirwayAAimsSqlExecutor(conn, binds) {
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
  let result = await conn.execute(GET_AIRWAY_AIMS_SQL, binds).then((ret) => ret.rows);
  return result;
}

const getAirwayAimsData = database.withConnection(getAirwayAAimsSqlExecutor);

module.exports = {
  getAirwayAimsData,
};
