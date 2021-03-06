/*
 * @Author: Peng Zeng
 * @Date: 2021-02-09 20:27:10
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-03-09 23:06:49
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

const {
  NOTES_EVENT_DICT,
  NOTES_EVENT_XLSX_PATH,
} = require("../../db_relation/notes-db-relation");

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

const GET_NOTES_CONTENTS_SQL = `
SELECT
  BLOB_CONTENTS,
  BLOB_LENGTH,
  BLOB_SEQ_NUM,
  COMPRESSION_CD,
  "FORMAT",
  EVENT_END_DT_TM,
  UPDT_DT_TM_CB
FROM NOTES
WHERE EVENT_ID = :event_id
ORDER BY EVENT_END_DT_TM, UPDT_DT_TM_CB DESC
`;

/**
 *
 * @param {Object} binds = {event_id}
 *
 * Using LZW.jar java to do LZW compression/decompression
 */

const getNotesContentsForEventId = async (binds) => {
  const getNotesContentsData = database.withConnection(async (conn) => {
    await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
    return conn.execute(GET_NOTES_CONTENTS_SQL, binds).then((res) => res.rows);
  });

  const notesContentsData = await getNotesContentsData();
  if (notesContentsData.length !== 1) {
    // console.warn("notesContentsData length !== 1: ");
    if (!notesContentsData.length) {
      return null;
    }
  }

  const ret = [];
  for (const element of notesContentsData) {
    // console.log("element :>> ", element);
    let notes = "";
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

      const result = child_process.spawn("java", ["-cp", jarPath, jarClassName, arrString]);

      for await (const data of result.stdout) {
        notes += data;
      }
    }

    ret.push({
      FORMAT: element.FORMAT,
      EVENT_END_DT_TM: element.EVENT_END_DT_TM,
      UPDT_DT_TM_CB: element.UPDT_DT_TM_CB,
      NOTES: notes,
    });
  }
  return ret;
};

const getNotesForPatientId = async (binds) => {
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
    ret.push({
      ENCNTR_ID: element.ENCNTR_ID,
      EVENT_CD: element.EVENT_CD,
      EVENT_CLASS_CD: element.EVENT_CLASS_CD,
      EVENT_DISP: element.EVENT_DISP,
      EVENT_END_DT_TM: element.EVENT_END_DT_TM,
      EVENT_ID: element.EVENT_ID,
      TWIST_DISPLAY_CATEGORY: element.EVENT_CD in NOTES_EVENT_DICT ? NOTES_EVENT_DICT[element.EVENT_CD].TWIST_DISPLAY_CATEGORY : null,
      TWIST_DISPLAY: element.EVENT_CD in NOTES_EVENT_DICT ? NOTES_EVENT_DICT[element.EVENT_CD].DISPLAY : null,
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
      // NOTES: notes,
    });
  }

  return ret;
};

module.exports = {
  getNotesForPatientId,
  getNotesContentsForEventId,
};
