/*
 * @Author: Peng Zeng
 * @Date: 2020-09-19 15:58:46
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-13 15:06:25
 */

const oracledb = require("oracledb");
const moment = require("moment");

const { getVitalsQueryV2 } = require("../../db_apis/get-vitals-all-v2");

const DELETE_VITALS_CACHE_SQL = (n) => ` 
DELETE FROM API_CACHE_VITALS
  WHERE PERSON_ID IN (${[...new Array(n).keys()].map((i) => ":" + i.toString()).join(",")})
`;


const INSERT_VITALS_CACHE_SQL = `
INSERT INTO API_CACHE_VITALS
  (PERSON_ID, VITALS_VALUE, NAME, TIME, VITALS_TYPE, VITALS_SOURCE, UPDT_UNIX)
VALUES
  (:person_id, :vitals_value, :name, :time, :vitals_type, :vitals_source, :updt_unix)
`;

const insertVitalsCache = async (patients) => {
  let binds = [];
  for (let patient of patients) {
    let person_id = Number(patient.PERSON_ID);
    let query = {
      person_id,
      from: 0,
      to: moment().unix(),
      vital_type: "hr",
    };
    console.log('getting vitals record for person_id = ', person_id);
    let vitalsResult = await getVitalsQueryV2(query);
    for (let vitalsRecord of vitalsResult) {
      let bind = {
        person_id,
        vitals_value: vitalsRecord.value,
        time: vitalsRecord.time,
        name: vitalsRecord.name,
        vitals_type: vitalsRecord.type,
        vitals_source: vitalsRecord.source,
        updt_unix: moment().unix(),
      };
      binds.push(bind);
    }
  }
  console.log('vitals records updated numbers :>> ', binds.length);

// write into database table API_CACHE_VITALS
  console.time("insert-database");
  const conn = await oracledb.getConnection();
  const deleteSql = DELETE_VITALS_CACHE_SQL(patients.length);
  const deleteTable = await conn.execute(deleteSql, patients.map((x) => Number(x.PERSON_ID)));
  const insertTable = await conn.executeMany(INSERT_VITALS_CACHE_SQL, binds);
  await conn.commit();
  await conn.close();
  console.timeEnd("insert-database");

  return insertTable;
};



module.exports = {
  insertVitalsCache,
};
