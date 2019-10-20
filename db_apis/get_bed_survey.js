const database = require("../services/database");
const {getManyPersonconst database = require("../services/database");

const GET_BED_SQL =
`
SELECT
  BED_CD
  BED_CODE.VALUE AS BED,
  ROOM_CODE.VALUE AS ROOM,
  NURSE_UNIT_CODE.VALUE AS NURSE_UNIT
FROM BED_CODE
  JOIN ROOM_CODE USING(BED_CD)
  JOIN NURSE_UNIT_CODE USING(ROOM_CD)
WHERE BED_CD = :bed_cd
`

SELECT
  BED_CD
  PERSON_ID
FROM ENCNTR_BED_SPACE
WHERE ENCNTR_BED_SPACE.START_UNIX_TS <= :at
  AND ENCNTR_BED_SPACE.END_UNIX_TS > :at

SELECT
  BED_CD
  CHB_PRSNL,
  ASSIGN_TYPE_CODE.VALUE AS ASSIGN_TYPE
FROM CHB_TRK_BED_ASSIGN
  JOIN CHB_TRK_ASSIGN USING(ASSIGN_ID)
  JOIN ASSIGN_TYPE_CODE USING(ASSIGN_TYPE_CD)
WHERE CHB_TRK_ASSIGN.START_UNIX_TS <= :at
  AND CHB_TRK_ASSIGN.END_UNIX_TS > :at

SELECT 

const getBedExecutor = async function(conn,binds,opts){
  let bed = await conn.execute(GET_BED_SQL,binds,opts);
  
  if (bed.rows.length == 0) {
    return null;
  }
  
  return bed.rows[0];
}

const getBed = async function(person_id) {
  let binds = {person_id};
  let opts = {};
  let person = await database.simpleExecute(getPersonSqlExecutor,binds,opts);
  return person;
}

const getManyPerson = async function(person_id=[]) {
  let persons = [];
  for (let p of person_id) {
    persons.push(await getPerson(b));
  }
  return persons;
}

module.exports.getPerson = getPerson;
module.exports.getManyPerson = getManyPerson;
