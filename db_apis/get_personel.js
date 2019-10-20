#!/usr/bin/env node

const database = require("../services/database");

const GET_PERSONEL_BASICS_SQL = 
`
SELECT
  PERSON_ID,
  NAME_FIRST,
  NAME_MIDDLE,
  NAME_LAST,
  SEX_CODE.VALUE AS SEX,
  BIRTH_UNIX_TS,
  DECEASED_UNIX_TS
FROM CHB_PRSNL
  JOIN PERSON USING(PERSON_ID)
  JOIN SEX_CODE USING(SEX_CD)
WHERE CHB_PRSNL_ID = :chb_prsnl_id
`

// Given a person, get all person names
const GET_PERSONEL_NAMES_SQL = 
`
SELECT
  NAME_FIRST,
  NAME_MIDDLE,
  NAME_LAST,
  NAME_TYPE_CODE.VALUE AS NAME_TYPE
FROM CHB_PRSNL
  JOIN PERSON USING(PERSON_ID)
  JOIN NAME_TYPE_CODE USING(NAME_TYPE_CD)
WHERE CHB_PRSNL_ID = :chb_prsnl_id
`

// Given a person, get all person mrns
const GET_PERSONEL_MRNS_SQL =
`
SELECT
  MRN,
  BEG_EFFECTIVE_UNIX_TS,
  END_EFFECTIVE_UNIX_TS
FROM CHB_MRN
  JOIN PERSON USING(PERSON_ID)
  JOIN CHB_PRSNL USING(PERSON_ID)
WHERE CHB_PRSNL_ID = :chb_prsnl_id
`

// Given a person, get all person phone numbers
const GET_PERSONELPHONES_SQL = 
`
SELECT
  PHONE_NUM,
  PHONE_TYPE_CODE.VALUE AS PHONE_TYPE
FROM PERSON_PHONE
  JOIN PHONE_TYPE_CODE USING(PHONE_TYPE_CD)
  JOIN PERSON USING(PERSON_ID)
  JOIN CHB_PRSNL USING(PERSON_ID)
WHERE CHB_PRSNL_ID = :chb_prsnl_id
`

async function getPersonelSqlExecutor(conn,binds){
  let [personel_basics,personel_names,personel_mrns,personel_phones] = await Promise.all([
    conn.execute(GET_PERSONEL_BASICS_SQL,binds,opts),
    conn.execute(GET_PERSONEL_NAMES_SQL,binds,opts),
    conn.execute(GET_PERSONEL_MRNS_SQL,binds,opts),
    conn.execute(GET_PERSONEL_PHONES_SQL,binds,opts),
  ]);
  
  if (personel_basics.rows.length != 1) {
    return null;
  }
  
  let personel = {...personel_basics.rows[0]};
  personel["NAMES"] = personel_names.rows;
  personel["MRNS"] = personel_mrns.rows;
  personel["PHONES"] = personel_phones.rows;
  
  return personel;
}

async function getManyPersonelSqlExecutor(conn,binds){
  let personels = await Promise.all(
    binds.map( b=>getPersonelSqlExecutor(conn,b) )
  );
  return personels;
}

const getPersonel = database.withConnection(getPersonelSqlExecutor);

const getManyPersonel =  database.withConnection(getPersonelSqlExecutor);

module.exports = {
  getPersonelSqlExecutor,
  getPersonel,
  getManyPersonelSqlExecutor
};
