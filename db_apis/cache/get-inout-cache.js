/*
 * @Author: Peng Zeng
 * @Date: 2020-09-19 15:58:46
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-25 09:19:10
 */

const database = require("../../services/database");

const GET_INOUT_CACHE_SQL = `
SELECT
  PERSON_ID, 
  INOUT_VALUE, 
  SHORT_LABEL, 
  DT_UNIX, 
  INOUT_TYPE, 
  UPDT_TM
FROM API_CACHE_INOUT
WHERE PERSON_ID = :person_id
`;


const getInoutCache =  database.withConnection(async (conn,binds) => {
  const arr = await conn.execute(GET_INOUT_CACHE_SQL, binds).then( ret=>ret.rows );  
  return arr;
});


module.exports = {
  getInoutCache,
};