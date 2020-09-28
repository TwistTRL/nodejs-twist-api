const { getPatientsByLocation } = require("../db_apis/adt/get-patients-by-location");
const {insertNoteCache} = require("./cache/procedural-note-cache")
const {insertInoutCache} = require("./cache/inout-cache")
const {insertDiagnosisCache} = require("./cache/diagnosis-cache")

const isEqual = require('lodash.isequal');
const INTERVAL_MINUTE = 10;  // every 10 min
let prePatients = null;

const checkPatients = setInterval(async () => {
  console.log("checking patients at ", new Date().toString());
  const currentPatients = await getPatientsByLocation();
  if (!isEqual(currentPatients, prePatients)) {
    console.log("update because patients changed");

    prePatients = currentPatients;
    insertNoteCache(currentPatients);
    insertDiagnosisCache(currentPatients);
    insertInoutCache(currentPatients);
    console.log('patients cache updated at :>> ', new Date().toString());
    console.log('currentPatients :>> ', currentPatients.map(x=>x.PERSON_ID));
  } else {
    console.log("no change on current patients");
  }

}, INTERVAL_MINUTE * 60 * 1000);

const close = () => {
  clearInterval(checkPatients);
  console.log("interval cleared");
}


module.exports = {
  close
};
