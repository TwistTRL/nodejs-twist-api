/*
 * @Author: Peng Zeng
 * @Date: 2021-02-09 20:27:10
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-14 11:43:36
 */

/**
 *  new get notes method,
 *  will replace previous get-procedural-note.js
 */

const path = require("path");
const child_process = require("child_process");
// const FileType = require("file-type");
// const parseRTF = require('rtf-parser');

const database = require("../../services/database");
// note: in /services/database.js, oracledb.fetchAsBuffer = [ oracledb.BLOB ];

const GET_NOTES_SQL = `
SELECT
  BLOB_CONTENTS,
  BLOB_LENGTH,
  BLOB_SEQ_NUM,
  COMPRESSION_CD,
  ENCNTR_ID,
  EVENT_CD,
  EVENT_CLASS_CD,
  EVENT_DISP,
  EVENT_END_DT_TM,
  EVENT_ID,
  EVENT_TAG,
  EVENT_TITLE_TEXT,
  FORMAT,
  PARENT_EVENT_ID,
  PERFORMED_DT_TM,
  PERFORMED_PRSNL,
  VALID_FROM_DT_TM,
  VALID_UNTIL_DT_TM,
  VERIFIED_DT_TM,
  VERIFIED_PRSNL
FROM NOTES
WHERE PERSON_ID = :person_id
`;

const getNotes = async (binds) => {
  const getNotesData = database.withConnection(async (conn) => {
    await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
    return await conn.execute(GET_NOTES_SQL, binds).then((res) => res.rows);
  });

  const notesData = await getNotesData();
  // console.log('notesData :>> ', notesData);
  if (!notesData.length) {
    console.log("no notes data");
    return [];
  }

  console.log("notesData.length :>> ", notesData.length);

  const ret = [];
  for (const element of notesData) {
    let notes;
    // COMPRESSION_CD is 727(non-compressed) or 728
    if (element.COMPRESSION_CD === 727) {
      notes = element.BLOB_CONTENTS.toString();
    } else {
      // console.log('element.BLOB_CONTENTS :>> ', element.BLOB_CONTENTS);
      // const fileType = await FileType.fromBuffer(element.BLOB_CONTENTS);
      // console.log("fileType :>> ", fileType);
      const arr = Array.from(element.BLOB_CONTENTS);
      const arrString = arr.toString();
      // arrString = "12,123,25,..."

      const jarPath = path.join(__dirname, "LZW.jar");
      const jarClassName = "LZW";

      const result = child_process.spawnSync("java", ["-cp", jarPath, jarClassName, arrString]);
      notes = result.stdout.toString();
      if (!notes.length) {
        notes = result.stderr.toString();
        console.log("notes error :>> ", notes);
      }

      // if (notes.includes("{\\rtf1")) {
      //   parseRTF.string('notes', (err, doc) => {
      //     console.log('doc :>> ', doc);
      //     console.log('err :>> ', err);
      //   })
      // }
    }
    ret.push({
      ENCNTR_ID: element.ENCNTR_ID,
      EVENT_CD: element.EVENT_CD,
      EVENT_CLASS_CD: element.EVENT_CLASS_CD,
      EVENT_DISP: element.EVENT_DISP,
      EVENT_END_DT_TM: element.EVENT_END_DT_TM,
      EVENT_ID: element.EVENT_ID,
      EVENT_TAG: element.EVENT_TAG,
      EVENT_TITLE_TEXT: element.EVENT_TITLE_TEXT,
      FORMAT: element.FORMAT,
      PARENT_EVENT_ID: element.PARENT_EVENT_ID,
      PERFORMED_DT_TM: element.PERFORMED_DT_TM,
      PERFORMED_PRSNL: element.PERFORMED_PRSNL,
      VALID_FROM_DT_TM: element.VALID_FROM_DT_TM,
      VALID_UNTIL_DT_TM: element.VALID_UNTIL_DT_TM,
      VERIFIED_DT_TM: element.VERIFIED_DT_TM,
      VERIFIED_PRSNL: element.VERIFIED_PRSNL,
      NOTES: notes,
    });
  }

  return ret;
};

module.exports = {
  getNotes,
};
