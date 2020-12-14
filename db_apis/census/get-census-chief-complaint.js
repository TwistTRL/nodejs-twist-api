/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-12 12:02:17 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-12 13:53:17
 */


const moment = require("moment");
const { getChiefComplaintData } = require("../../database_access/census/census-chief-complaint");

async function getChiefComplaint({timestamp}) {
  if (!timestamp) {
    // now
    timestamp = Math.floor(Date.now() / 1000);
  }
  const chiefComplaintData = await getChiefComplaintData({ timestamp });  
  let patientDict = {};
  chiefComplaintData.forEach(element => {
    if (element.PERSON_ID in patientDict) {
      if (element.EVENT_CD === 15610422) {
        if (patientDict[element.PERSON_ID].EVENT_CD === 15610422) {
          if (element.VALID_FROM_DT_TM_UTC > patientDict[element.PERSON_ID].VALID_FROM_DT_TM_UTC) {
            patientDict[element.PERSON_ID] = element;
          }
        } else {
          patientDict[element.PERSON_ID] = element;
        }
      } else if (patientDict[element.PERSON_ID].EVENT_CD !== 15610422) {
        if (element.VALID_FROM_DT_TM_UTC > patientDict[element.PERSON_ID].VALID_FROM_DT_TM_UTC) {
          patientDict[element.PERSON_ID] = element;
        }
      }
    } else {
      patientDict[element.PERSON_ID] = element;
    }    
  });
  return patientDict;
  // return Object.values(patientDict).map(item=>({
  //   PERSON_ID,
  //   CHIEF_COMPLAINT: item.RESULT_VAL,
  // }))
}

module.exports = {
  getChiefComplaint,
};
