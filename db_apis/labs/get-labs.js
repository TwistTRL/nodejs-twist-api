/*
 * @Author: Peng Zeng 
 * @Date: 2020-09-10 17:00:02 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-11 10:20:08
 */

const database = require('../../services/database');
const {  LABS_EVENT_CD_DICT,
  WORKING_LABS_XLSX_PATH,
  } = require('../../db_relation/labs-db-relation');

const GET_LABS_BY_PERSONID_SQL = `
SELECT 
  PERSON_ID,
  DT_UNIX,
  ORDER_ID,
  EVENT_CD,
  LAB,
  VALUE,
  UNITS,
  NORMAL_LOW,
  NORMAL_HIGH,
  CRITICAL_LOW,
  CRITICAL_HIGH
FROM LABS
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX
`;

async function getLabSqlExecutor(conn, binds) {
  const lab = await conn.execute(GET_LABS_BY_PERSONID_SQL, binds);
  let arr = lab.rows;
  console.log('lab size of current person', arr.length);
  let result = arr.map(x => {
    return {...x, ...LABS_EVENT_CD_DICT[x.EVENT_CD]}
  });
  return result;
}

const getLabs = database.withConnection(getLabSqlExecutor);

module.exports = {
  getLabs
};
