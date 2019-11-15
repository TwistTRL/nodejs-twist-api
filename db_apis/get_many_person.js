const database = require("../services/database");

const get_many_person_basics_sql = (n)=>{
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
    
  return ` 
    SELECT
      PERSON_ID AS "__ID__",
      NAME_FIRST,
      NAME_MIDDLE,
      NAME_LAST,
      SEX_CODE.VALUE AS SEX,
      BIRTH_UNIX_TS,
      DECEASED_UNIX_TS
    FROM PERSON
      JOIN SEX_CODE USING(SEX_CD)
    WHERE PERSON_ID IN (${insert})
  `
};

const get_many_person_names_sql = (n)=> {
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
    
  return `
    SELECT
      PERSON_NAME_ID AS "__ID__",
      PERSON_ID AS "__REF__PERSON",
      NAME_FIRST,
      NAME_MIDDLE,
      NAME_LAST,
      NAME_TYPE_CODE.VALUE AS NAME_TYPE
    FROM PERSON_NAME
      JOIN NAME_TYPE_CODE USING(NAME_TYPE_CD)
    WHERE PERSON_ID IN (${insert})
  `;
};

const get_many_person_mrns_sql = (n)=> {
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
    
  return `
    SELECT
      CHB_MRN_ID AS "__ID__",
      PERSON_ID AS "__REF__PERSON",
      MRN,
      BEG_EFFECTIVE_UNIX_TS,
      END_EFFECTIVE_UNIX_TS
    FROM CHB_MRN
    WHERE PERSON_ID IN (${insert})
  `;
};

const get_many_person_phones_sql = (n)=> {
  let insert = [...new Array(n).keys()]
    .map( i=>':'+i.toString() )
    .join(',')
    
  return `
    SELECT
      PHONE_ID AS "__ID__",
      PERSON_ID AS "__REF__PERSON",
      PHONE_NUM,
      PHONE_TYPE_CODE.VALUE AS PHONE_TYPE
    FROM PERSON_PHONE
      JOIN PHONE_TYPE_CODE USING(PHONE_TYPE_CD)
    WHERE PERSON_ID IN (${insert})
  `;
};

async function getManyPersonSqlExecutor(conn,binds){
  let PERSON = await conn.execute(get_many_person_basics_sql(binds.length),binds)
    .then( res=>res.rows );
  let PERSON_NAME = await conn.execute(get_many_person_names_sql(binds.length),binds)
    .then( res=>res.rows );
  let CHB_MRN = await conn.execute(get_many_person_mrns_sql(binds.length),binds)
    .then( res=>res.rows );
  let PERSON_PHONE = await conn.execute(get_many_person_phones_sql(binds.length),binds)
    .then( res=>res.rows );
  
  let ret = {
    PERSON,
    PERSON_NAME,
    CHB_MRN,
    PERSON_PHONE
  };
  
  return ret;
}

const getManyPerson = database.withConnection(async (conn,binds)=>{
  let tables = await getManyPersonSqlExecutor(conn,binds);
  return relationalJSON.relationalJsonify(tables);
});

module.exports = {
  getManyPersonSqlExecutor,
  getManyPerson
};
