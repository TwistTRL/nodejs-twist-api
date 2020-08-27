/*
 * @Author: Peng Zeng
 * @Date: 2020-08-27 07:28:25
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-08-27 07:32:40
 */

const database = require("../../services/database");

const GET_PERSON_LINES_SQL = `
SELECT 
  ENCNTR_ID, 
  EVENT_CD_SUBTYPE, 
  DISP, 
  LINE_ID, 
  INSERT_DTM, 
  REMOVE_DTM, 
  EVENT_CD_GROUP,
  DIP, 
  LOCATION, 
  DIAM 
FROM LINES
WHERE PERSON_ID = :person_id
ORDER BY INSERT_DTM`;

const GET_PERSON_LINES_COUNTER_SQL = `
SELECT
  LINE_ID,
  LINE_CT,
  PERFORMED_DT_TM,
  ENCNTR_ID, 
  EVENT_CD_SUBTYPE, 
  EVENT_CD_GROUP  
FROM LINES_COUNTER 
WHERE PERSON_ID = :person_id`;

async function getLinesSqlExecutor(conn, binds) {
  let person_lines = await conn.execute(GET_PERSON_LINES_SQL, binds).then((ret) => ret.rows);
  if (person_lines) {
    return {
      encounter_id: person_lines["ENCNTR_ID"],
      event_subtype: person_lines["EVENT_CD_SUBTYPE"],
      disp: person_lines["DISP"],
      line_id: person_lines["LINE_ID"],
      insert_dtm: person_lines["INSERT_DTM"],
      remove_dtm: person_lines["REMOVE_DTM"],
    };
  } else {
    return person_lines;
  }
}

async function getLinesCounterSqlExecutor(conn, binds) {
  let person_lines_counter = await conn
    .execute(GET_PERSON_LINES_SQL, binds)
    .then((ret) => ret.rows);

  let result = {};
  person_lines_counter.forEach((element) => {
    let line_id = element["LINE_ID"];
    let cur_obj = {
      line_ct: element["LINE_CT"],
      time: element["PERFORMED_DT_TM"],
      encounter_id: element["ENCNTR_ID"],
      event_subtype: element["EVENT_CD_SUBTYPE"],
      event_group: element["EVENT_CD_GROUP"],
    };
    if (line_id in result) {
      result[line_id].push(cur_obj);
    } else {
      result[line_id] = [cur_obj];
    }
  });

  return result;
}

const getLines = database.withConnection(getLinesSqlExecutor);
const getLinesCounter = database.withConnection(getLinesCounterSqlExecutor);

module.exports = {
  getLines,
  getLinesCounter,
};
