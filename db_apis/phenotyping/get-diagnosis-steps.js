/*
 * @Author: Peng Zeng
 * @Date: 2020-05-13 11:11:52
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-14 16:11:23
 */

const database = require("../../services/database");
const {
  DIAGNOSIS_GROUP_JSON,
  CODES_LIST,
  ANATOMY_LIST,
  ANATOMY_TO_CODES_DICT,
} = require("./diagnosis");

const STEP2_GET_MRN_SQL = (person_id) => `
SELECT
  MRN
FROM CHB_MRN
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

const STEP4_GET_CODES = (anatomy) => {
  if (!anatomy) {
    return {};
  }
  let result = {};
  for (let group in ANATOMY_TO_CODES_DICT[anatomy]) {
    if (!(group in result)) {
      result[group] = [];
      let curCodes = ANATOMY_TO_CODES_DICT[anatomy][group];
      curCodes.forEach((element) => {
        if (element && element.length) {
          element.forEach((code) => {
            result[group].push(code);
          });
        }
      });
    }
  }

  return result;
};

const STEP5_GET_PROCEDURE_SQL = (codeList) => `
SELECT
  MRN,
  DT
FROM PROCEDURE
WHERE 0=1${codeList.reduce((acc, cur) => acc + ` OR DOMINANT_PROC = '${cur}'`, ``)}
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
  let preMrn;
  procedureArr.forEach((element) => {
    if (element.MRN !== preMrn) {
      preMrn = element.MRN;
      result.push({ mrn: element.MRN, time: element.DT });
    }
  });
  return result;
}

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
