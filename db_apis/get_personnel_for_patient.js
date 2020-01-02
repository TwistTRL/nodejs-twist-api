const database = require("../services/database");
const SQL_MODEL = require("../db_relation/converted-database"); 

const SQL_PART1 = `
TEMP AS(
SELECT DISTINCT CHB_PRSNL_ID FROM
  PATIENT INNER JOIN PATIENT_ENCOUNTER USING(PERSON_ID) 
  INNER JOIN PATIENT_BED_ASSIGNMENT USING(ENCNTR_ID)
  INNER JOIN BED USING(BED_CD)
  INNER JOIN PERSONNEL_BED_ASSIGNMENT USING(BED_CD)
  WHERE PERSON_ID = :person_id
)`;

const SQL_PART2 = `
SELECT DISTINCT CHB_PRSNL_ID, NAME_FIRST, NAME_LAST, SEX  FROM
  TEMP JOIN PERSONNEL USING(CHB_PRSNL_ID)
`;



async function getPersonnelForPatientSqlExecutor(conn,binds){
  console.time('get Personnel for patient');

  let SQL_GET_PERSONNEL = `
  WITH`
  + SQL_MODEL.SQL_MODEL_PATIENT 
  + `,` + SQL_MODEL.SQL_MODEL_PATIENT_ENCOUNTER 
  + `,` + SQL_MODEL.SQL_MODEL_PATIENT_BED_ASSIGNMENT
  + `,` + SQL_MODEL.SQL_MODEL_BED
  + `,` + SQL_MODEL.SQL_MODEL_PERSONNEL_BED_ASSIGNMENT
  + `,` + SQL_MODEL.SQL_MODEL_PERSONNEL
  + `,` + SQL_PART1

  // + SQL_PART1;
  + SQL_PART2;


  console.log(" sql: " + SQL_GET_PERSONNEL);


  let personnelRecords = await conn.execute(SQL_GET_PERSONNEL, binds);
  let result = [];
  // personnelRecords = {"metadata":[], "rows":[]}
  var arr = personnelRecords.rows;
  console.log("record size :", arr.length);
  if (arr.length < 1) {
    return ["Empty results"];
  }

  for (let personnelRecord of arr) {

    result.push(personnelRecord);
  }  


  console.timeEnd('get Personnel for patient');
  return result;
}

const getPersonnelForPatient = database.withConnection(getPersonnelForPatientSqlExecutor);

module.exports = {
  getPersonnelForPatient
};
