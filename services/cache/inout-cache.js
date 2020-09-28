/*
 * @Author: Peng Zeng
 * @Date: 2020-09-19 15:58:46
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-25 08:57:16
 */

const oracledb = require("oracledb");
const moment = require("moment");

const { getInOutQueryV2 } = require("../../db_apis/get-in-out-v2");

const DELETE_INOUT_CACHE_SQL = `
DELETE FROM API_CACHE_INOUT
`;

const INSERT_INOUT_CACHE_SQL = `
INSERT INTO API_CACHE_INOUT
  (PERSON_ID, INOUT_VALUE, SHORT_LABEL, DT_UNIX, INOUT_TYPE, UPDT_TM)
VALUES
  (:person_id, :inout_value, :short_label, :dt_unix, :inout_type, TO_DATE(:update_time, 'YYYY-MM-DD HH24:MI:SS'))
`;

const insertInoutCache = async (patients) => {
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
        update_time: moment().format("YYYY-MM-DD HH:mm:ss"),
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
