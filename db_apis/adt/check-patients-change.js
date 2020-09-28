/*
 * @Author: Peng Zeng 
 * @Date: 2020-09-24 14:58:38 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-24 17:08:03
 */

const database = require("../../services/database");
const getPatientsByLocation = require("./get-patients-by-location");
const insertNoteCache = require("../cache/procedural-note-cache");
const insertDiagnosisCache = require("../cache/diagnosis-cache");
const insertInoutCache = require("../cache/inout-cache");

const isEqual = require('lodash.isequal');
const INTERVAL_MINUTE = 5;  // every 5 min
let prePatients;

const checkPatients = setInterval(async () => {
  const currentPatients = await getPatientsByLocation();
  if (!isEqual(currentPatients, prePatients)) {
    //update

    prePatients = currentPatients;
    // insertNoteCache(currentPatients);
    // insertDiagnosisCache(currentPatients);
    // insertInoutCache(currentPatients);
    console.log('patients cache updated at :>> ', new Date().toString());
    console.log('currentPatients :>> ', currentPatients);
  }  

}, INTERVAL_MINUTE * 60 * 1000);


module.exports = {
  checkPatients,
};
