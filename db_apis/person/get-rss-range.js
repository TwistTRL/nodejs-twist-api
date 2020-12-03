/*
 * @Author: Peng Zeng 
 * @Date: 2020-09-11 17:14:49 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-01 14:16:09
 */

const database = require("../../services/database");

const GET_RESPIRATORY_SUPPORT_VARIABLE_SQL = `
(
  SELECT RSS_UPDATED.*
  FROM RSS_UPDATED 
  WHERE PERSON_ID = :person_id
  ORDER BY EVENT_END_DT_TM_UNIX
  FETCH FIRST 1 ROWS ONLY
)
UNION ALL
(
  SELECT RSS_UPDATED.*
  FROM RSS_UPDATED 
  WHERE PERSON_ID = :person_id
  ORDER BY EVENT_END_DT_TM_UNIX DESC
  FETCH FIRST 1 ROWS ONLY
)`

async function getRssRangeSqlExecutor(conn,binds){
  let arr = await conn.execute(GET_RESPIRATORY_SUPPORT_VARIABLE_SQL,binds).then( ret=>ret.rows );
  
  return {
    rss_start: arr[0] ? arr[0].EVENT_END_DT_TM_UNIX : null,
    RSS_END: arr[1]? arr[1].EVENT_END_DT_TM_UNIX : null,
  };
}

const getRssRange =  database.withConnection(getRssRangeSqlExecutor);

module.exports = {
  getRssRange
};
