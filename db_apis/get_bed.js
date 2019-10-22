#!/usr/bin/env node

const database = require("../services/database");

const GET_BED_SQL = `
SELECT
  BED_CD,
  BED_CODE.VALUE AS BED,
  ROOM_CODE.VALUE AS ROOM,
  NURSE_UNIT_CODE.VALUE AS NURSE_UNIT
FROM BED_CODE
  JOIN ROOM_CODE USING(ROOM_CD)
  JOIN NURSE_UNIT_CODE USING(NURSE_UNIT_CD)
WHERE BED_CD = :bed_cd
`

async function getBedSqlExecutor(conn,binds){
  let bed = await conn.execute(GET_BED_SQL,binds);
  if (bed.rows.length != 1) {
    return null;
  }
  return bed.rows[0];
}

async function getManyBedSqlExecutor(conn,binds){
  let beds = [];
  for (let b of binds) {
    beds.push(await getBedSqlExecutor(conn,b));
  }
  return beds;
}

const getBed = database.withConnection(getBedSqlExecutor);
const getManyBed = database.withConnection(getManyBedSqlExecutor);


module.exports = {
  getBedSqlExecutor,
  getManyBedSqlExecutor,
  getBed,
  getManyBed
};
