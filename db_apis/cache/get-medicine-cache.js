/*
 * @Author: Peng Zeng 
 * @Date: 2020-10-15 15:19:58 
 * @Last Modified by:   Peng Zeng 
 * @Last Modified time: 2020-10-15 15:19:58 
 */


const database = require("../../services/database");

const GET_NOTE_CACHE_SQL = `
SELECT
  EVENT_ID, 
  PROCEDURAL_NOTE, 
  NOTE_ORDER,
  UPDT_UNIX
FROM API_CACHE_PROCEDURAL_NOTE
WHERE EVENT_ID = :event_id
`;


const getNoteCache =  database.withConnection(async (conn,binds) => {
  const arr = await conn.execute(GET_NOTE_CACHE_SQL, binds).then( ret=>ret.rows );  
  return arr;
});


module.exports = {
  getNoteCache,
};
