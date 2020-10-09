/*
 * @Author: Peng Zeng 
 * @Date: 2020-09-30 07:32:11 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-30 07:42:44
 */

const oracledb = require("oracledb");
const moment = require("moment");

const INSERT_PATIENTS_CACHE_SQL = `
INSERT INTO API_CACHE_PATIENTS
  (PERSON_ID, MRN, UPDT_TM)
VALUES
  (:person_id, :mrn, TO_DATE(:update_time, 'YYYY-MM-DD HH24:MI:SS'))
`;

const insertPatientsCache = async (patients) => {
  let binds = [];
  for (let patient of patients) {
    let person_id = Number(patient.PERSON_ID);
    let mrn = patient.MRN;
    let update_time = moment().format("YYYY-MM-DD HH:mm:ss");

    binds.push({
      person_id,
      mrn,
      update_time,
    });
   
  }

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
