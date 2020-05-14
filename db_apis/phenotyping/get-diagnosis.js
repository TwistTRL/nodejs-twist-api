/*
 * @Author: Peng Zeng
 * @Date: 2020-05-13 11:11:52
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-13 21:52:39
 */

const database = require("../../services/database");
const {
  DIAGNOSIS_GROUP_JSON,
  CODES_LIST,
  ANATOMY_LIST,
  ANATOMY_TO_CODES_DICT,
} = require("./diagnosis");

// Given a name, get patient basic info
const GET_PERSON_BASICS_SQL = (person_id) => `
SELECT
  NAME_FIRST,
  NAME_MIDDLE,
  NAME_LAST,
  SEX_CODE.VALUE AS SEX,
  BIRTH_UNIX_TS,
  DECEASED_UNIX_TS
FROM PERSON
  JOIN SEX_CODE USING(SEX_CD)
WHERE PERSON_ID = ${person_id}
`;

// Given a person, get all person mrns
const GET_MRNS_SQL = (person_id) => `
SELECT
  MRN,
  BEG_EFFECTIVE_UNIX_TS,
  END_EFFECTIVE_UNIX_TS
FROM CHB_MRN
WHERE PERSON_ID = ${person_id}
`;

// Given a mrn, get person_id
const GET_PERSON_ID_SQL = (mrn) => `
SELECT
  DISTINCT PERSON_ID
FROM CHB_MRN
WHERE MRN = ${mrn}
`;

const GET_DIAGNOSIS_SQL = (person_id) => `
SELECT 
  MRN,
  ANATOMY,
  SUBCAT_ANAT,
  SUBCAT_NAME,
  SUBCAT_VALUE,
  COVARIATE
FROM DIAGNOSIS
WHERE MRN = (
  SELECT
    MRN
  FROM CHB_MRN
  WHERE PERSON_ID = ${person_id}
)`;

const GET_PROCEDURE_SQL = (codeList) => `
SELECT
  MRN,
  DT
FROM PROCEDURE
WHERE 0=1${codeList.reduce((acc, cur) => acc + ` OR DOMINANT_PROC = '${cur}'`, ``)}
ORDER BY MRN, DT
`;

async function getPersonFromMRNSqlExecutor(conn, mrn) {
  let rawRecords = await conn.execute(GET_PERSON_ID_SQL(mrn));
  let person_ids = rawRecords.rows;
  if (!person_ids) {
    return [];
  }
  return person_ids;
}

async function getPersonFromPersonIdSqlExecutor(conn, person_id) {
  let rawRecords = await conn.execute(GET_MRNS_SQL(person_id));
  let mrns = rawRecords.rows;
  if (!mrns) {
    return [];
  }
  return mrns;
}

// main
async function getDiagnosisFromPersonIdSqlExecutor(conn, person_id) {
  let rawRecords = await conn.execute(GET_DIAGNOSIS_SQL(person_id));
  if (!rawRecords || !rawRecords.rows) {
    return [];
  }
  let arr = rawRecords.rows;
  console.log('diagnosis :>> ', arr);
  let result = {};

  for (let item of arr) {
    for (let group in ANATOMY_TO_CODES_DICT[item.ANATOMY]) {
      if (!(group in result)) {
        result[group] = [];
        let curCodes = ANATOMY_TO_CODES_DICT[item.ANATOMY][group];
        let codeArr = [];
        curCodes.forEach((element) => {
          if (element && element.length) {
            element.forEach((code) => {
              codeArr.push(code);
            });
          }
        });
        console.log('GET_PROCEDURE_SQL(codeArr) :>> ', GET_PROCEDURE_SQL(codeArr));
        let procedureRawRecords = await conn.execute(GET_PROCEDURE_SQL(codeArr));
        if (procedureRawRecords && procedureRawRecords.rows) {
          let procedureArr = procedureRawRecords.rows;
          // mrn, dt
          let preMrn;
          procedureArr.forEach((element) => {
            if (element.MRN !== preMrn) {
              preMrn = element.MRN;
              result[group].push({ mrn: element.MRN, time: element.DT });
            }
          });
        }
      }
    }
  }
  return result;
}

async function testDiagnosisGroupSqlExecutor(conn) {
  let rawRecords = await conn.execute(`SELECT DISTINCT ANATOMY FROM DIAGNOSIS`);
  let arr = rawRecords.rows;
  let result = [];
  arr.forEach((element) => {
    if (!ANATOMY_LIST.includes(element.ANATOMY)) {
      result.push(element.ANATOMY);
    }
  });
  return result;
}

const getMrnFromPersonId = database.withConnection(getPersonFromPersonIdSqlExecutor);
const getPersonIdFromMRN = database.withConnection(getPersonFromMRNSqlExecutor);
const getDiagnosis = database.withConnection(getDiagnosisFromPersonIdSqlExecutor);
const testDiagnosis = database.withConnection(testDiagnosisGroupSqlExecutor);

module.exports = {
  getMrnFromPersonId,
  getPersonIdFromMRN,
  getDiagnosis,
  testDiagnosis,
};
