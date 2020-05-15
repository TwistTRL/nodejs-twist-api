/*
 * @Author: Peng Zeng
 * @Date: 2020-05-13 11:11:52
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-15 13:55:54
 */

const database = require("../../services/database");
const {
  DIAGNOSIS_GROUP_JSON,
  ANATOMY_LIST,
  ANATOMY_TO_CODES_DICT,
  PRIOR_GROUP_TO_CODES_DICT,
} = require("./diagnosis");

const STEP2_GET_MRN_SQL = (person_id) => `
SELECT
  MRN,
  BIRTH_UNIX_TS
FROM CHB_MRN
JOIN PERSON USING (PERSON_ID)
WHERE PERSON_ID = ${person_id}
`;

const STEP3_GET_ANATOMY_SQL = (mrn) => `
SELECT 
  MRN,
  ANATOMY,
  SUBCAT_ANAT,
  SUBCAT_NAME,
  SUBCAT_VALUE,
  COVARIATE
FROM DIAGNOSIS
WHERE MRN = '${mrn.toString()}'
`;

const STEP4_GET_CODES = ({ anatomy, prior_group }) =>
  PRIOR_GROUP_TO_CODES_DICT[anatomy][prior_group];

const FLATTEN_ARRAY_SQL = (codeList) =>
  codeList.reduce(
    (acc, arr) => acc + arr.reduce((itemAcc, cur) => itemAcc + ` OR DOMINANT_PROC = '${cur}'`, ""),
    ""
  );

const STEP5_GET_PROCEDURE_SQL = (codeList) => `
SELECT
  MRN,
  DT,
  DOMINANT_PROC,
  BIRTH_UNIX_TS
FROM PROCEDURE
JOIN CHB_MRN USING (MRN)
JOIN PERSON USING (PERSON_ID)
WHERE 0=1${FLATTEN_ARRAY_SQL(codeList)}
ORDER BY MRN, DT
`;

async function getMRNSqlExecutor(conn, person_id) {
  let rawRecords = await conn.execute(STEP2_GET_MRN_SQL(person_id));
  let mrns = rawRecords.rows;
  if (!mrns) {
    return [];
  }
  return mrns.map((x) => x.MRN);
}

async function getAnatomySqlExecutor(conn, mrn) {
  console.log("STEP3_GET_ANATOMY_SQL(mrn) :>> ", STEP3_GET_ANATOMY_SQL(mrn));
  let rawRecords = await conn.execute(STEP3_GET_ANATOMY_SQL(mrn));
  console.log("rawRecords :>> ", rawRecords);
  let anatomyArr = rawRecords.rows;
  if (!anatomyArr) {
    return [];
  }
  return anatomyArr;
}

async function getProcedureSqlExecutor(conn, codeList) {
  let rawRecords = await conn.execute(STEP5_GET_PROCEDURE_SQL(codeList));
  let procedureArr = rawRecords.rows;
  let result = [];
  if (!procedureArr) {
    return [];
  }
  // mrn, dt
  let preMrn = procedureArr[0].MRN;
  let preTime = [procedureArr[0].BIRTH_UNIX_TS];
  let preCodeArr = [];
  procedureArr.forEach((element) => {
    if (element.MRN !== preMrn) {
      if (isValidCodes(preCodeArr, codeList)) {
        result.push({ mrn: element.MRN, time: preTime, proc: preCodeArr });
      }
      preMrn = element.MRN;
      preTime = [element.BIRTH_UNIX_TS, element.DT];
      preCodeArr = [element.DOMINANT_PROC];
    } else {
      preCodeArr.push(element.DOMINANT_PROC);
      preTime.push(element.DT);
    }
  });
  return result;
}

const isValidCodes = (preCodeArr, codeList) => {
  let ret = false;
  codeList.forEach((element) => {
    let curRet = false;
    for (let item of element) {
      if (!preCodeArr.includes(item)) {
        return false;
      }
    }
    ret = true;
  });
  return ret;
};

const diagnosisGetMRN = database.withConnection(getMRNSqlExecutor);
const diagnosisGetAnatomy = database.withConnection(getAnatomySqlExecutor);
const diagnosisGetCodes = STEP4_GET_CODES;
const diagnosisGetProcedure = database.withConnection(getProcedureSqlExecutor);

module.exports = {
  diagnosisGetMRN,
  diagnosisGetAnatomy,
  diagnosisGetCodes,
  diagnosisGetProcedure,
};
