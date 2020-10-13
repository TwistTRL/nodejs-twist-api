/*
 * @Author: Peng Zeng 
 * @Date: 2020-10-12 23:43:14 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-13 01:13:54
 */

const oracledb = require("oracledb");
const moment = require("moment");

// TODO


const DELETE_CACHE_SQL = (table, number) => ` 
DELETE FROM ${table}
  WHERE PERSON_ID IN (${[...new Array(number).keys()].map((i) => ":" + i.toString()).join(",")})
`;

const INSERT_CACHE_SQL = (table, columns, values) => `
INSERT INTO ${table}
  (${columns.join(', ')})
VALUES
  (${values.join(', ')})
`;

const updateCache = async (table, binds) => {
  const nowString = `insert database at ${new Date().getTime()}`;
  console.time(nowString);
  const conn = await oracledb.getConnection();
  const deleteTable = await conn.execute(DELETE_CACHE_SQL(table, binds.length), binds.map((x) => x.person_id));
  // TODO get columns and values
  const insertTable = await conn.executeMany(INSERT_CACHE_SQL(columns, values), binds);
  await conn.commit();
  await conn.close();
  console.timeEnd(nowString);

  return insertTable;
};



module.exports = {
  updateCache,
};
