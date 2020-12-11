/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-10 18:52:12 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-10 21:36:59
 */


const database = require("../../services/database");

const SQL_GET_TEAM =`
SELECT
  NAME_PERSONNEL,
  START_UNIX,
  END_UNIX
FROM ADT_PERSONNEL
WHERE PERSON_ID = :person_id 
  AND NAME_PERSONNEL LIKE 'Team%'
  AND :timestamp >= START_UNIX
ORDER BY START_UNIX DESC
`;


async function getTeamSqlExecutor(conn, binds) {
  const result = await conn.execute(SQL_GET_TEAM, binds).then(ret => ret.rows);
  return result;
}

const getCensusTeamData = database.withConnection(getTeamSqlExecutor);

module.exports = {
  getCensusTeamData,
};