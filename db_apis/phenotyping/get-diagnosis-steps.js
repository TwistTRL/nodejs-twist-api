/*
 * @Author: Peng Zeng
 * @Date: 2020-05-13 11:11:52
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-17 11:46:43
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

const FLATTEN_ARRAY_SQL = (codeList) => {
  let ret = codeList.reduce(
    (acc, cur) =>
      acc +
      cur.include.reduce((itemAcc, itemCur) => itemAcc + ` OR DOMINANT_PROC = '${itemCur}'`, "") +
      cur.exclude.reduce((itemAcc, itemCur) => itemAcc + ` OR DOMINANT_PROC = '${itemCur}'`, ""),
    ""
  );
  console.log("ret :>> ", ret);
  return ret;
};

const STEP5_GET_PROCEDURE_SQL = (codeList) => `
SELECT
  MRN,
  ID,
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
  console.log("codeList :>> ", codeList);
  let rawRecords = await conn.execute(STEP5_GET_PROCEDURE_SQL(codeList));
  let procedureArr = rawRecords.rows;
  console.log("procedureArr :>> ", procedureArr);
  let mrn_proc = [];
  if (!procedureArr) {
    return [];
  }
  // mrn, dt
  // assume that same ID will be only for same MRN
  let mrnDict = {};
  let preMrn = procedureArr[0].MRN;
  let preTime = [procedureArr[0].BIRTH_UNIX_TS];
  let preId = procedureArr[0].ID;
  let preCodeArr = [];
  
  procedureArr.forEach((element) => {
    if (element.ID === preId) {
      preCodeArr.push(element.DOMINANT_PROC);
      preTime.push(element.DT)
    } else {
      if (isValidCodes(preCodeArr, codeList)) {
        mrn_proc.push({ mrn: preMrn, time: preTime, proc: preCodeArr, id: preId});
        if (preMrn in mrnDict) {
          mrnDict[preMrn].push(preId);
        } else {
          mrnDict[preMrn] = [preId];
        }
      }

      preMrn = element.MRN;
      preId = element.ID;
      preTime = [element.BIRTH_UNIX_TS, element.DT];
      preCodeArr = [element.DOMINANT_PROC];
    }
  });
  let mrn_count = Object.keys(mrnDict).length;

  return {mrn_count, mrn_proc};
}

/**
codeList = 
[
  {
    include: ["a", "b"],
    exclude: ["c"],
  },
]

 */
const isValidCodes = (preCodeArr, codeList) => {
  for (let code of codeList) {
    let excludeSatisfy = true;
    let includeSatisfy = true;
    for (let excludeItem of code.exclude) {
      if (preCodeArr.includes(excludeItem)) {
        excludeSatisfy = false;
        break;
      }
    }
    if (excludeSatisfy) {
      for (let includeItem of code.include) {
        if (!preCodeArr.includes(includeItem)) {
          includeSatisfy = false;
          break;
        }
      }
      if (includeSatisfy) {
        return true;
      }
    }
  }
  return false;
};

const STEP6_NEXT_PROCEDURE = (mrn) => {};

const diagnosisGetMRN = database.withConnection(getMRNSqlExecutor);
const diagnosisGetAnatomy = database.withConnection(getAnatomySqlExecutor);
const diagnosisGetCodes = STEP4_GET_CODES;
const diagnosisGetProcedure = database.withConnection(getProcedureSqlExecutor);
const diagnosisGetNextProcedure = STEP6_NEXT_PROCEDURE;

module.exports = {
  diagnosisGetMRN,
  diagnosisGetAnatomy,
  diagnosisGetCodes,
  diagnosisGetProcedure,
  diagnosisGetNextProcedure,
};
