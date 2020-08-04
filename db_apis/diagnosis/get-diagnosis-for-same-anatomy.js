/*
 * @Author: Peng Zeng
 * @Date: 2020-08-04 08:49:44
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-08-04 10:34:29
 */

const database = require("../../services/database");
const { diagnosisQuerySQLExecutor } = require("./get-diagnosis");

const SQL_GET_SAME_ANATOMY = `
SELECT 
  DISTINCT MRN,
  ANATOMY
FROM DIAGNOSIS
WHERE ANATOMY = (SELECT 
         DISTINCT ANATOMY
        FROM DIAGNOSIS
        WHERE MRN = :mrn)`;

const getDiagnosisForMrnList = database.withConnection(async function (conn, binds) {
  console.log("~~SQL_GET_SAME_ANATOMY: ", SQL_GET_SAME_ANATOMY);
  let rawRecord = await conn.execute(SQL_GET_SAME_ANATOMY, binds);
  if (!rawRecord.rows[0]) {
    return "Error: no ANATOMY";
  }
  const anatomy = rawRecord.rows[0].ANATOMY;
  console.log("anatomy :>> ", anatomy);
  let mrnList = rawRecord.rows.map((x) => x.MRN);
  console.log("mrnList :>> ", mrnList);

  let result = [];
  for (let mrn of mrnList) {
    console.log("mrn :>> ", mrn);
    let mrnListBinds = { mrn };
    let curResult = await diagnosisQuerySQLExecutor(conn, mrnListBinds);
    result.push({ mrn, display: curResult });
  }

  return result;
});

module.exports = {
  getDiagnosisForMrnList,
};
