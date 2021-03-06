/*
 * @Author: Peng Zeng
 * @Date: 2020-12-05 13:17:07
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-01 21:27:48
 */

const moment = require("moment");

const { getCensusData } = require("../../database_access/census/census");
const { getDiagnosisDisplay } = require("../diagnosis_display/get-disease-display");
const { getChiefComplaint } = require("./get-census-chief-complaint");
const { getCensusInfusions } = require("./get-census-infusion");

// will replace it by mapping
const getAssignType = (assignType) => {
  if (["COVERINGATTENDING", "TEAMATTENDINGMD"].includes(assignType)) {
    return "ATTEND";
  }
  if (
    ["FELLOW", "NPFELLOW", "NPFELLOWMD", "NPHOSPRES", "RESIDENTNP", "RESINTNP"].includes(assignType)
  ) {
    return "MD/NP";
  }
  if (["GREENRESIDENT", "PURPLERESIDENT", "RESIDENT"].includes(assignType)) {
    return "RESID";
  }
  if (
    [
      "EPINP",
      "GISNP",
      "GREENNP",
      "NLSNP",
      "NOCNP",
      "NP",
      "NSSNP",
      "PULNP",
      "PURPLENP",
      "RESIDENTNP",
      "RESINTNP",
    ].includes(assignType)
  ) {
    return "NP";
  }
  if (assignType === "INTERN" || assignType === "RN" || assignType === "RT") {
    return assignType;
  }
  if (assignType === "DIETITIAN") {
    return "RD";
  }
  if (assignType === "PRIMARYMD") {
    return "Primary";
  }

  if (assignType === "CHARGERN") {
    return "Charge";
  }
  if (assignType === "RESOURCERN") {
    return "Resource";
  }
  if (assignType === "CNS") {
    return "CNS";
  }
  if (assignType === "CA") {
    return "CA";
  }
  if (assignType === "PHARMACIST") {
    return "Pharmacist";
  }
  if (assignType === "AA") {
    return "AA";
  }

  // console.warn("assignType :>> ", assignType);
  return assignType;
};

const isE = (ecmo_unix, ecmo_flow_norm, ecmo_vad_score) =>
  Boolean(
    (ecmo_flow_norm || ecmo_vad_score) && moment().diff(moment.unix(ecmo_unix), "hours") <= 6
  );
const isV = (rss_unix, rst) =>
  Boolean(
    ["PSV", "PCV", "VCV", "HFJV", "HFOV"].includes(rst) &&
      moment().diff(moment.unix(rss_unix), "hours") <= 6
  );
const isN = (rss_unix, rst) =>
  Boolean(
    ["BiPAP", "CPAP", "HFNC"].includes(rst) && moment().diff(moment.unix(rss_unix), "hours") <= 6
  );
const isINO = (rss_unix, ino_dose) =>
  Boolean(ino_dose && moment().diff(moment.unix(rss_unix), "hours") <= 6);

const getTeam = (team) => {
  if (!team) {
    return null;
  }
  if (team in TEAM_DICT) {
    return TEAM_DICT[team];
  }
  if (team.split(" ").length === 2) {
    return team.split(" ")[1];
  }
  return team;
};

const TEAM_DICT = {
  "Team 3": "3",
  "Team B": "B",
  "Team A": "A",
  "Team 1": "1",
  "Team 2": "2",
  "Team C": "C",
};

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

