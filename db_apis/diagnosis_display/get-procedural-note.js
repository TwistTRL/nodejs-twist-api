/*
 * @Author: Peng Zeng 
 * @Date: 2020-08-27 11:37:31 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-08-27 11:59:09
 */

const moment = require("moment");


const SQL_GET_NOTE_TEXT = (event_id) => `
SELECT
  COLUMN_VALUE
FROM TABLE(RAC_NOTE_TO_STR('EVENT', ${event_id}))
WHERE COLUMN_VALUE != '0'
`;

async function getNotesSQL(conn, event_id) {
    return await conn.execute(SQL_GET_NOTE_TEXT(event_id));
}


async function getNotes(conn, event_id_arr) {


    // const redisKey = `VerticalBar:${JSON.stringify(mrn)}`;
    // console.log("redisKey :", redisKey);
    // let result = await ctx.service.cache.get(redisKey);
    // if (result) {
    //   console.log("--> from cache");
    // } else {
    //   await ctx.service.twist.getVerticalBarTimeline.find(mrn);
    //   result = await ctx.service.cache.get(redisKey);
    //   if (!result) {
    //     return "Error";
    //   }
    // }

    if (!event_id_arr[0]) {
      return "Error: no OPERATIVE";
    }

    let note_string = {};

    for (let item of result) {
      let event_id = item[1];
      if (!(event_id in note_string)) {
        let rawNoteRecord = await getNotesSQL(conn, event_id);
        let cur_note_string = rawNoteRecord.rows.reduce((acc, cur) => acc + cur, "");
        note_string[event_id] = cur_note_string;
      }      
    }

    for (let id in note_string) {
      if (!note_string[id]) {
        delete note_string[id];
      }
    }

    return note_string;
  }
}

module.exports = NotesService;
