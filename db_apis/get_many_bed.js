const database = require("../services/database");

const get_many_bed_sql = (n)=>{
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
  return `
    SELECT
      BED_CD AS "__ID__",
      BED_CODE.VALUE AS BED
    FROM BED_CODE
    WHERE BED_CD IN (${insert})
  `
};

const get_many_room_sql = (n)=>{
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
  return `
    SELECT
      ROOM_CD AS "__ID__",
      BED_CD AS "__REF__BED",
      ROOM_CODE.VALUE AS ROOM
    FROM ROOM_CODE
      JOIN BED_CODE USING (ROOM_CD)
    WHERE BED_CD IN (${insert})
  `
}

const get_many_nurse_unit_sql = (n)=>{
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
  return `
    SELECT
      NURSE_UNIT_CD AS "__ID__",
      ROOM_CD AS "__REF__ROOM",
      NURSE_UNIT_CODE.VALUE AS NURSE_UNIT
    FROM NURSE_UNIT_CODE
      JOIN ROOM_CODE USING (NURSE_UNIT_CD)
      JOIN BED_CODE USING (ROOM_CD)
    WHERE BED_CD IN (${insert})
  `
}

async function getManyBedSqlExecutor(conn,binds){
  let BED = await conn.execute(get_many_bed_sql(binds.length),binds)
    .then( res=>res.rows );
  let ROOM = await conn.execute(get_many_room_sql(binds.length),binds)
    .then( res=>res.rows );
  let NURSE_UNIT = await conn.execute(get_many_nurse_unit_sql(binds.length),binds)
    .then( res=>res.rows );
  
  return {
    BED,
    ROOM,
    NURSE_UNIT
  };
}

const getManyBed = database.withConnection(async (conn,binds)=>{
  let tables = await getManyBedSqlExecutor(conn,binds);
  return relationalJSON.relationalJsonify(tables);
});

module.exports = {
  getManyBedSqlExecutor,
  getManyBed
};
