const { getPatientsByLocation } = require("../db_apis/adt/get-patients-by-location");
const { insertPatientsCache } = require("./cache/patients-cache");

const { insertNoteCache } = require("./cache/procedural-note-cache");
const { insertInoutCache } = require("./cache/inout-cache");
const { insertDiagnosisCache } = require("./cache/diagnosis-cache");
const { insertRssCache } = require("./cache/rss-cache");

const { getPatientsCache } = require("../db_apis/cache/get-patients-cache");

const moment = require("moment");
const INTERVAL_MINUTE = 10; // every 10 min

// start checking
// strategy:
// 1. get new patients, compare with old
// 2. if one new patient is not in old array, update that one
// 3. check last update time, if more than 2 hours, update that one
const updatePatients = async () => {
  let currentPatientsCache = await getPatientsCache();
  let currentPatientsByLocation = await getPatientsByLocation();
  console.log("currentPatientsByLocation.length :>> ", currentPatientsByLocation.length);
  let prePatientsMap = new Map(currentPatientsCache.map((x) => [x.PERSON_ID, x.UPDT_TM]));

  if (!currentPatientsCache.length) {
    console.log("no cache, will insert all current patients");
    if (currentPatientsByLocation.length) {
      console.log(
        "current person_id list for location :>> ",
        currentPatientsByLocation.map((x) => x.PERSON_ID)
      );
      await insertPatientsCache(currentPatientsByLocation);
    } else {
      console.warn("No records for currentPatientsByLocation");
    }
    return currentPatientsByLocation;
  } else {
    // for current patients who are not old or their cache is before 2 hours ago
    // let willUpdatePatients = currentPatientsByLocation.filter(
    //   (patient) =>
    //     !prePatientsMap.has(patient.PERSON_ID) ||
    //     moment(prePatientsMap.get(patient.PERSON_ID)).isBefore(moment().subtract(2, "hours"))
    // );

    let changedPatients = [];
    let expiredPatients = [];

    currentPatientsByLocation.forEach((patient) => {
      if (!prePatientsMap.has(patient.PERSON_ID)) {
        changedPatients.push(patient);
      }

      if (moment(prePatientsMap.get(patient.PERSON_ID)).isBefore(moment().subtract(2, "hours"))) {
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

    let willUpdatePatients = [...changedPatients, ...expiredPatients];
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
  let willUpdatePatients = await updatePatients();
  if (willUpdatePatients && willUpdatePatients.length) {
    console.log("insertNoteCache...");
    await insertNoteCache(willUpdatePatients);
    console.log("insertDiagnosisCache...");
    await insertDiagnosisCache(willUpdatePatients);
    console.log("insertInoutCache");
    await insertInoutCache(willUpdatePatients);
    console.log("insertRssCache");
    await insertRssCache(willUpdatePatients);
    console.log("🕰️ patients cache updated at :>> ", new Date().toString());
  } else {
    console.log("no update at initialization");
  }
};

const startInterval = () => {
  const checkPatientsInterval = setInterval(async () => {
    console.log("checking patients at ", new Date().toString());
    let newPatients = await updatePatients();
    console.log("newPatients :>> ", newPatients);

    if (newPatients && newPatients.length) {
      await insertNoteCache(newPatients);
      await insertDiagnosisCache(newPatients);
      await insertInoutCache(newPatients);
      await insertRssCache(newPatients);
      console.log("patients cache updated at :>> ", new Date().toString());
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
  startInterval,
  close,
};
