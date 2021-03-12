/*
 * @Author: Peng Zeng
 * @Date: 2020-09-11 15:47:13
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-03 14:26:28
 */

const database = require("../../services/database");

const GET_PERSON_BASICS_SQL = `
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
WHERE PERSON_ID = :person_id`;

// Given a person, get all person mrns
const GET_PERSON_MRNS_SQL = `
SELECT
  MRN,
  BEG_EFFECTIVE_UNIX_TS,
  END_EFFECTIVE_UNIX_TS
FROM CHB_MRN
WHERE PERSON_ID = :person_id`;

// Given a mrn, get person_id
const GET_PERSON_ID_SQL = `
SELECT
  DISTINCT PERSON_ID
FROM CHB_MRN
WHERE MRN = :mrn`;

const GET_RESPIRATORY_SUPPORT_VARIABLE_SQL = `
(
  SELECT RSS.*
  FROM RSS
  WHERE PERSON_ID = :person_id
  ORDER BY EVENT_END_DT_TM_UNIX
  FETCH FIRST 1 ROWS ONLY
)
UNION ALL
(
  SELECT RSS.*
  FROM RSS
  WHERE PERSON_ID = :person_id
  ORDER BY EVENT_END_DT_TM_UNIX DESC
  FETCH FIRST 1 ROWS ONLY
)`

async function getPersonSqlExecutor(conn, binds) {
  let person_basics = await conn.execute(GET_PERSON_BASICS_SQL, binds).then((res) => res.rows[0]);
  let person_mrns = await conn.execute(GET_PERSON_MRNS_SQL, binds).then((res) => res.rows);
  let person_rss = await conn.execute(GET_RESPIRATORY_SUPPORT_VARIABLE_SQL, binds).then( ret=>ret.rows );

  let person = { ...person_basics };
  person["MRNS"] = person_mrns;
  person["RSS"] = {
    rss_start: person_rss && person_rss[0] ? person_rss[0].EVENT_END_DT_TM_UNIX : 0,
    rss_end: person_rss && person_rss.length > 1 ? person_rss[1].EVENT_END_DT_TM_UNIX: 0,
  }
  return person;
}

async function getPersonFromMRNSqlExecutor(conn, binds) {
  let person_ids = await conn.execute(GET_PERSON_ID_SQL, binds).then((res) => res.rows);
  return person_ids;
  // if (person_ids == null || person_ids.length == 0) {
  //   return [];
  // }
  // var result = [];
  // for (let person_id of person_ids) {
  //   result.push(person_id);
  // }
  // return result;
}

async function getMrnListFromMrnSqlExecutor(conn, binds) {
  let person_id_results = await conn.execute(GET_PERSON_ID_SQL, binds).then((res) => res.rows);
  person_ids = person_id_results.map((x) => x.PERSON_ID);
  
  let result = {};
  for (let person_id of person_ids) {
    let person_mrns = await conn
      .execute(GET_PERSON_MRNS_SQL, { person_id })
      .then((res) => res.rows);
    result[person_id] = person_mrns;
  }

  return result;
}

const getPersonFromPersonId = database.withConnection(getPersonSqlExecutor);
const getPersonFromMrn = database.withConnection(getPersonFromMRNSqlExecutor);
const getMrnListFromMrn = database.withConnection(getMrnListFromMrnSqlExecutor);

module.exports = {
  getPersonFromPersonId,
  getPersonFromMrn,
  getMrnListFromMrn,
};
