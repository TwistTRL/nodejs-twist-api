/*
 * @Author: Peng Zeng
 * @Date: 2020-11-11 08:30:20
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-03-03 17:19:37
 */

const database = require("../../services/database");
const moment = require("moment");

const GET_PROVIDER_INFO_SQL = `
SELECT 
  PROV_ID,
  ROLE_ABBR,
  FULL_NAME,
  START_ET,
  END_DT_ET,
  SEQ_VAL,
  PRIMARY_FLAG
FROM PRIMARY_PROV
WHERE MRN = :mrn
`;

async function getProviderInfoSqlExecutor(conn, binds) {
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS'`);
  const providerResult = await conn.execute(GET_PROVIDER_INFO_SQL, binds).then((ret) => ret.rows);
  const primaryFlagResults = providerResult.filter((item) => item.PRIMARY_FLAG);
  let primaryCardiologist;
  let primaryCardiacSurgeon;
  let referringCardiologist;
  primaryFlagResults.forEach((element) => {
    if (element.ROLE_ABBR === "CARDIOLOGIST-TCH") {
      primaryCardiologist = element.FULL_NAME;
    } else if (element.ROLE_ABBR === "SURG-STAFF") {
      primaryCardiacSurgeon = element.FULL_NAME;
    } else if (element.ROLE_ABBR === "CARDIOLOGIST-REF") {
      referringCardiologist = element.FULL_NAME;
    }
  });

  let cardiologistDict = { nullEndDate: [], nonNullEndDate: [] };
  let cardiacSurgeonDict = { nullEndDate: [], nonNullEndDate: [] };
  let refcardiologistDict = { nullEndDate: [], nonNullEndDate: [] };

  providerResult.forEach((element) => {
    if (element.ROLE_ABBR === "CARDIOLOGIST-TCH") {
      if (element.END_DT_ET) {
        cardiologistDict.nonNullEndDate.push(element);
      } else {
        cardiologistDict.nullEndDate.push(element);
      }
    } else if (element.ROLE_ABBR === "SURG-STAFF") {
      if (element.END_DT_ET) {
        cardiacSurgeonDict.nonNullEndDate.push(element);
      } else {
        cardiacSurgeonDict.nullEndDate.push(element);
      }
    } else if (element.ROLE_ABBR === "CARDIOLOGIST-REF") {
      if (element.END_DT_ET) {
        refcardiologistDict.nonNullEndDate.push(element);
      } else {
        refcardiologistDict.nullEndDate.push(element);
      }
    }
  });

  if (!primaryCardiologist) {
    primaryCardiologist = getPrimaryPerson(cardiologistDict);
  }
  if (!primaryCardiacSurgeon) {
    primaryCardiacSurgeon = getPrimaryPerson(cardiacSurgeonDict);
  }
  if (!referringCardiologist) {
    referringCardiologist = getPrimaryPerson(refcardiologistDict);
  }

  const primaryICUAttending = "Katie Moynihan, M.D.";

  return {
    primary_cardiologist: primaryCardiologist || "None assigned",
    primary_cardiac_surgeon: primaryCardiacSurgeon || "None assigned",
    primary_ICU_attending: primaryICUAttending || "None assigned",
    referring_cardiologist: referringCardiologist || "None assigned",
  };
}

// TODO: double check the algorithm here
const getPrimaryPerson = (dict) => {
  let ret;

  if (!dict.nullEndDate.length) {
    console.log("error: dict :>> ", dict);
    return null;
  } else if (dict.nullEndDate.length === 1) {
    return dict.nullEndDate[0].FULL_NAME;
  } else {
    let nullEdDict = {};
    let maxCount = 0;
    let minStartTime = Number.MAX_SAFE_INTEGER;
    dict.nullEndDate.forEach((item) => {
      if (!(item.FULL_NAME in nullEdDict)) {
        nullEdDict[item.FULL_NAME] = { count: 1, startTime: moment(item.START_ET) };
      } else {
        nullEdDict[item.FULL_NAME].count++;
        nullEdDict[item.FULL_NAME].startTime = Math.min(
          nullEdDict[item.FULL_NAME].startTime,
          moment(item.START_ET)
        );
      }
      if (nullEdDict[item.FULL_NAME].count > maxCount) {
        maxCount = nullEdDict[item.FULL_NAME].count;
        ret = item.FULL_NAME;
      } else if (
        nullEdDict[item.FULL_NAME].count === maxCount &&
        nullEdDict[item.FULL_NAME].startTime < minStartTime
      ) {
        minStartTime = nullEdDict[item.FULL_NAME].startTime;
        ret = item.FULL_NAME;
      }
    });
  }

  return ret;
};

const getProviderInfo = database.withConnection(getProviderInfoSqlExecutor);

module.exports = {
  getProviderInfo,
};
