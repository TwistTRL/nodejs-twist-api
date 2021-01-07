/*
 * @Author: Peng Zeng
 * @Date: 2020-12-30 01:44:49
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-07 13:15:05
 */

const TRLDSC2_SERVER = "http://10.7.46.137:7001/images/";

const fetch = require("node-fetch");
const database = require("../../services/database");
const { REACT_BASE64 } = require("./base64-example");

const GET_PERSON_RADIOLOGY_SQL = `
SELECT 
  CATALOG_CD, 
  DISPLAY, 
  RAD_PACS_ID, 
  REASON_FOR_EXAM, 
  COMPLETE_DT_TM_UTC, 
  COMPLETE_DT_TM_UNIX, 
  REQUEST_DT_TM_UTC 
FROM RADIOLOGY 
JOIN CHB_MRN USING (PERSON_ID)
WHERE CATALOG_CD IN 
  (4081372,
  15593788,
  4087102,
  422260445,
  102293731,
  896730861,
  896730927,
  896731263,
  2909338,
  2909341,
  66024475,
  886152671,
  886152849,
  66024876,
  66024992,
  443851292,
  853501059,
  853501263,
  853501943,
  66025072,
  939407937,
  66038895,
  66038968,
  66039050) 
  AND MRN = :mrn
ORDER BY REQUEST_DT_TM_UTC`;


const GET_XRAY_CACHE_SQL = `
SELECT 
  ID,
  PATIENT_NAME,
  STUDY_ID,
  STUDY_DESCRIPTION,
  BIRTH_DATE,
  INSTITUTION,
  ACCESSION_NUMBER,
  REFERRING_PHYSICIAN,
  ACQUISITION_DATE,
  BASE64_DATA,
  UPDT_UNIX  
FROM API_CACHE_XRAY
WHERE MRN = :mrn
`;


const getPersonXrayImageList = async (mrn) => { 
  const getPersonRadiology = database.withConnection(
    async (conn, mrn) =>
      await conn.execute(GET_PERSON_RADIOLOGY_SQL, { mrn }).then((res) => res.rows)
  );

  const getXrayCache = database.withConnection(
    async (conn, mrn) =>
      await conn.execute(GET_XRAY_CACHE_SQL, { mrn }).then((res) => res.rows)
  );

  const person_radio = await getPersonRadiology(mrn);
  const xray_cache = await getXrayCache(mrn);

  console.log('person_radio :>> ', person_radio);
  // console.log('xray_cache :>> ', xray_cache);
  
  // console.log('process.env.SYNAPSE_API_TOKEN :>> ', process.env.SYNAPSE_API_TOKEN);
  return xray_cache;
};

const getXrayById = async (id, type="jpg") => { 
  console.log('id :>> ', id);
  if (id === "test") {
    return REACT_BASE64;
  }
  const response = await fetch(`${TRLDSC2_SERVER}${type}/${id}`) 
  return await response.text();
};

module.exports = {
  getPersonXrayImageList,
  getXrayById,
};
