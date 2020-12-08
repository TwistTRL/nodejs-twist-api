/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-01 13:52:41 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-08 12:58:12
 */


const database = require("../../services/database");

const GET_PERSONNEL_SQL = `
SELECT 
  ASSIGN_TYPE, 
  PARENT_ENTITY_ID, 
  NAME_FULL_FORMATTED,
  CONTACT_NUM,
  START_UNIX,
  END_UNIX
FROM ADT_PERSONNEL
WHERE PERSON_ID = :person_id`;

async function getPersonnelSqlExecutor(conn, binds) {
  let personnel = await conn.execute(GET_PERSONNEL_SQL, binds).then((res) => res.rows);
  return personnel;
}


const getPersonnel = database.withConnection(getPersonnelSqlExecutor);

module.exports = {
  getPersonnel,
};
