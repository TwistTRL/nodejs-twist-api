/*
 * @Author: Peng Zeng
 * @Date: 2020-12-23 13:53:26
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-01 21:50:25
 */

const { getCensusCacheData } = require("../cache/get-census-cache");
const { getAdtCensusXray } = require("../xray/get-xray-for-census");
const { getAdtCensusInfusionsCache } = require("../cache/get-infusions-for-census-cache");

const moment = require("moment");

const getInfusions = (infusionRecord) =>
  infusionRecord
    ? infusionRecord.map((item) => ({
        DRUG: item.DRUG,
        END_UNIX: item.END_UNIX,
        INFUSION_RATE: item.INFUSION_RATE,
        INFUSION_RATE_UNITS: item.INFUSION_RATE_UNITS,
        RXCUI: item.RXCUI,
      }))
    : [];

const getCacheCensus = async (ts) => {
  const patient_dict = {};
  const censusData = await getCensusCacheData();
  const xrayDict = await getAdtCensusXray(Math.floor(Date.now() / 1000));
  const personWithInfusionsDict = await getAdtCensusInfusionsCache();
  // console.log('personWithInfusionsDict :>> ', personWithInfusionsDict);
  // console.log('censusData :>> ', censusData);
  // console.log('xrayDict :>> ', xrayDict);
  censusData.forEach((element) => {
    if (element.PERSON_ID in patient_dict) {
      if (element.NAME_FULL_FORMATTED && element.NAME_FULL_FORMATTED !== "None") {
        // replace older record with new record if they have the same personnel name, contact number and assign type,
        // so the front end won't display two same personnel records
        let isPersonnelInArray = false;
        for (const [index, personnel_item] of patient_dict[element.PERSON_ID].PERSONNEL.entries()) {
          if (
            personnel_item.NAME_FULL_FORMATTED === element.NAME_FULL_FORMATTED &&
            personnel_item.CONTACT_NUM === element.CONTACT_NUM &&
            personnel_item.ASSIGN_TYPE == element.ASSIGN_TYPE
          ) {
            patient_dict[element.PERSON_ID].PERSONNEL.splice(index, 1, {
              NAME_FULL_FORMATTED: element.NAME_FULL_FORMATTED,
              CONTACT_NUM: element.CONTACT_NUM,
              ASSIGN_TYPE: element.ASSIGN_TYPE,
              TEAM_ASSIGN_TYPE: element.TEAM_ASSIGN_TYPE,
              START_UNIX: element.START_UNIX,
              END_UNIX: element.END_UNIX,
            });
            isPersonnelInArray = true;
            break;
          }
        }

        if (!isPersonnelInArray) {
          patient_dict[element.PERSON_ID].PERSONNEL.push({
            NAME_FULL_FORMATTED: element.NAME_FULL_FORMATTED,
            CONTACT_NUM: element.CONTACT_NUM,
            ASSIGN_TYPE: element.ASSIGN_TYPE,
            TEAM_ASSIGN_TYPE: element.TEAM_ASSIGN_TYPE,
            START_UNIX: element.START_UNIX,
            END_UNIX: element.END_UNIX,
          });
        }
      }
    } else {
      let XRAY_THUMBNAILES;
      // get timestamp for this xray study
      if (!(element.PERSON_ID in xrayDict)) {
        // this person_id has no recent xray
        XRAY_THUMBNAILES = null;
      } else {
        const study_time = xrayDict[element.PERSON_ID].STUDY_TIME; //YYYYMMDD
        const study_date = xrayDict[element.PERSON_ID].STUDY_DATE; //hhmmss
        const STUDY_TIMESTAMP = moment(study_date + study_time, "YYYYMMDDhhmmss").unix();

        // only send xray in last 24 hours
        if (moment().unix() - STUDY_TIMESTAMP > 24 * 60 * 60) {
          XRAY_THUMBNAILES = null;
        } else {
          // latest one xray image
          XRAY_THUMBNAILES = {
            ID: xrayDict[element.PERSON_ID].ID,
            PATIENT_NAME: xrayDict[element.PERSON_ID].PATIENT_NAME,
            STUDY_ID: xrayDict[element.PERSON_ID].STUDY_ID,
            STUDY_DESCRIPTION: xrayDict[element.PERSON_ID].STUDY_DESCRIPTION,
            INSTITUTION: xrayDict[element.PERSON_ID].INSTITUTION,
            ACCESSION_NUMBER: xrayDict[element.PERSON_ID].ACCESSION_NUMBER,
            REFERRING_PHYSICIAN: xrayDict[element.PERSON_ID].REFERRING_PHYSICIAN,
            STUDY_TIMESTAMP,
            FILE_THUMBNAILES: xrayDict[element.PERSON_ID].FILE_THUMBNAILES
              ? xrayDict[element.PERSON_ID].FILE_THUMBNAILES.toString("base64")
              : null,
          };
        }
      }

      patient_dict[element.PERSON_ID] = {
        PERSON_ID: element.PERSON_ID,
        MRN: element.MRN,
        FIRST_NAME: element.FIRST_NAME,
        MIDDLE_NAME: element.MIDDLE_NAME,
        LAST_NAME: element.LAST_NAME,
        BIRTH_UNIX_TS: element.BIRTH_UNIX_TS,
        DECEASED_UNIX_TS: element.DECEASED_UNIX_TS,
        SEX_CD: element.PATIENT_SEX_CD,
        SEX: element.PATIENT_SEX,
        BED_START_UNIX: element.BED_START_UNIX,
        BED_END_UNIX: element.BED_END_UNIX,
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
        INFUSIONS: getInfusions(personWithInfusionsDict[element.PERSON_ID]),
        PERSONNEL:
          element.NAME_FULL_FORMATTED && element.NAME_FULL_FORMATTED !== "None"
            ? [
                {
                  NAME_FULL_FORMATTED: element.NAME_FULL_FORMATTED,
                  CONTACT_NUM: element.CONTACT_NUM,
                  ASSIGN_TYPE: element.ASSIGN_TYPE,
                  TEAM_ASSIGN_TYPE: element.TEAM_ASSIGN_TYPE,
                  START_UNIX: element.START_UNIX,
                  END_UNIX: element.END_UNIX,
                },
              ]
            : [],
        XRAY_THUMBNAILES,
      };
    }
  });

  return Object.values(patient_dict);
};

module.exports = {
  getCacheCensus,
};
