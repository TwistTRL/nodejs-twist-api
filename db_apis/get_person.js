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
WHERE PERSON_ID = `

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
WHERE PERSON_ID = `

// Given a person, get all person mrns
const GET_PERSON_MRNS_SQL =
`
SELECT
  MRN,
  BEG_EFFECTIVE_UNIX_TS,
  END_EFFECTIVE_UNIX_TS
FROM CHB_MRN
WHERE PERSON_ID = `

// Given a person, get all person phone numbers
const GET_PERSON_PHONES_SQL = 
`
SELECT
  PHONE_NUM,
  PHONE_TYPE_CODE.VALUE AS PHONE_TYPE
FROM PERSON_PHONE
  JOIN PHONE_TYPE_CODE USING(PHONE_TYPE_CD)
WHERE PERSON_ID = `

// Given a mrn, get person_id
const GET_PERSON_ID_SQL =
`
SELECT
  DISTINCT PERSON_ID
FROM CHB_MRN
WHERE MRN = `

async function getPersonSqlExecutor(conn,person_id){
  var personId = parseInt(person_id);
  console.log("person_id is: " + personId);

  let person_basics = await conn.execute(GET_PERSON_BASICS_SQL + personId).then( res=>res.rows );
  let person_names = await conn.execute(GET_PERSON_NAMES_SQL + personId).then( res=>res.rows );
  let person_mrns = await conn.execute(GET_PERSON_MRNS_SQL + personId).then( res=>res.rows );
  let person_phones = null;//await conn.execute(GET_PERSON_PHONES_SQL + personId).then( res=>res.rows );
  if (person_basics.length != 1) {
    return null;
  }
  
  let person = {...person_basics};
  person["NAMES"] = person_names;
  person["MRNS"] = person_mrns;
  person["PHONES"] = person_phones;  
  return person;
}

async function getManyPersonSqlExecutor(conn,binds){
  let persons = [];
  for (let b of binds) {
    persons.push(await getPersonSqlExecutor(conn,b));
  }
  return persons;
}

async function getPersonFromMRNSqlExecutor(conn,mrn){
  let person_ids = await conn.execute(GET_PERSON_ID_SQL + `'` + mrn + `'`).then( res=>res.rows );
  if (person_ids == null || person_ids.length == 0) {
    return null;
  }
  var result = [];
  for (let person_id of person_ids) {
    result.push(person_id);
  }
  return result;
}

const getPerson = database.withConnection(getPersonSqlExecutor);
const getManyPerson = database.withConnection(getManyPersonSqlExecutor);
const getPersonFromMRN = database.withConnection(getPersonFromMRNSqlExecutor);


module.exports = {
  getPersonSqlExecutor,
  getManyPersonSqlExecutor,
  getPerson,
  getManyPerson,
  getPersonFromMRN
};
