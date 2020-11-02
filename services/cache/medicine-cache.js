/*
 * @Author: Peng Zeng 
 * @Date: 2020-10-19 15:19:06 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-26 17:48:00
 */


const oracledb = require("oracledb");
const moment = require("moment");

const { getMed } = require("../../db_apis/get-med");
const isEmpty = require("lodash.isempty");

const DELETE_MED_CACHE_SQL = (n) => `
DELETE FROM API_CACHE_MED
  WHERE PERSON_ID IN (${[...new Array(n).keys()].map((i) => ":" + i.toString()).join(",")})
`;

const INSERT_MED_CACHE_SQL = ` 
INSERT INTO API_CACHE_MED
  (PERSON_ID, 
  MED_CATEGORY,
  MED_NAME,
  START_TIME,
  END_TIME,
  DRUG,
  RXCUI,
  DOSE,
  UNIT,
  DOSING_WEIGHT,
  ROUTE,
  SUCTION_TIME,
  LVL,
  COMMENT,
  DEVICE,
  INSTILLATION,
  MEDICATION,
  OXYGENATION,
  SUCTION_TYPE)
VALUES
  (:person_id, 
  :category,
  :name,
  :start,
  :end,
  :drug,
  :rxcui,
  :dose,
  :unit,
  :dosing_weight,
  :route,
  :time,
  :lvl,
  :comment,
  :device,
  :instillation,
  :medication,
  :oxygenation,
  :type);
`;

const insertMedCache = async (patients) => {
  let binds = [];
  for (let patient of patients) {
    let person_id = patient.person_id;
    let personMed = await getMed({ person_id });
    if (!personMed || !isEmpty(personMed)) {
      console.log("empty med ", person_id);
    } else {
      //cat_structure
      for (let cat in personMed) {
        if (cat !== "cat_structure") {
          personMed[cat].forEach(element => {
            let bind = {
              person_id: person_id, 
              category: cat,
              name: element.name,
              start: element.start,
              end: element.end,
              drug: element.durg,
              rxcui: element.RXCUI,
              dose: element.dose,
              unit: element.unit,
              dosing_weight: element.dosing_weight,
              route: element.route,
              time: element.time,
              lvl: element.lvl,
              comment: element.comment,
              device: element.device,
              instillation: element.instillation,
              medication: element.medication,
              oxygenation: element.oxygenation,
              type: element.type,
            };
            binds.push(bind); 
          });
        }
      }
    }

  }
   
// FIXME
// not working

  console.log("API_CACHE_MED insert records length :>> ", binds.length);
  if (!binds.length) {
    return {}
  }

  // write into database table API_CACHE_MED
  console.time("insert-database-med");
  const conn = await oracledb.getConnection();
  const deleteSql = DELETE_MED_CACHE_SQL(patients.length);
  const deleteTable = await conn.execute(deleteSql, patients.map((x) => Number(x.PERSON_ID)));
  const insertTable = await conn.executeMany(INSERT_MED_CACHE_SQL, binds);
  await conn.commit();
  await conn.close();
  console.timeEnd("insert-database-med");

  return insertTable;
};

module.exports = {
  insertMedCache,
};
