/*
 * @Author: Peng Zeng
 * @Date: 2020-12-30 01:44:49
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-17 00:58:48
 */

const TRLDSC2_SERVER = "http://10.7.46.137:7001/images/";

const fetch = require("node-fetch");
const database = require("../../services/database");
// note: in /services/database.js, oracledb.fetchAsBuffer = [ oracledb.BLOB ];

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
ORDER BY REQUEST_DT_TM_UTC DESC`;

const GET_PERSON_XRAY_LIST_CACHE_SQL = `
SELECT
    ID,
    MRN,
    PATIENT_NAME,
    STUDY_ID,
    STUDY_DESCRIPTION,
    BIRTH_DATE,
    INSTITUTION,
    ACCESSION_NUMBER,
    REFERRING_PHYSICIAN,
    UPDT_UNIX,
    ACQUISITION_DATE,
    STUDY_TIME,
    STUDY_DATE,
    FILE_THUMBNAILES
FROM API_CACHE_XRAY
WHERE MRN = :mrn
`;

const GET_XRAY_JPG_BY_ID_CACHE_SQL = `
SELECT
    ID,
    MRN, 
    ACCESSION_NUMBER,    
    UPDT_UNIX,    
    FILE_NAME,
    FILE_JPG
FROM API_CACHE_XRAY
WHERE ID = :id
`;

const GET_XRAY_DCM_BY_ID_CACHE_SQL = `
SELECT
    ID,
    MRN, 
    ACCESSION_NUMBER,    
    UPDT_UNIX,    
    FILE_NAME,
    FILE_DCM
FROM API_CACHE_XRAY
WHERE ID = :id
`;


const getPersonXrayImageList = async (mrn) => { 
  const getPersonRadiology = database.withConnection(
    async (conn, mrn) =>
      await conn.execute(GET_PERSON_RADIOLOGY_SQL, { mrn }).then((res) => res.rows)
  );

  const getXrayCache = database.withConnection(
    async (conn, mrn) =>
      await conn.execute(GET_PERSON_XRAY_LIST_CACHE_SQL, { mrn }).then((res) => res.rows)
  );

  const person_radio = await getPersonRadiology(mrn);
  const xray_list_cache = await getXrayCache(mrn);

  // console.log('person_radio :>> ', person_radio);
  // console.log('xray_list_cache :>> ', xray_list_cache);

  const ret = xray_list_cache.map(item => ({
    id: item.ID,
    patient_name: item.PATIENT_NAME,
    study_id: item.STUDY_ID,
    study_description: item.STUDY_DESCRIPTION,
    institution: item.INSTITUTION,
    accession_number: item.ACCESSION_NUMBER,
    referring_physician: item.REFERRING_PHYSICIAN,
    acquisition_date: item.ACQUISITION_DATE,
    thumbnailes: item.FILE_THUMBNAILES ? item.FILE_THUMBNAILES.toString('base64') : null,
  }))

  
  return ret;
};

const getXrayById = async (id, type="jpg") => { 
  console.log('id :>> ', id);

  const getXrayJpgByIdCache = database.withConnection(
    async (conn, id) =>
      await conn.execute(GET_XRAY_JPG_BY_ID_CACHE_SQL, { id }).then((res) => res.rows)
  );

  const getXrayDcmByIdCache = database.withConnection(
    async (conn, id) =>
      await conn.execute(GET_XRAY_DCM_BY_ID_CACHE_SQL, { id }).then((res) => res.rows)
  );

  let xray_id_cache;
  let ret;
  if (type === "dcm") {
    xray_id_cache = await getXrayDcmByIdCache(id);
    if (!xray_id_cache) {
      return null;
    }
    ret = xray_id_cache[0].FILE_DCM;
  } else {
    xray_id_cache = await getXrayJpgByIdCache(id);
    if (!xray_id_cache) {
      return null;
    }
    ret = xray_id_cache[0].FILE_JPG.toString('base64');
  }

  return ret;
};

const getXrayJpg = async (id) => await getXrayById(id, "jpg");
const getXrayDcm = async (id) => await getXrayById(id, "dcm");

module.exports = {
  getPersonXrayImageList,
  getXrayJpg,
  getXrayDcm,
};
