/*
 * @Author: Peng Zeng
 * @Date: 2020-08-27 11:19:09
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-08-27 11:54:49
 */

const moment = require("moment");
const { getDiagnosisDisplay } = require("./get-disease-display");

const SQL_GET_PATIENT = `
SELECT 
  CHB_MRN.MRN, 
  PERSON.BIRTH_UNIX_TS, 
  PERSON.DECEASED_UNIX_TS, 
  SEX_CODE.VALUE 
FROM PERSON 
  JOIN SEX_CODE USING (SEX_CD) 
  JOIN CHB_MRN USING (PERSON_ID)
WHERE MRN = :mrn`;

const SQL_GET_HETEROTAXY = `
SELECT
  MRN
FROM FYLER_INCL_EXCL 
WHERE INTERPRETATION LIKE '%Heterotaxy%' 
  AND STUDY_TYPE = 'ECHO' 
  AND STATUS = 'INCLUDE' 
  AND MRN = :MRN`;

// for example, diagnoses = {S, D, D}
const SQL_GET_SDD = `
SELECT 
  DISTINCT DIAGNOSES 
FROM FYLER_RAW 
WHERE DIAGNOSES LIKE '%{%' 
  AND MRN = :MRN`;

const getSdd = (str) => {
  // match any string with '{' and '}' inside,
  // like 'something{something}something'
  let matches = str.match(/\{(.*?)\}/);
  if (matches) {
    return matches[0];
  } else {
    return null;
  }
};

async function finalDisplay(conn, binds) {
  const rawRecord = await conn.execute(SQL_GET_PATIENT, binds);
  const heterotaxyRecord = await conn.execute(SQL_GET_HETEROTAXY, binds);
  const sddRecord = await conn.execute(SQL_GET_SDD, binds);

  if (!rawRecord || !rawRecord.rows[0]) {
    return "No patient record for this mrn";
  }

  // 18 month [age at death or current age] [sex] with [native disease - HLHS (MS/AS) with IAS] s/p [for procedures - for complications of procedures write c/b] [abbreviation for SURG_FYLER_PRI_PRO - jk to send table] s/p for each procedure
  // 18 month old boy with HLHS (MS/AS) with IAS s/p B PAB s/p S1P/Sano

  let birth_time = rawRecord.rows[0][1];
  let deceased_time = rawRecord.rows[0][2];
  let sex = rawRecord.rows[0][3];
  let age;
  let age_display;
  let sex_display = sex.toLowerCase();
  let display_line;

  if (deceased_time) {
    age = moment.unix(deceased_time).diff(moment.unix(birth_time), "days");
  } else {
    age = moment().diff(moment.unix(birth_time), "days");
  }

  if (age > 365 * 2) {
    age_display = Math.floor(age / 365) + " yo ";
  } else if (age > 30) {
    age_display = Math.floor(age / 30) + " month old ";
  } else {
    age_display = age + " days old ";
  }

  if (age < 365 * 18) {
    if (sex === "Male") {
      sex_display = "boy";
    } else if (sex === "Female") {
      sex_display = "girl";
    }
  }

  let disease_display = await getDiagnosisDisplay(binds);
  let heterotaxy_display = heterotaxyRecord.rows[0] ? "heterotaxy " : "";
  let sdd_display = sddRecord.rows[0] ? `${getSdd(sddRecord.rows[0][0])} ` : "";

  display_line =
    age_display + sex_display + " with " + heterotaxy_display + sdd_display + disease_display;
  let operativeArray = await ctx.service.twist.getOperativeDisplay.find(mrn);
  console.log("operativeArray :>> ", operativeArray);
  if (Array.isArray(operativeArray)) {
    for (let item of operativeArray) {
      if (item.operative_display) {
        if (item.operative_display.includes("ECMO")) {
          display_line += ` c/b ${item.operative_display}`;
        } else {
          display_line += ` s/p ${item.operative_display}`;
        }
      } else {
        console.log("item.operative_display null :>> ", item);
      }
    }
  }

  return {
    display_line,
    age_display,
    sex_display,
    heterotaxy_display,
    sdd_display,
    disease_display,
    operative_display: operativeArray,
  };
}

const getDisplayLine = database.withConnection(async function (conn, binds) {
  return await finalDisplay(conn, binds);
});

module.exports = {
  getOperativeDisplay,
};
