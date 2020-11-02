/*
 * @Author: Peng Zeng
 * @Date: 2020-09-20 18:03:02
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-31 10:50:39
 */

const database = require("../../services/database");
const moment = require("moment");
const { DIAGNOSES_TO_DISPLAY } = require("twist-xlsx");
const { getPersonFromMrn } = require("../person/get-person-info");

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

// For Cache
const GET_DIAGNOSIS_CACHE_SQL = `
SELECT
  EVENT_ID, 
  DT_UNIX, 
  DIAGNOSES, 
  STUDY_TYPE,
  OPERATIVE_DISPLAY
FROM API_CACHE_DIAGNOSIS
WHERE PERSON_ID = :person_id
`;


async function verticalBarQuerySQLExecutor(conn, binds) {
  // set nls_date_format for oracledb.fetchAsString
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS'`)

  const rawRecord = await conn.execute(SQL_GET_OPERATIVE, binds);

  if (!rawRecord.rows[0]) {
    console.log("Warning: no OPERATIVE");
    return [];
  }

  const timeline_array = [];
  for (let item of rawRecord.rows) {
    let event_id = item.EVENT_ID;
    console.log('item.EVENT_DT_TM :>> ', item.EVENT_DT_TM);
    console.log('moment(item.EVENT_DT_TM).unix() :>> ', moment(item.EVENT_DT_TM).unix());

    timeline_array.push({
      event_id,
      // FIXME:
      // CONFIRM UTC OR EST?EDT then convert to unix time!
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
  console.time("vertical-bar-time");

  // USE CACHE
  const person_id_arr = await getPersonFromMrn(binds);
  if (person_id_arr.length > 1) {
    console.warn("person_id_arr :>> ", person_id_arr);
  }
  const person_id = person_id_arr[0].PERSON_ID;
  console.log("vertical bar cache for person_id :>> ", person_id);
  const arr = await conn.execute(GET_DIAGNOSIS_CACHE_SQL, { person_id }).then((ret) => ret.rows);
  if (arr && arr.length) {
    //TODO CHECK
    const ret = arr.map((element) => {
      return {
        event_id: element.EVENT_ID,
        unix_time: element.DT_UNIX,
        diagnoses: element.DIAGNOSES,
        study_type: element.STUDY_TYPE,
        operative_display: element.OPERATIVE_DISPLAY,
      };
    });
    console.timeEnd("vertical-bar-time");

    return ret;
  }
  console.log("no cache. calculating");

  let result = await verticalBarQuerySQLExecutor(conn, binds);
  console.timeEnd("vertical-bar-time");

  return result;
});

module.exports = { getVerticalBarDisplay };
