/*
 * @Author: Peng Zeng
 * @Date: 2020-09-19 15:58:46
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-20 19:19:38
 */

const oracledb = require("oracledb");
// const database = require("../../services/database");
const moment = require("moment");

const { getPatientsByLocation } = require("../adt/get-patients-by-location");
const { getInOutQueryV2 } = require("../get-in-out-v2");

const DELETE_INOUT_CACHE_SQL = `
DELETE FROM API_CACHE_INOUT`;

const INSERT_INOUT_CACHE_SQL = `
INSERT INTO API_CACHE_INOUT
  (PERSON_ID, INOUT_VALUE, SHORT_LABEL, DT_UNIX, INOUT_TYPE)
VALUES
  (:person_id, :inout_value, :short_label, :dt_unix, :inout_type)
`;

const insertInoutCache = async () => {
  const patients = await getPatientsByLocation();
  let binds = [];
  for (let patient of patients) {
    let person_id = Number(patient.PERSON_ID);
    let query = {
      person_id,
      from: 0,
      to: moment().unix(),
      resolution: 3600,
    };
    let inoutResult = await getInOutQueryV2(query);

    for (let inoutRecord of inoutResult) {
      let bind = {
        person_id,
        inout_value: inoutRecord.value,
        short_label: inoutRecord.short_label,
        dt_unix: inoutRecord.time,
        inout_type: Number(inoutRecord.type),
      };
      binds.push(bind);
    }
  }

// write into database table API_CACHE_INOUT
  console.time("insert-database");
  const conn = await oracledb.getConnection();
  const deleteTable = await conn.execute(DELETE_INOUT_CACHE_SQL);
  const insertTable = await conn.executeMany(INSERT_INOUT_CACHE_SQL, binds);
  await conn.commit();
  await conn.close();
  console.timeEnd("insert-database");

  return insertTable;
};

module.exports = {
  insertInoutCache,
};
