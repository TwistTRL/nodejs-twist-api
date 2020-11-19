/*
 * @Author: Peng Zeng 
 * @Date: 2020-11-18 21:23:54 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-19 16:18:18
 */

const database = require("../../services/database");

const GET_CRITICAL_CONTINGENCY_SQL = `
SELECT 
  ENCNTR_ID,
  PERFORMED_DT_TM_UTC,
  EVENT_CD,
  EVENT_DISP,
  RESULT_VAL
FROM CRITICAL_CONTINGENCY
WHERE PERSON_ID = :person_id
ORDER BY PERFORMED_DT_TM_UTC
`;

async function getCriticalContingencySqlExecutor(conn, binds) {
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
  let result = await conn.execute(GET_CRITICAL_CONTINGENCY_SQL, binds).then((ret) => ret.rows);
  return result;
}

const getCriticalContingencyData = database.withConnection(getCriticalContingencySqlExecutor);

module.exports = {
  getCriticalContingencyData,
};
