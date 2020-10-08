/*
 * @Author: Peng Zeng
 * @Date: 2020-09-10 17:00:02
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-05 21:38:48
 */

const database = require("../../services/database");
const {
  LABS_EVENT_CD_DICT,
  WORKING_LABS_XLSX_PATH,
} = require("../../db_relation/labs-db-relation");

const GET_LABS_BY_PERSONID_SQL = `
SELECT 
  DT_UNIX,
  ORDER_ID,
  EVENT_CD,
  LAB,
  VALUE,
  UNITS,
  NORMAL_LOW,
  NORMAL_HIGH,
  CRITICAL_LOW,
  CRITICAL_HIGH,
  SOURCE,
  ORIG_ORDER_DT_TM_UTC,
  ORDER_PERSON,
  SCHEDULED_DT_TM_UTC,
  SCHEDULED_PERSON,
  DISPATCHED_DT_TM_UTC,
  DISPATCHED_PERSON,
  COLLECTED_DT_TM_UTC,
  COLLECTED_PERSON,
  IN_TRANSIT_DT_TM_UTC,
  IN_TRANSIT_PERSON,
  IN_LAB_DT_TM_UTC,
  IN_LAB_PERSON,
  IN_PROCESS_DT_TM_UTC,
  IN_PROCESS_PERSON,
  COMPLETED_DT_TM_UTC,
  COMPLETED_PERSON,
  CODE_VALUE.DISPLAY AS DISPLAY_NAME
FROM STAGING_LABS_NEW
JOIN CODE_VALUE
  ON STAGING_LABS_NEW.EVENT_CD = CODE_VALUE.CODE_VALUE
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX
`;

async function getLabSqlExecutor(conn, binds) {
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
