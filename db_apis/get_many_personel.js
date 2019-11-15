const database = require("../services/database");

const get_many_personel_basics_sql = (n)=>{
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
  return `
    SELECT
      CHB_PRSNL_ID AS "__ID__",
      NAME_FIRST,
      NAME_MIDDLE,
      NAME_LAST,
      SEX_CODE.VALUE AS SEX,
      BIRTH_UNIX_TS,
      DECEASED_UNIX_TS
    FROM CHB_PRSNL
      JOIN PERSON USING(PERSON_ID)
      JOIN SEX_CODE USING(SEX_CD)
    WHERE CHB_PRSNL_ID IN (${insert})
  `
};

const get_many_personel_names_sql =  (n)=>{
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
  return `
    SELECT
      PERSON_NAME_ID AS "__ID__",
      CHB_PRSNL_ID AS "__REF__PERSONEL",
      NAME_FIRST,
      NAME_MIDDLE,
      NAME_LAST,
      NAME_TYPE_CODE.VALUE AS NAME_TYPE
    FROM CHB_PRSNL
      JOIN PERSON_NAME USING(PERSON_ID)
      JOIN NAME_TYPE_CODE USING(NAME_TYPE_CD)
    WHERE CHB_PRSNL_ID IN (${insert})
  `
};

const get_many_personel_phones_sql  = (n)=>{
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
  return `
    SELECT
      PHONE_ID AS "__ID__",
      CHB_PRSNL_ID AS "__REF__PERSONEL",
      PHONE_NUM,
      PHONE_TYPE_CODE.VALUE AS PHONE_TYPE
    FROM PERSON_PHONE
      JOIN PHONE_TYPE_CODE USING(PHONE_TYPE_CD)
      JOIN PERSON USING(PERSON_ID)
      JOIN CHB_PRSNL USING(PERSON_ID)
    WHERE CHB_PRSNL_ID IN (${insert})
  `
};

async function getManyPersonelSqlExecutor(conn,binds){
  let PERSONEL = await conn.execute(get_many_personel_basics_sql(binds.length),binds)
    .then( res=>res.rows );
  let PERSONEL_NAME = await conn.execute(get_many_personel_names_sql(binds.length),binds)
    .then( res=>res.rows );
  let PERSONEL_PHONE = await conn.execute(get_many_personel_phones_sql(binds.length),binds)
    .then( res=>res.rows );
  
  let ret = {
    PERSONEL,
    PERSONEL_NAME,
    PERSONEL_PHONE
  };
  
  return ret;
}

const getManyPersonel = database.withConnection(async (conn,binds)=>{
  let tables = await getManyPersonelSqlExecutor(conn,binds);
  return relationalJSON.relationalJsonify(tables);
});

module.exports = {
  getManyPersonelSqlExecutor,
  getManyPersonel
};
