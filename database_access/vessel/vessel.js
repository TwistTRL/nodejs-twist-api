/*
 * @Author: Peng Zeng 
 * @Date: 2020-11-12 16:41:09 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 16:43:39
 */


const database = require("../../services/database");

// note: AUTOTIME is Eastern time
const GET_VESSEL_CATH_ACCESS_SQL = `
SELECT 
  AUTOTIME,
  ENTRSITE,
  SHETSZ,
  VESSDETL
FROM CATH_ACCESS
ORDER BY AUTOTIME
WHERE MRN = :mrn
`;

// note: INSERT_DTM is UTC
const GET_VESSEL_LINES_HD_SQL = `
SELECT 
  INSERT_DTM,
  VESSEL,
  LOCATION,
  EVENT_CD_SUBTYPE,
  DIAM,
  REMOVE_DTM,
  INSERT_DTM,
  INSERT_BY
FROM LINES_HD
ORDER BY INSERT_DTM
WHERE MRN = :mrn
`;


async function getVesselCathSqlExecutor(conn, binds) {
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS'`);
  let result = await conn.execute(GET_VESSEL_CATH_ACCESS_SQL, binds).then((ret) => ret.rows);
  return result;
}

async function getVesselLinesSqlExecutor(conn, binds) {
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
  let result = await conn.execute(GET_VESSEL_LINES_HD_SQL, binds).then((ret) => ret.rows);
  return result;
}


const getVesselCathData = database.withConnection(getVesselCathSqlExecutor);
const getVesselLinesData = database.withConnection(getVesselLinesSqlExecutor);

module.exports = {
  getVesselCathData,
  getVesselLinesData
};
