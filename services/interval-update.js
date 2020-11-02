const { getPatientsByLocation } = require("../db_apis/adt/get-patients-by-location");
const { insertPatientsCache } = require("./cache/patients-cache");

const { insertNoteCache } = require("./cache/procedural-note-cache");
const { insertInoutCache } = require("./cache/inout-cache");
const { insertDiagnosisCache } = require("./cache/diagnosis-cache");
const { insertRssCache } = require("./cache/rss-cache");
const { insertMedCache } = require("./cache/medicine-cache");

const { getPatientsCache } = require("../db_apis/cache/get-patients-cache");

const moment = require("moment");
const INTERVAL_MINUTE = 30; // every 30 min
const MANUALLY_INPUT_PATITENTS = [
  {
    PERSON_ID: 25796315,
    MRN: '5184229',
  },
  { 
    PERSON_ID: 24407610, 
    MRN: '5080159', 
  },
];

const getPatientsByManuallyInput = async () => MANUALLY_INPUT_PATITENTS;

// start checking
// strategy:
// 0. manually input patients (right now hard coded)
// 1. get new patients, compare with old
// 2. if one new patient is not in old array, update that one
// 3. check last update time, if more than 2 hours, update that one
const updatePatients = async () => {
  let currentPatientsCache = await getPatientsCache();
  let prePatientsMap = new Map(currentPatientsCache.map((x) => [x.PERSON_ID, x.UPDT_UNIX]));

  let manuallyInputPatients = await getPatientsByManuallyInput();
  let newInputPatients = manuallyInputPatients.filter(element => !prePatientsMap.has(element.PERSON_ID));
  console.log('newInputPatients :>> ', newInputPatients);

  let currentPatientsByLocation = await getPatientsByLocation();
  console.log("currentPatientsByLocation.length :>> ", currentPatientsByLocation.length);
  currentPatientsByLocation = currentPatientsByLocation.filter(element => !newInputPatients.includes(element.PERSON_ID));
  console.log("after filter, currentPatientsByLocation.length :>> ", currentPatientsByLocation.length);

  if (!currentPatientsCache.length) {
    console.log("no cache, will insert all current patients");
    if (currentPatientsByLocation.length) {
      console.log(
        "current person_id list for location :>> ",
        currentPatientsByLocation.map((x) => x.PERSON_ID)
      );
      await insertPatientsCache([...newInputPatients, ...currentPatientsByLocation]);
    } else {
      console.warn("No records for currentPatientsByLocation");
    }
    return [...newInputPatients, ...currentPatientsByLocation];
  } else {
    // for current patients who are not old or their cache is before 2 hours ago
    let changedPatients = [];
    let expiredPatients = [];

    currentPatientsByLocation.forEach((patient) => {
      if (!prePatientsMap.has(patient.PERSON_ID)) {
        changedPatients.push(patient);
      }

      if (moment().unix() - prePatientsMap.get(patient.PERSON_ID) >= 12.1 * 60 * 60) {
        // more than 12 hours
        expiredPatients.push(patient);
      }
    });

    if (changedPatients.length) {
      console.log(
        "changedPatients :>> ",
        changedPatients.map((x) => x.PERSON_ID)
      );
    }

    if (expiredPatients.length) {
      console.log(
        "expiredPatients :>> ",
        expiredPatients.map((x) => x.PERSON_ID)
      );
    }

    let willUpdatePatients = [...newInputPatients, ...changedPatients, ...expiredPatients];
    if (willUpdatePatients.length) {
      await insertPatientsCache(willUpdatePatients);
    } else {
      console.log("no patients will be updated");
    }
    return willUpdatePatients;
  }
};

const initialize = async () => {
  console.log("initialize interval update");
  let manuallyInputPatients = await getPatientsByManuallyInput();
  console.log('initialize manuallyInputPatients :>> ', manuallyInputPatients.map(x=>x.PERSON_ID));
  if (manuallyInputPatients && manuallyInputPatients.length) {
    console.log("insertPatientsCache...");
    await insertPatientsCache(manuallyInputPatients);
    console.log("insertNoteCache...");
    await insertNoteCache(manuallyInputPatients);
    console.log("insertDiagnosisCache...");
    await insertDiagnosisCache(manuallyInputPatients);
    console.log("insertInoutCache...");
    await insertInoutCache(manuallyInputPatients);
    console.log("insertRssCache...");
    await insertRssCache(manuallyInputPatients);
    console.log("insertMedCache...");
    await insertMedCache(manuallyInputPatients);    
    console.log("🕰️ 🕰️ 🕰️ patients cache updated at :>> ", new Date().toString());
  } else {
    console.log("no update at initialization");
  }
};

const startInterval = () => {
  const checkPatientsInterval = setInterval(async () => {
    console.log("🕰️ checking patients at ", new Date().toString());
    let newPatients = await updatePatients();
    console.log("newPatients :>> ", newPatients);

    if (newPatients && newPatients.length) {
      console.log("updating note cache...");
      await insertNoteCache(newPatients);
      console.log("updating diagnosis cache...");
      await insertDiagnosisCache(newPatients);
      console.log("updating inout cache...");
      await insertInoutCache(newPatients);
      console.log("updating rss cache...");
      await insertRssCache(newPatients);
      console.log("updating medicine cache...");
      await insertMedCache(newPatients);    
      console.log("🕰️ patients cache updated at :>> ", new Date().toString());
    } else {
      console.log("no change on current patients");
    }
  }, INTERVAL_MINUTE * 60 * 1000); // 1 minute = 60 * 1000 ms
  return checkPatientsInterval;
};

const close = (checkPatientsInterval) => {
  clearInterval(checkPatientsInterval);
  console.log("interval cleared");
};

module.exports = {
  initialize,
  // startInterval,
  close,
};
