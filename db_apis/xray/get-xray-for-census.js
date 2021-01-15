/*
 * @Author: Peng Zeng 
 * @Date: 2021-01-14 18:03:53 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-14 22:39:33
 */


const TRLDSC2_SERVER = "http://10.7.46.137:7001/images/";

const fetch = require("node-fetch");
const database = require("../../services/database");
// note: in /services/database.js, oracledb.fetchAsBuffer = [ oracledb.BLOB ];

const GET_ADT_CENSUS_XRAY_SQL = `
SELECT
    PERSON_ID,
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
    FILE_THUMBNAILES
FROM API_CACHE_XRAY_IMAGES
JOIN CHB_MRN USING (MRN)
JOIN PERSON USING (PERSON_ID)
JOIN ADT USING (PERSON_ID)
WHERE :timestamp BETWEEN START_UNIX AND END_UNIX
  AND :timestamp BETWEEN BEG_EFFECTIVE_UNIX_TS AND END_EFFECTIVE_UNIX_TS
  AND (DECEASED_UNIX_TS IS NULL OR :timestamp BETWEEN BIRTH_UNIX_TS AND DECEASED_UNIX_TS)
  AND NURSE_UNIT_DISP != 'Emergency Department'
`;



const getAdtCensusXray = async (timestamp) => { 
  const getData = database.withConnection(
    async (conn, timestamp) =>
      await conn.execute(GET_ADT_CENSUS_XRAY_SQL, { timestamp }).then((res) => res.rows)
  );

  const xrayData = await getData(timestamp);
  console.log('xrayData :>> ', xrayData);  

  const personDict = {};
  xrayData.forEach(element => {
    const mrn = element.mrn;
    if (mrn in personDict) {
      personDict[mrn].push(element);
    } else {
      personDict[mrn] = [element];
    }
  });
  
  const mrnWithLatestXrayList = Object.keys(personDict).map(recordsForMrn => {
    const sortedRecords = recordsForMrn.sort((a,b) => {
      if (a.STUDY_DATE === b.STUDY_DATE) {
        return b.STUDY_TIME - a.STUDY_TIME
      } else {
        return b.STUDY_DATE - a.STUDY_DATE
      }      
    })
    for (const record of sortedRecords) {
      if (record.STUDY_DESCRIPTION.toUpperCase().includes("CHEST") || record.STUDY_DESCRIPTION.toUpperCase().includes("BABY")) {
        return record;
      }
    }
    return sortedRecords[0];
  })

    // TODO:


  return mrnWithLatestXrayList;
};


module.exports = {
  getAdtCensusXray,
};
