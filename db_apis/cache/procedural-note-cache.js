/*
 * @Author: Peng Zeng
 * @Date: 2020-09-21 07:55:17
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-21 14:59:44
 */

const oracledb = require("oracledb");
const moment = require("moment");
const database = require("../../services/database");

const { getPatientsByLocation } = require("../adt/get-patients-by-location");

const { getProceduralNoteArray } = require("../diagnosis_display/get-procedural-note");
const { getVerticalBarDisplay } = require("../diagnosis_display/get-verticalbar-timeline");

const DELETE_NOTE_CACHE_SQL = `
DELETE FROM API_CACHE_PROCEDURAL_NOTE`;

const INSERT_NOTE_CACHE_SQL = `
INSERT INTO API_CACHE_PROCEDURAL_NOTE
  (EVENT_ID, PROCEDURAL_NOTE, UPDT_TM, NOTE_ORDER)
VALUES
  (:event_id, :procedural_note, TO_DATE(:update_time, 'YYYY-MM-DD HH24:MI:SS'), :note_order)
`;

const GET_NOTE_CACHE_SQL = `
SELECT
  EVENT_ID, 
  PROCEDURAL_NOTE, 
  NOTE_ORDER
FROM API_CACHE_PROCEDURAL_NOTE
WHERE EVENT_ID = :event_id
`;


const insertNoteCache = async () => {
  const patients = await getPatientsByLocation();
  let binds = [];
  for (let patient of patients) {
    let person_id = Number(patient.PERSON_ID);
    let mrn = patient.MRN;
    console.log("mrn :>> ", mrn);

    let verticalBarDisplay = await getVerticalBarDisplay({ mrn });

    for (let verticalBar of verticalBarDisplay) {
      let note_order = 0;
      let event_id = verticalBar.event_id;
      let note_arr = await getProceduralNoteArray(event_id);
      let bind = note_arr.map((item) => {
        note_order++;
        return {
          event_id,
          procedural_note: item["COLUMN_VALUE"],
          update_time: moment().format("YYYY-MM-DD HH:mm:ss"),
          note_order,
        };
      });
      binds = [...binds, ...bind];
    }
  }
  console.log("insert records length :>> ", binds.length);

  // write into database table API_CACHE_PROCEDURAL_NOTE
  console.time("insert-database-note");
  const conn = await oracledb.getConnection();
  const deleteTable = await conn.execute(DELETE_NOTE_CACHE_SQL);
  const insertTable = await conn.executeMany(INSERT_NOTE_CACHE_SQL, binds);
  await conn.commit();
  await conn.close();
  console.timeEnd("insert-database-note");

  return insertTable;
};

const getNoteCache =  database.withConnection(async (conn,binds) => {
  const arr = await conn.execute(GET_NOTE_CACHE_SQL, binds).then( ret=>ret.rows );  
  return arr;
});


module.exports = {
  insertNoteCache,
  getNoteCache,
};
