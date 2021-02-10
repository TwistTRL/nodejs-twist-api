/*
 * @Author: Peng Zeng
 * @Date: 2021-02-09 20:27:10
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-09 22:16:24
 */

/**
 *  new get notes method,
 *  will replace previous get-procedural-note.js
 */

const database = require("../../services/database");
// note: in /services/database.js, oracledb.fetchAsBuffer = [ oracledb.BLOB ];
const fs = require('fs');

const GET_NOTES_SQL = `
SELECT
  BLOB_CONTENTS,
  COMPRESSION_CD,
  EVENT_ID
FROM NOTES
`;

const getNotes = async (person_id) => {
  const getNotesData = database.withConnection(
    async (conn) => await conn.execute(GET_NOTES_SQL).then((res) => res.rows)
  );

  const notesData = await getNotesData();
  // console.log('notesData :>> ', notesData);
  if (!notesData.length) {
    return null;
  }

  // console.log('notesData :>> ', notesData);

  // console.log("notesData[0] :>> ", notesData[0]);

  const ret = notesData
    .map((item, index) => {
      const blobData = item.BLOB_CONTENTS.toString();
      if (item.COMPRESSION_CD === 727) {
        return { EVENT_ID: item.EVENT_ID, NOTES: blobData };
      }

      fs.writeFileSync(index + ".txt", blobData);
      return null;
    })
    .filter(Boolean);

  return ret;
};

module.exports = {
  getNotes,
};
