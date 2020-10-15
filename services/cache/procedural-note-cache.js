/*
 * @Author: Peng Zeng
 * @Date: 2020-09-21 07:55:17
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-15 09:06:13
 */

const oracledb = require("oracledb");
const moment = require("moment");

const { getProceduralNoteArray } = require("../../db_apis/diagnosis_display/get-procedural-note");
const { getVerticalBarDisplay } = require("../../db_apis/diagnosis_display/get-verticalbar-timeline");

const DELETE_NOTE_CACHE_SQL = (n) => `
DELETE FROM API_CACHE_PROCEDURAL_NOTE
  WHERE EVENT_ID IN (${[...new Array(n).keys()].map((i) => ":" + i.toString()).join(",")})
`;

const INSERT_NOTE_CACHE_SQL = `
INSERT INTO API_CACHE_PROCEDURAL_NOTE
  (EVENT_ID, PROCEDURAL_NOTE, UPDT_UNIX, NOTE_ORDER)
VALUES
  (:event_id, :procedural_note, :updt_unix, :note_order)
`;

const insertNoteCache = async (patients) => {
  let binds = [];
  let eventIdSet = new Set();
  for (let patient of patients) {
    let mrn = patient.MRN;
    console.log("insertNoteCache mrn :>> ", mrn);

    let verticalBarDisplay = await getVerticalBarDisplay({ mrn });
    if (verticalBarDisplay && verticalBarDisplay.length) {
      for (let verticalBar of verticalBarDisplay) {
        let note_order = 0;
        let event_id = verticalBar.event_id;
        eventIdSet.add(event_id);
        let note_arr = await getProceduralNoteArray(event_id);
        let bind = note_arr.map((item) => {
          note_order++;
          return {
            event_id,
            procedural_note: item["COLUMN_VALUE"],
            updt_unix: moment().unix(),
            note_order,
          };
        });
        binds = [...binds, ...bind];
      }
    }    
  }
  console.log("insert records length :>> ", binds.length);

  // write into database table API_CACHE_PROCEDURAL_NOTE
  console.time("insert-database-note");
  const conn = await oracledb.getConnection();
  const deleteTable = await conn.execute(DELETE_NOTE_CACHE_SQL(eventIdSet.size), [...eventIdSet]);
  const insertTable = await conn.executeMany(INSERT_NOTE_CACHE_SQL, binds);
  await conn.commit();
  await conn.close();
  console.timeEnd("insert-database-note");

  return insertTable;
};


module.exports = {
  insertNoteCache,
};
