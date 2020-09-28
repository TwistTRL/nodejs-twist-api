/*
 * @Author: Peng Zeng
 * @Date: 2020-09-20 19:20:03
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-25 10:45:27
 */

const oracledb = require("oracledb");
const moment = require("moment");

const { getDisplayLine } = require("../../db_apis/diagnosis_display/get-display-line");
const { getVerticalBarDisplay } = require("../../db_apis/diagnosis_display/get-verticalbar-timeline");

const DELETE_DIAGNOSIS_CACHE_SQL = `
DELETE FROM API_CACHE_DIAGNOSIS`;

const INSERT_DIAGNOSIS_CACHE_SQL = `
INSERT INTO API_CACHE_DIAGNOSIS
  (PERSON_ID, AGE_DISPLAY, SEX_DISPLAY, HETEROTAXY_DISPLAY, SDD_DISPLAY, DISEASE_DISPLAY, EVENT_ID, DT_UNIX, DIAGNOSES, STUDY_TYPE, OPERATIVE_DISPLAY, UPDT_TM)
VALUES
  (:person_id, :age_display, :sex_display, :heterotaxy_display, :sdd_display, :disease_display, :event_id, :unix_time, :diagnoses, :study_type, :operative_display, TO_DATE(:update_time, 'YYYY-MM-DD HH24:MI:SS'))
`;

const insertDiagnosisCache = async (patients) => {
  let binds = [];
  for (let patient of patients) {
    let person_id = Number(patient.PERSON_ID);
    let mrn = patient.MRN;
    console.log("insertDiagnosisCache mrn :>> ", mrn);

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
      let update_time = moment().format("YYYY-MM-DD HH:mm:ss");
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
        study_type,
        operative_display,
        update_time,
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
