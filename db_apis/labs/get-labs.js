/*
 * @Author: Peng Zeng
 * @Date: 2020-09-10 17:00:02
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-05 14:05:12
 */

const database_prd = require("../../services/database-prd");
const { LABS_EVENT_CD_DICT } = require("../../db_relation/labs-db-relation");

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
  DT_TM_UTC_VERIFIED,
  PERSONNEL_ID_VERIFIED,
  PERSON_VERIFIED,
  UPDT_DT_TM_UTC
FROM TWIST.LABS
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX
`;

async function getLabSqlExecutor(conn, binds) {
  // set nls_date_format for oracledb.fetchAsString
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
  // FIXME:
  // now nls_date_format makes everytime item UTC time. However CREATED_DT_TM_EST is EST time
  // will fix this when all the columns in the databse have clear definition about timezone.

  console.time("get-labs-prod");
  const lab = await conn.execute(GET_LABS_BY_PERSONID_SQL, binds);
  let arr = lab.rows;
  console.log("lab size of current person", arr.length);
  console.timeEnd("get-labs-prod");

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

const getLabsArray = database_prd.withConnection(getLabSqlExecutor);

module.exports = {
  getLabsArray,
};
