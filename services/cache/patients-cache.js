/*
 * @Author: Peng Zeng 
 * @Date: 2020-09-30 07:32:11 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-13 08:27:05
 */

const oracledb = require("oracledb");
const moment = require("moment");

const INSERT_PATIENTS_CACHE_SQL = `
INSERT INTO API_CACHE_PATIENTS
  (PERSON_ID, MRN, UPDT_UNIX)
VALUES
  (:person_id, :mrn, :updt_unix)
`;

const insertPatientsCache = async (patients) => {
  let binds = [];
  for (let patient of patients) {
    let person_id = Number(patient.PERSON_ID);
    let mrn = patient.MRN.toString();
    let updt_unix = moment().unix();

    binds.push({
      person_id,
      mrn,
      updt_unix,
    });   
  }
  // console.log('binds :>> ', binds);

  // write into database table API_CACHE_PATIENTS
  console.time("insert-database-patients");
  const conn = await oracledb.getConnection();
  const insertTable = await conn.executeMany(INSERT_PATIENTS_CACHE_SQL, binds);
  await conn.commit();
  await conn.close();
  console.timeEnd("insert-database-patients");

  return insertTable;
};


module.exports = {
  insertPatientsCache,
};
