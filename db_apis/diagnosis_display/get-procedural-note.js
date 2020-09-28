/*
 * @Author: Peng Zeng
 * @Date: 2020-08-27 11:37:31
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-25 10:29:23
 */

const moment = require("moment");
const database = require("../../services/database");

const SQL_GET_NOTE_TEXT = (event_id) => `
SELECT
  COLUMN_VALUE
FROM TABLE(RAC_NOTE_TO_STR('EVENT', ${event_id}))
WHERE COLUMN_VALUE != '0'
`;

async function proceduralNoteSQLExecutor(conn, event_id_arr) {
  if (!event_id_arr || !event_id_arr[0]) {
    console.log("Warning: no notes");
    return {};
  }
  console.time("note-time");

  let note_string = {};
  for (let item of event_id_arr) {
    let event_id = item.event_id;
    if (!(event_id in note_string)) {
      let rawNoteRecord = await conn.execute(SQL_GET_NOTE_TEXT(event_id));
      let cur_note_string = rawNoteRecord.rows.reduce((acc, cur) => acc + cur.COLUMN_VALUE, "");
      note_string[event_id] = cur_note_string;
    }
  }

  for (let id in note_string) {
    if (!note_string[id]) {
      delete note_string[id];
    }
  }
  console.timeEnd("note-time");

  return note_string;
}

async function proceduralNoteArraySQLExecutor(conn, event_id) {
  let rawNoteRecord = await conn.execute(SQL_GET_NOTE_TEXT(event_id));
  note_arr = rawNoteRecord.rows;

  return note_arr;
}

const getProceduralNote = database.withConnection(async function (conn, event_id_arr) {
  return await proceduralNoteSQLExecutor(conn, event_id_arr);
});

const getProceduralNoteArray = database.withConnection(async function (conn, event_id) {
  return await proceduralNoteArraySQLExecutor(conn, event_id);
});

module.exports = { getProceduralNote, getProceduralNoteArray };
