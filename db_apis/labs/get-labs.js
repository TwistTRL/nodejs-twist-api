/*
 * @Author: Peng Zeng
 * @Date: 2020-09-10 17:00:02
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-12 18:14:16
 */

const database = require("../../services/database");
const {
  LABS_EVENT_CD_DICT,
  WORKING_LABS_XLSX_PATH,
} = require("../../db_relation/labs-db-relation");

const GET_LABS_BY_PERSONID_SQL = `
SELECT 
  EVENT_ID,
  ENCNTR_ID,
  ORDER_ID,
  DT_UTC,
  EVENT_CD,
  SOURCE,
  LAB,
  VALUE,
  UNITS,
  NORMAL_LOW,
  NORMAL_HIGH,
  CRITICAL_LOW,
  CRITICAL_HIGH,
  NORMALCY,
  DT_UNIX,
  CREATED_DT_TM_EST,
  ORIG_ORDER_DT_TM_UTC,
  ORDER_PERSON,
  DT_TM_UTC_SCHEDULED,
  PERSONNEL_ID_SCHEDULED,
  PERSON_SCHEDULED,
  DT_TM_UTC_DISPATCHED,
  PERSONNEL_ID_DISPATCHED,
  PERSON_DISPATCHED,
  DT_TM_UTC_COLLECTED,
  PERSONNEL_ID_COLLECTED,
  PERSON_COLLECTED,
  DT_TM_UTC_IN_TRANSIT,
  PERSONNEL_ID_IN_TRANSIT,
  PERSON_IN_TRANSIT,
  DT_TM_UTC_IN_LAB,
  PERSONNEL_ID_IN_LAB,
  PERSON_IN_LAB,
  DT_TM_UTC_IN_PROCESS,
  PERSONNEL_ID_IN_PROCESS,
  PERSON_IN_PROCESS,
  DT_TM_UTC_COMPLETED,
  PERSONNEL_ID_COMPLETED,
  PERSON_COMPLETED,
  DT_TM_UTC_PERFORMED,
  PERSONNEL_ID_PERFORMED,
  PERSON_PERFORMED,
  UPDT_DT_TM_UTC
FROM LABS_PRD
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX
`;

async function getLabSqlExecutor(conn, binds) {
  // set nls_date_format for oracledb.fetchAsString
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD HH24:MI:SS'`)
  const lab = await conn.execute(GET_LABS_BY_PERSONID_SQL, binds);
  let arr = lab.rows;
  console.log("lab size of current person", arr.length);

  // based on results of GET_LABS_BY_PERSONID_SQL,
  // adding TABLE, DISPLAY_ORDER, TWIST_DISPLAY_NAME, EVENT_CD, EVENT_CD_DESCRIPTION, SOURCE for this event_cd
  // if event_cd not in the file, then it's TABLE: "MISC"

  // example item for LABS_EVENT_CD_DICT from WORKING_LABS.xlsx:
  // '911993469': {
  //   TABLE: 'BLOOD GAS',
  //   DISPLAY_ORDER: 7,
  //   TWIST_DISPLAY_NAME: 'SO2',
  //   EVENT_CD: 911993469,
  //   EVENT_CD_DESCRIPTION: 'OR SO2 CPB',
  //   SOURCE: 'CPB'
  // },

  let resultArr = arr.map((x) => {
    let working_labs_obj =
      x.EVENT_CD in LABS_EVENT_CD_DICT ? LABS_EVENT_CD_DICT[x.EVENT_CD] : { TABLE: "MISC" };

    return { ...x, ...working_labs_obj };
  });
  console.log("resultArr.length :>> ", resultArr.length);
  return resultArr;
}

const getLabsArray = database.withConnection(getLabSqlExecutor);

module.exports = {
  getLabsArray,
};
