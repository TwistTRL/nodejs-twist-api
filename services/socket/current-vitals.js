/*
 * @Author: Peng Zeng 
 * @Date: 2021-02-28 20:42:50 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-28 22:13:33
 */

const database = require("../database");

const GET_CURRENT_VITALS_SQL = (person_id_list) => `
SELECT 
  PERSON_ID, HR, MBP, SBP, DBP 
FROM CURRENT_VITALS 
WHERE PERSON_ID IN (${person_id_list.join(", ")})
`;

async function getCurrentVitalsSqlExecutor(conn, person_id_list) {
  // console.log('person_id_list :>> ', person_id_list);
  // console.log('GET_CURRENT_VITALS_SQL(person_id_list) :>> ', GET_CURRENT_VITALS_SQL(person_id_list));
  if (!Array.isArray(person_id_list) || !person_id_list.length ) {
    return null;
  }
  let result = await conn.execute(GET_CURRENT_VITALS_SQL(person_id_list)).then((ret) => ret.rows);
  // console.log('result :>> ', result);
  return result;
}

const getCurrentVitalsData = database.withConnection(getCurrentVitalsSqlExecutor);

module.exports = {
  getCurrentVitalsData,
};
