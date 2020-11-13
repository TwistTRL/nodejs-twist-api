/*
 * @Author: Peng Zeng 
 * @Date: 2020-11-12 16:41:09 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 16:43:39
 */


const database = require("../../services/database");

const GET_VESSEL_SQL = `
SELECT 
  REFNO,
  EVENT_ID,
  CARDPTID,
  SEQNO,
  AUTOTIME,
  ENTRSITE,
  PLANSITE,
  TIMEACCS,
  SHETSZ,
  ENTRMETH,
  VESSDETL
FROM CATH_ACCESS
WHERE MRN = :mrn
`;

async function getVesselSqlExecutor(conn, binds) {
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
  let result = await conn.execute(GET_VESSEL_SQL, binds).then((ret) => ret.rows);
  return result;
}

const getVesselData = database.withConnection(getVesselSqlExecutor);

module.exports = {
  getVesselData,
};