const getSingelPatientInfo = async (element, chiefComplaintDict, censusInfusionsDict) => ({
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
  WEIGHT: element.WEIGHT,
  WEIGHT_UNIX: element.WEIGHT_UNIX,
  E: isE(element.ECMO_UNIX, element.ECMO_FLOW_NORM, element.ECMO_VAD_SCORE),
  V: isV(element.RSS_UNIX, element.RST),
  N: isN(element.RSS_UNIX, element.RST),
  INO: isINO(element.RSS_UNIX, element.INO_DOSE),
  AGE_DISPLAY: getAge(element.PATIENT_BIRTH_UNIX_TS, element.PATIENT_DECEASED_UNIX_TS),
  ANATOMY_DISPLAY: await getDiagnosisDisplay({ mrn: element.MRN }),
  RSS: element.RSS,
  RST: element.RST,
  RSS_UNIX: element.RSS_UNIX,
  ECMO_FLOW_NORM: element.ECMO_FLOW_NORM,
  ECMO_VAD_SCORE: element.ECMO_VAD_SCORE,
  ECMO_UNIX: element.ECMO_UNIX,
  TEAM: getTeam(element.TEAM),
  CHIEF_COMPLAINT: chiefComplaintDict[element.PERSON_ID]
    ? chiefComplaintDict[element.PERSON_ID].RESULT_VAL
    : null,
  INFUSIONS: getInfusions(censusInfusionsDict[element.PERSON_ID]),
});

async function getAdtCensus(timestamp) {
  if (!timestamp) {
    // now
    timestamp = Math.floor(Date.now() / 1000);
  }
  const censusData = await getCensusData({ timestamp });
  const chiefComplaintDict = await getChiefComplaint({ timestamp });

  const cutoff_timestamp = timestamp - 8 * 60 * 60;
  const censusInfusionsData = await getCensusInfusions({ timestamp, cutoff_timestamp });
  const infusionsDict = {};

  censusInfusionsData.forEach((element) => {
    if (!(element.PERSON_ID in infusionsDict)) {
      infusionsDict[element.PERSON_ID] = {};
      infusionsDict[element.PERSON_ID][element.RXCUI] = element;
    } else {
      if (!(element.RXCUI in infusionsDict[element.PERSON_ID])) {
        infusionsDict[element.PERSON_ID][element.RXCUI] = element;
      } else {
        if (element.END_UNIX > infusionsDict[element.PERSON_ID][element.RXCUI].END_UNIX) {
          infusionsDict[element.PERSON_ID][element.RXCUI] = element;
        }
      }
    }
  });

  const censusInfusionsDict = {};
  for (const person_id in infusionsDict) {
    censusInfusionsDict[person_id] = Object.values(infusionsDict[person_id]);
  }
  // console.log('infusionsDict :>> ', infusionsDict);

  // console.log('chiefComplaintDict :>> ', chiefComplaintDict);

  let patientDict = {};
  for (let element of censusData) {
    const personnelInfo = {
      NAME_FULL_FORMATTED: element.PERSONNEL_NAME,
      CONTACT_NUM: element.CONTACT_NUM,
      ASSIGN_TYPE: element.ASSIGN_TYPE,
      TEAM_ASSIGN_TYPE: getAssignType(element.ASSIGN_TYPE),
      START_UNIX: element.PERSONNEL_START_UNIX,
      END_UNIX: element.PERSONNEL_END_UNIX,
    };
    if (element.MRN in patientDict) {
      if (element.PERSONNEL_NAME) {
        patientDict[element.MRN]["PERSONNEL"].push(personnelInfo);
      }
    } else {
      patientDict[element.MRN] = await getSingelPatientInfo(
        element,
        chiefComplaintDict,
        censusInfusionsDict
      );
      if (element.PERSONNEL_NAME) {
        patientDict[element.MRN]["PERSONNEL"] = [personnelInfo];
      } else {
        patientDict[element.MRN]["PERSONNEL"] = [];
      }
    }
  }
  return Object.values(patientDict);
}

function getAge(birth_time, deceased_time) {
  if (deceased_time) {
    age = moment.unix(deceased_time).diff(moment.unix(birth_time), "days");
  } else {
    age = moment().diff(moment.unix(birth_time), "days");
  }

  if (age > 365 * 2) {
    return Math.floor(age / 365) + "y";
  } else if (age > 30) {
    return Math.floor(age / 30) + "m";
  } else {
    return age + "d";
  }
}

module.exports = {
  getAdtCensus,
};
