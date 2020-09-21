/*
 * @Author: Peng Zeng
 * @Date: 2020-09-20 19:20:03
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-20 22:08:15
 */

const oracledb = require("oracledb");
// const database = require("../../services/database");
const moment = require("moment");

const { getPatientsByLocation } = require("../adt/get-patients-by-location");

const { getDisplayLine } = require("../diagnosis_display/get-display-line");
const { getVerticalBarDisplay } = require("../diagnosis_display/get-verticalbar-timeline");

const DELETE_DIAGNOSIS_CACHE_SQL = `
DELETE FROM API_CACHE_DIAGNOSIS`;

const INSERT_DIAGNOSIS_CACHE_SQL = `
INSERT INTO API_CACHE_DIAGNOSIS
  (PERSON_ID, AGE_DISPLAY, SEX_DISPLAY, HETEROTAXY_DISPLAY, SDD_DISPLAY, DISEASE_DISPLAY, EVENT_ID, DT_UNIX, DIAGNOSES, OPERATIVE_DISPLAY)
VALUES
  (:person_id, :age_display, :sex_display, :heterotaxy_display, :sdd_display, :disease_display, :event_id, :unix_time, :diagnoses, :operative_display)
`;

const insertDiagnosisCache = async () => {
  const patients = await getPatientsByLocation();
  let binds = [];
  for (let patient of patients) {
    let person_id = Number(patient.PERSON_ID);
    let mrn = patient.MRN;

    let displayLine = await getDisplayLine({mrn});
    let age_display = displayLine.age_display;
    let sex_display = displayLine.sex_display;
    let heterotaxy_display = displayLine.heterotaxy_display;
    let sdd_display = displayLine.sdd_display;
    let disease_display = displayLine.disease_display;

    let verticalBarDisplay = await getVerticalBarDisplay({mrn});

    for (let verticalBar of verticalBarDisplay) {
      let event_id = verticalBar.event_id;
      let unix_time = verticalBar.unix_time;
      let diagnoses = verticalBar.diagnoses;
      let study_type = verticalBar.study_type;
      let operative_display = verticalBar.operative_display;

      binds.push({
        person_id,
        age_display,
        sex_display,
        heterotaxy_display,
        sdd_display,
        disease_display,
        event_id,
        unix_time,
        diagnoses,
        operative_display,
      });
    }
  }

  // write into database table API_CACHE_DIAGNOSIS
  console.time("insert-database-diagnosis");
  const conn = await oracledb.getConnection();
  const deleteTable = await conn.execute(DELETE_DIAGNOSIS_CACHE_SQL);
  const insertTable = await conn.executeMany(INSERT_DIAGNOSIS_CACHE_SQL, binds);
  await conn.commit();
  await conn.close();
  console.timeEnd("insert-database-diagnosis");

  return insertTable;
};

module.exports = {
  insertDiagnosisCache,
};
