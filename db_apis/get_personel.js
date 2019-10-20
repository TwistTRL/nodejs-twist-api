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

const getPersonelSqlExecutor = async function(conn,binds,opts){
  let [personel_basics,personel_names,personel_mrns,personel_phones] = await Promise.all([
    conn.execute(GET_PERSONEL_BASICS_SQL,binds,opts),
    conn.execute(GET_PERSONEL_NAMES_SQL,binds,opts),
    conn.execute(GET_PERSONEL_MRNS_SQL,binds,opts),
    conn.execute(GET_PERSONEL_PHONES_SQL,binds,opts),
  ]);
  
  if (personel_basics.rows.length == 0) {
    return null;
  }
  
  let personel = {...personel_basics.rows[0]};
  personel["NAMES"] = personel_names.rows;
  personel["MRNS"] = personel_mrns.rows;
  personel["PHONES"] = personel_phones.rows;
  
  return personel;
}

const getPersonel = async function(personel_id) {
  let binds = {personel_id};
  let opts = {};
  let personel = await database.simpleExecute(getPersonelSqlExecutor,binds,opts);
  return personel;
}

const getManyPersonel = async function(personel_id=[]) {
  let personels = [];
  for (let p of personel_id) {
    personels.push(await getPersonel(b));
  }
  return personels;
}

module.exports.getPersonel = getPersonel;
module.exports.getManyPersonel = getManyPersonel;
