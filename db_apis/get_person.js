#!/usr/bin/env node

const database = require("../services/database");

// Given a time, get patient basic info
const GET_PERSON_BASICS_SQL = 
`
SELECT
  PERSON_ID,
  NAME_FIRST,
  NAME_MIDDLE,
  NAME_LAST,
  SEX_CODE.VALUE AS SEX,
  BIRTH_UNIX_TS,
  DECEASED_UNIX_TS
FROM PERSON
  JOIN SEX_CODE USING(SEX_CD)
WHERE PERSON_ID = :person_id
`

// Given a person, get all person names
const GET_PERSON_NAMES_SQL = 
`
SELECT
  NAME_FIRST,
  NAME_MIDDLE,
  NAME_LAST,
  NAME_TYPE_CODE.VALUE AS NAME_TYPE
FROM PERSON_NAME
  JOIN NAME_TYPE_CODE USING(NAME_TYPE_CD)
WHERE PERSON_ID = :person_id
`

// Given a person, get all person mrns
const GET_PERSON_MRNS_SQL =
`
SELECT
  MRN,
  BEG_EFFECTIVE_UNIX_TS,
  END_EFFECTIVE_UNIX_TS
FROM CHB_MRN
WHERE PERSON_ID = :person_id
`

// Given a person, get all person phone numbers
const GET_PERSON_PHONES_SQL = 
`
SELECT
  PHONE_NUM,
  PHONE_TYPE_CODE.VALUE AS PHONE_TYPE
FROM PERSON_PHONE
  JOIN PHONE_TYPE_CODE USING(PHONE_TYPE_CD)
WHERE PERSON_ID = :person_id
`

async function getPersonSqlExecutor(conn,binds){
  let [person_basics,person_names,person_mrns,person_phones] = await Promise.all([
    conn.execute(GET_PERSON_BASICS_SQL,binds,opts),
    conn.execute(GET_PERSON_NAMES_SQL,binds,opts),
    conn.execute(GET_PERSON_MRNS_SQL,binds,opts),
    conn.execute(GET_PERSON_PHONES_SQL,binds,opts),
  ]);
  if (person_basics.rows.length != 1) {
    return null;
  }
  
  let person = {...person_basics.rows[0]};
  person["NAMES"] = person_names.rows;
  person["MRNS"] = person_mrns.rows;
  person["PHONES"] = person_phones.rows;
  
  return person;
}

async function getManyPersonSqlExecutor(conn,binds){
  let persons = await Promise.all(
    binds.map( b=>getPersonSqlExecutor(conn,b) )
  );
  return persons;
}

const getPerson = database.withConnection(getPersonSqlExecutor);
const getManyPerson = database.withConnection(getManyPersonSqlExecutor);

module.exports = {
  getPersonSqlExecutor,
  getManyPersonSqlExecutor,
  getPerson,
  getManyPerson
};
