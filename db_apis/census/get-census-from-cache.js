/*
 * @Author: Peng Zeng
 * @Date: 2020-12-23 13:53:26
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-23 15:09:31
 */

const moment = require("moment");

const { getCensusCacheData } = require("../cache/get-census-cache");

const getCacheCensus = async (ts) => {
  const patient_dict = {};
  const censusData = await getCensusCacheData();
  censusData.forEach((element) => {
    if (element.PERSON_ID in patient_dict) {
      if (element.NAME_FULL_FORMATTED) {
        patient_dict[element.PERSON_ID].PERSONNEL.push({
          NAME_FULL_FORMATTED: element.NAME_FULL_FORMATTED, 
          CONTACT_NUM: element.CONTACT_NUM, 
          ASSIGN_TYPE: element.ASSIGN_TYPE, 
          TEAM_ASSIGN_TYPE: element.TEAM_ASSIGN_TYPE, 
          START_UNIX: element.START_UNIX, 
          END_UNIX: element.END_UNIX,
        })
      }

    } else {
      patient_dict[element.PERSON_ID] = {
        PERSON_ID: element.PERSON_ID,
        MRN: element.MRN,
        FIRST_NAME: element.PATIENT_FIRST_NAME,
        MIDDLE_NAME: element.PATIENT_MIDDLE_NAME,
        LAST_NAME: element.PATIENT_LAST_NAME,
        BIRTH_UNIX_TS: element.PATIENT_BIRTH_UNIX_TS,
        DECEASED_UNIX_TS: element.PATIENT_DECEASED_UNIX_TS,
        SEX_CD: element.PATIENT_SEX_CD,
        SEX: element.PATIENT_SEX,
        BED_START_UNIX: element.PATIENT_BED_START_UNIX,
        BED_END_UNIX: element.PATIENT_BED_END_UNIX,
        LOC_NURSE_UNIT_CD: element.LOC_NURSE_UNIT_CD,
        LOC_ROOM_CD: element.LOC_ROOM_CD,
        NURSE_UNIT_DISP: element.NURSE_UNIT_DISP,
        LOCATION_BED: element.LOCATION_BED,
        BED_DISP: element.BED_DISP,
        ROOM_DISP: element.ROOM_DISP,
        ASSIGN_ID: element.ASSIGN_ID,
        BED_ASSIGN_ID: element.BED_ASSIGN_ID,
        WEIGHT: element.PATIENT_WEIGHT,
        WEIGHT_UNIX: element.WEIGHT_UNIX,
        E: element.E,
        V: element.V,
        N: element.N,
        INO: element.INO,
        AGE_DISPLAY: element.AGE_DISPLAY,
        ANATOMY_DISPLAY: element.ANATOMY_DISPLAY,
        RSS: element.RSS,
        RST: element.RST,
        RSS_UNIX: element.RSS_UNIX,
        ECMO_FLOW_NORM: element.ECMO_FLOW_NORM,
        ECMO_VAD_SCORE: element.ECMO_VAD_SCORE,
        ECMO_UNIX: element.ECMO_UNIX,
        TEAM: element.TEAM,
        CHIEF_COMPLAINT: element.CHIEF_COMPLAINT,
        PERSONNEL: element.name_full_formatted ? [{
          NAME_FULL_FORMATTED: element.NAME_FULL_FORMATTED, 
          CONTACT_NUM: element.CONTACT_NUM, 
          ASSIGN_TYPE: element.ASSIGN_TYPE, 
          TEAM_ASSIGN_TYPE: element.TEAM_ASSIGN_TYPE, 
          START_UNIX: element.START_UNIX, 
          END_UNIX: element.END_UNIX,
        }] : [],
      };
    }
  });

  return Object.values(patient_dict);

};

module.exports = {
  getCacheCensus,
};
