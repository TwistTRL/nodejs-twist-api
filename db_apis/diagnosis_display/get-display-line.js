/*
 * @Author: Peng Zeng
 * @Date: 2020-08-27 11:19:09
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-31 09:20:05
 */

const database = require("../../services/database");

const moment = require("moment");
const { getDiagnosisDisplay } = require("./get-disease-display");
const { getOperativeDisplay, calculateEcmoDays } = require("./get-operative-display");
const {  getPersonFromMrn } = require("../person/get-person-info"); // new

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

// For Cache
const GET_DIAGNOSIS_CACHE_SQL = `
SELECT
  AGE_DISPLAY,
  SEX_DISPLAY,
  HETEROTAXY_DISPLAY,
  SDD_DISPLAY,
  DISEASE_DISPLAY,
  EVENT_ID, 
  DT_UNIX, 
  DIAGNOSES, 
  STUDY_TYPE,
  OPERATIVE_DISPLAY
FROM API_CACHE_DIAGNOSIS
WHERE PERSON_ID = :person_id
`;

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

const combineDisplayLine = (age_display, sex_display, heterotaxy_display, sdd_display, disease_display, operativeArray) => {
  let display_line = age_display + sex_display + " with " + heterotaxy_display + sdd_display + disease_display;
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
  return display_line;

}

async function finalDisplay(conn, binds) {
  const rawRecord = await conn.execute(SQL_GET_PATIENT, binds);
  const heterotaxyRecord = await conn.execute(SQL_GET_HETEROTAXY, binds);
  const sddRecord = await conn.execute(SQL_GET_SDD, binds);

  if (!rawRecord || !rawRecord.rows[0]) {
    return "No patient record for this mrn";
  }

  // 18 month [age at death or current age] [sex] with [native disease - HLHS (MS/AS) with IAS] s/p [for procedures - for complications of procedures write c/b] [abbreviation for SURG_FYLER_PRI_PRO - jk to send table] s/p for each procedure
  // 18 month old boy with HLHS (MS/AS) with IAS s/p B PAB s/p S1P/Sano

//CHB_MRN.MRN,   PERSON.BIRTH_UNIX_TS,   PERSON.DECEASED_UNIX_TS,  SEX_CODE.VALUE 

  let birth_time = rawRecord.rows[0].BIRTH_UNIX_TS;
  let deceased_time = rawRecord.rows[0].DECEASED_UNIX_TS;
  let sex = rawRecord.rows[0].VALUE;
  let age;
  let age_display;
  let sex_display = sex.toLowerCase();

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
  let sdd_display = sddRecord.rows[0] ? `${getSdd(sddRecord.rows[0].DIAGNOSES)} ` : "";
  let operativeArray = await getOperativeDisplay(binds);
  let display_line = combineDisplayLine(age_display, sex_display, heterotaxy_display, sdd_display, disease_display, operativeArray);

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
  console.time("display-line-time");

  // USE CACHE
  const person_id_arr = await getPersonFromMrn(binds);
  if (person_id_arr.length > 1) {
    console.warn('person_id_arr :>> ', person_id_arr);
  } 
  const person_id = person_id_arr[0].PERSON_ID;
  console.log('display cache for person_id :>> ', person_id);
  console.log('binds :>> ', binds);
  const arr = await conn.execute(GET_DIAGNOSIS_CACHE_SQL, {person_id}).then( ret=>ret.rows ); 
  if (arr && arr.length) {
    const age_display = arr[0].AGE_DISPLAY;
    const sex_display = arr[0].SEX_DISPLAY;
    const heterotaxy_display = arr[0].HETEROTAXY_DISPLAY || "";
    const sdd_display = arr[0].SDD_DISPLAY || "";
    const disease_display = arr[0].DISEASE_DISPLAY;
    let operative_display = []
    arr.forEach(element => {
      if (element.STUDY_TYPE === "SURG_FYLER_PRI_PRO") {
        operative_display.push({
          event_id: element.EVENT_ID,
          event_time: moment.unix(element.DT_UNIX).format(),
          diagnoses: element.DIAGNOSES,
          operative_display: element.OPERATIVE_DISPLAY,
        })
      }
    });
    // console.log('before ==> operative_display :>> ', operative_display);
    /**
     * will combine a series of ECMO events to one: 
     *      {"operative_display": "ECMO cannulation", "event_time": "2018-08-14T00:00:00-04:00"}
            {"operative_display": "ECMO cannula revision". "event_time": "2018-08-15T00:00:00-04:00"}
            {"operative_display": "ECMO decannulation", "event_time": "2018-08-17T00:00:00-04:00"}

            => {"operative_display": "ECMO cannulation (3 days)", "event_time": "2018-08-14T00:00:00-04:00"}           

     * 
     */
    operative_display = await calculateEcmoDays(operative_display, conn, binds);
    // console.log('after ==> operative_display :>> ', operative_display);

    const display_line = combineDisplayLine(age_display, sex_display, heterotaxy_display, sdd_display, disease_display, operative_display);
    console.timeEnd("display-line-time");

    return {
      display_line,
      age_display,
      sex_display,
      heterotaxy_display,
      sdd_display,
      disease_display,
      operative_display,
    };   
  }  
  console.log("no cache. calculating");
  const ret = await finalDisplay(conn, binds);
  console.timeEnd("display-line-time");
  return ret;

});

module.exports = {
  getDisplayLine,
};
