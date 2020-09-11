/*
 * @Author: Peng Zeng 
 * @Date: 2020-09-11 17:14:49 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-11 17:31:08
 */

const database = require("../../services/database");

const GET_RESPIRATORY_SUPPORT_VARIABLE_SQL = `
(
  SELECT RSS.*
  FROM RSS
  WHERE PERSON_ID = :person_id
  ORDER BY VALID_FROM_DT_TM
  FETCH FIRST 1 ROWS ONLY
)
UNION ALL
(
  SELECT RSS.*
  FROM RSS
  WHERE PERSON_ID = :person_id
  ORDER BY VALID_FROM_DT_TM DESC
  FETCH FIRST 1 ROWS ONLY
)`

async function getRssRangeSqlExecutor(conn,binds){
  let arr = await conn.execute(GET_RESPIRATORY_SUPPORT_VARIABLE_SQL,binds).then( ret=>ret.rows );
  
  return {
    rss_start: arr[0].VALID_FROM_DT_TM,
    rss_end: arr[1].VALID_FROM_DT_TM
  };
}

const getRssRange =  database.withConnection(getRssRangeSqlExecutor);

module.exports = {
  getRssRange
};
