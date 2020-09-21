/*
 * @Author: Peng Zeng
 * @Date: 2020-09-20 18:03:02
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-21 08:41:56
 */

const database = require("../../services/database");
const moment = require("moment");
const { DIAGNOSES_TO_DISPLAY } = require("twist-xlsx");

const SQL_GET_OPERATIVE = `
SELECT DISTINCT
  MRN,
  EVENT_ID,
  EVENT_DT_TM,
  DIAGNOSES,
  STUDY_TYPE
FROM FYLER_RAW
WHERE (STUDY_TYPE = 'SURG_FYLER_PRI_PRO' OR STUDY_TYPE = 'CATH_PROC')
  AND MRN = :mrn
ORDER BY EVENT_DT_TM`;

async function verticalBarQuerySQLExecutor(conn, binds) {
  const rawRecord = await conn.execute(SQL_GET_OPERATIVE, binds);

  if (!rawRecord.rows[0]) {
    console.log("Warning: no OPERATIVE");
    return [];
  }

  const timeline_array = [];
  for (let item of rawRecord.rows) {
    let event_id = item.EVENT_ID;
    timeline_array.push({
      event_id,
      unix_time: moment(item.EVENT_DT_TM).unix(),
      diagnoses: item.DIAGNOSES,
      study_type: item.STUDY_TYPE,
      operative_display:
        item.STUDY_TYPE === "SURG_FYLER_PRI_PRO" ? DIAGNOSES_TO_DISPLAY[item.DIAGNOSES] : "Cath",
    });
  }
  return timeline_array;
}

const getVerticalBarDisplay = database.withConnection(async function (conn, binds) {
  let result = await verticalBarQuerySQLExecutor(conn, binds);
  return result;
});

module.exports = { getVerticalBarDisplay };
