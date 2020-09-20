/*
 * @Author: Peng Zeng
 * @Date: 2020-09-19 15:52:23
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-19 17:21:23
 */

const database = require("../../services/database");

const GET_PATIENTS_BY_LOCATION_SQL = `
SELECT 
  PERSON_ID,
  MRN,
  ENCNTR_ID,
  START_UNIX,
  NURSE_UNIT_DISP,
  BED_DISP,
  ROOM_DISP
FROM ADT
JOIN CHB_MRN
USING(PERSON_ID)
WHERE NURSE_UNIT_DISP = :nurse_unit_disp
  AND END_EFFECTIVE_DT_TM_UTC > SYSDATE 
ORDER BY BEG_EFFECTIVE_DT_TM_UTC
`;

async function getPatientsByLocationSqlExecutor(conn, binds = { nurse_unit_disp: "08 South" }) {
  let result = await conn.execute(GET_PATIENTS_BY_LOCATION_SQL, binds).then((ret) => ret.rows);
  return result;
}

const getPatientsByLocation = database.withConnection(getPatientsByLocationSqlExecutor);

module.exports = {
  getPatientsByLocation,
};
