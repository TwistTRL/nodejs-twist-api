/*
 * @Author: Peng Zeng
 * @Date: 2020-12-30 01:44:49
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-03-16 13:10:28
 */

const TRLDSC2_SERVER = "http://10.7.46.137:7001/images/";

const fetch = require("node-fetch");
const database = require("../../services/database");
// note: in /services/database.js, oracledb.fetchAsBuffer = [ oracledb.BLOB ];

const { REACT_BASE64 } = require("./base64-example");
const { CATALOG_CD_DICT } = require("../../db_relation/radiology-db-relation");

// const GET_PERSON_RADIOLOGY_SQL = `
// SELECT 
//   CATALOG_CD, 
//   DISPLAY, 
//   RAD_PACS_ID, 
//   REASON_FOR_EXAM, 
//   COMPLETE_DT_TM_UTC, 
//   COMPLETE_DT_TM_UNIX, 
//   REQUEST_DT_TM_UTC 
// FROM RADIOLOGY 
// JOIN CHB_MRN USING (PERSON_ID)
// WHERE CATALOG_CD IN 
//   (4081372,
//   15593788,
//   4087102,
//   422260445,
//   102293731,
//   896730861,
//   896730927,
//   896731263,
//   2909338,
//   2909341,
//   66024475,
//   886152671,
//   886152849,
//   66024876,
//   66024992,
//   443851292,
//   853501059,
//   853501263,
//   853501943,
//   66025072,
//   939407937,
//   66038895,
//   66038968,
//   66039050) 
//   AND MRN = :mrn
// ORDER BY REQUEST_DT_TM_UTC DESC`;

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
WHERE MRN = :mrn
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
    FILE_THUMBNAILES,
    WIDTH,
    HEIGHT,
    TOPLEFTRIBCAGEX,
    TOPRIGHTRIBCAGEX,
    BOTTOMLEFTRIBCAGEX,
    BOTTOMRIGHTRIBCAGEX,
    TOPLEFTRIBCAGEY,
    TOPRIGHTRIBCAGEY,
    BOTTOMLEFTRIBCAGEY,
    BOTTOMRIGHTRIBCAGEY
FROM API_XRAY
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
FROM API_XRAY
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
FROM API_XRAY
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
  const accession_number_dict = {};
  person_radio.forEach(element => {
    if (!CATALOG_CD_DICT[element.CATALOG_CD]) {
      console.log('CATALOG_CD_DICT[element.CATALOG_CD] null:>> ', element.CATALOG_CD);
      return;
    }

    const location = CATALOG_CD_DICT[element.CATALOG_CD] ? CATALOG_CD_DICT[element.CATALOG_CD].location : null;
    const study_type = CATALOG_CD_DICT[element.CATALOG_CD] ? CATALOG_CD_DICT[element.CATALOG_CD].study_type : null;
    if (element.RAD_PACS_ID in accession_number_dict) {
      accession_number_dict[element.RAD_PACS_ID].location.concat(location);
      accession_number_dict[element.RAD_PACS_ID].study_type.concat(study_type);
    } else {
      accession_number_dict[element.RAD_PACS_ID] = {};
      accession_number_dict[element.RAD_PACS_ID].location = location;
      accession_number_dict[element.RAD_PACS_ID].study_type = study_type;
    }
  });
  const xray_list_cache = await getXrayCache(mrn);

  // console.log('accession_number_dict :>> ', accession_number_dict);
  // console.log('person_radio :>> ', person_radio);
  // console.log('xray_list_cache :>> ', xray_list_cache);

  const ret = xray_list_cache.map(item => ({
    id: item.ID,
    patient_name: item.PATIENT_NAME,
    study_id: item.STUDY_ID,
    study_description: item.STUDY_DESCRIPTION,
    institution: item.INSTITUTION,
    accession_number: item.ACCESSION_NUMBER,
    location: getLocation(item.ACCESSION_NUMBER, accession_number_dict),
    study_type: getStudyType(item.ACCESSION_NUMBER, accession_number_dict), 
    referring_physician: item.REFERRING_PHYSICIAN,
    acquisition_date: item.ACQUISITION_DATE,
    thumbnailes: item.FILE_THUMBNAILES ? item.FILE_THUMBNAILES.toString('base64') : null,
    width: item.WIDTH,
    height: item.HEIGHT,    
    top_left_rib_cage_alignment_points: [item.TOPLEFTRIBCAGEX, item.TOPLEFTRIBCAGEY],
    top_right_rib_cage_alignment_points: [item.TOPRIGHTRIBCAGEX, item.TOPRIGHTRIBCAGEY],
    bottom_left_rib_cage_alignment_points: [item.BOTTOMLEFTRIBCAGEX, item.BOTTOMLEFTRIBCAGEY],
    bottom_right_rib_cage_alignment_points: [item.BOTTOMRIGHTRIBCAGEX, item.BOTTOMRIGHTRIBCAGEY],
  }))

  
  return ret;
};

const getLocation = (accession_number, accession_number_dict) => {
  if (accession_number in accession_number_dict) {
    return accession_number_dict[accession_number].location;
  } else {
    console.warn('accession_number has no location:>> ', accession_number);
    return null;
  }
}

const getStudyType = (accession_number, accession_number_dict) => {
  if (accession_number in accession_number_dict) {
    return accession_number_dict[accession_number].study_type;
  } else {
    console.warn('accession_number has no study_type:>> ', accession_number);
    return null;
  }
}

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
