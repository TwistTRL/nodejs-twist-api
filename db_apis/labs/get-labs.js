/*
 * @Author: Peng Zeng
 * @Date: 2020-09-10 17:00:02
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-29 13:23:31
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
  let resultArr = arr.map((x) => {
    return { ...x, ...LABS_EVENT_CD_DICT[x.EVENT_CD] };
  });
  console.log('resultArr.length :>> ', resultArr.length);

  return resultArr;
}

const getLabsArray = database.withConnection(getLabSqlExecutor);

module.exports = {
  getLabsArray,
};
