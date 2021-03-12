/*
 * @Author: Peng Zeng
 * @Date: 2021-01-25 16:02:45
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-25 17:46:15
 */

const database = require("../../services/database");
const { getPersonFromMrn } = require("../person/get-person-info");

const GET_RSS_BEFORE_XRAY_SQL = `
SELECT 
  EVENT_END_DT_TM_UNIX, 
  RSS, 
  INO_DOSE, 
  RST 
FROM RSS 
WHERE PERSON_ID = :person_id 
  AND EVENT_END_DT_TM_UNIX < :ts 
ORDER BY EVENT_END_DT_TM_UNIX DESC 
FETCH FIRST ROW ONLY
`;

const GET_RSS_AFTER_XRAY_SQL = `
SELECT 
  EVENT_END_DT_TM_UNIX, 
  RSS, 
  INO_DOSE, 
  RST 
FROM RSS 
WHERE PERSON_ID = :person_id 
  AND EVENT_END_DT_TM_UNIX > :ts 
ORDER BY EVENT_END_DT_TM_UNIX 
FETCH FIRST ROW ONLY
`;

const GET_PATIENT_INFO_SQL = `
SELECT 
  BIRTH_UNIX_TS, 
  DECEASED_UNIX_TS, 
  SEX_CODE.VALUE AS SEX
FROM PERSON 
JOIN SEX_CODE USING (SEX_CD) 
WHERE PERSON_ID = :person_id
`;

const getPatientInfoForXray = async (query) => {
  const getData = database.withConnection(async (conn, person_id, xray_ts_array) => {
    console.log("person_id :>> ", person_id);
    const patientInfoArr = await conn
      .execute(GET_PATIENT_INFO_SQL, { person_id })
      .then((res) => res.rows);
    if (!patientInfoArr.length) {
      console.warn("person_id error :>> ", person_id);
      return null;
    }
    const patientInfo = patientInfoArr[0];
    const rssForXray = [];
    for (const ts of xray_ts_array) {
      const rssBeforeArr = await conn
        .execute(GET_RSS_BEFORE_XRAY_SQL, { person_id, ts })
        .then((res) => res.rows);
      const rssBefore = rssBeforeArr.length
        ? {
            rssTimestamp: rssBeforeArr[0].EVENT_END_DT_TM_UNIX,
            rss: rssBeforeArr[0].RSS,
            rst: rssBeforeArr[0].RST,
            ino_dose: rssBeforeArr[0].INO_DOSE,
          }
        : null;

      const rssAfterArr = await conn
        .execute(GET_RSS_AFTER_XRAY_SQL, { person_id, ts })
        .then((res) => res.rows);
      const rssAfter = rssAfterArr.length
        ? {
            rssTimestamp: rssAfterArr[0].EVENT_END_DT_TM_UNIX,
            rss: rssAfterArr[0].RSS,
            rst: rssAfterArr[0].RST,
            ino_dose: rssAfterArr[0].INO_DOSE,
          }
        : null;
      rssForXray.push({
        xrayTimestamp: ts,
        rssBefore,
        rssAfter,
      });
    }
    return {
      birthTimestamp: patientInfo.BIRTH_UNIX_TS,
      deceasedTimestamp: patientInfo.DECEASED_UNIX_TS,
      sex: patientInfo.SEX,
      rssForXray,
    };
  });

  const mrn = query.mrn;
  const xray_ts_array = query.xray_ts_array;
  if (!xray_ts_array.length) {
    return null;
  }

  const person_id_arr = await getPersonFromMrn({ mrn });
  if (person_id_arr.length > 1) {
    console.warn("person_id_arr :>> ", person_id_arr);
  }
  if (!person_id_arr.length) {
    console.log("error mrn");
    return null;
  }

  const person_id = person_id_arr[0].PERSON_ID;

  const xrayPatientInfoData = await getData(person_id, xray_ts_array);
  return xrayPatientInfoData;
};

module.exports = {
  getPatientInfoForXray,
};
