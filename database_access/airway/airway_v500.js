/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 09:14:20
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 14:31:58
 */

const database = require("../../services/database");

const GET_AIRWAY_V500_SQL = `
SELECT 
  PERFORMED_DT_TM_UTC,
  NURSE_UNIT_DISP,
  VISUALIZATION_OF_AIRWAY,
  "SIZE",
  AIRWAY_GUIDE,
  TUBE,
  TUBE_SIZE,
  TUBE_EXIT_MARK,
  LARYNGOSCOPIES,
  PERFORMED_PERSON,
  COMPLICATIONS, 
  COMPLICATION_COMMENTS, 
  DIFFICULT_AIRWAY_COMMENT,
  ADDITIONAL_INFORMATION,
  DIFFICULT_AIRWAY
FROM AIRWAY_V500
WHERE PERSON_ID = :person_id
ORDER BY PERFORMED_DT_TM_UTC
`;

async function getAirwayV500SqlExecutor(conn, binds) {
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
  let result = await conn.execute(GET_AIRWAY_V500_SQL, binds).then((ret) => ret.rows);
  return result;
}

const getAirwayV500Data = database.withConnection(getAirwayV500SqlExecutor);

module.exports = {
  getAirwayV500Data,
};
