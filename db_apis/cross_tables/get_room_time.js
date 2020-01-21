const database = require("../../services/database");
const SQL_MODEL = require("../../db_relation/converted-database"); 
const {NURSE_UNIT_DICTIONARY} = require("../../db_relation/nurse-unit-abbr");

const SQL_PART1 = `
TEMP AS(
SELECT BED_CD, START_UNIX_TS, END_UNIX_TS
FROM
  PATIENT INNER JOIN PATIENT_ENCOUNTER USING(PERSON_ID) 
  INNER JOIN PATIENT_BED_ASSIGNMENT USING(ENCNTR_ID)  
  WHERE PERSON_ID = :person_id
)`;

const SQL_PART2 = `
SELECT 
NURSE_UNIT.NAME AS NAME, TEMP.START_UNIX_TS, TEMP.END_UNIX_TS, ROOM.NAME AS ROOM_NAME, BED.NAME AS BED_NAME
FROM
  TEMP JOIN BED USING(BED_CD)
  JOIN ROOM USING(ROOM_CD)
  JOIN NURSE_UNIT USING(NURSE_UNIT_CD)
ORDER BY TEMP.START_UNIX_TS, NURSE_UNIT.NAME
`;


async function getNUTimeSqlExecutor(conn,binds){
  console.time('get Nurse unit for patient');

  let SQL_GET_ROOM_TIME = `
  WITH`
  + SQL_MODEL.SQL_MODEL_PATIENT 
  + `,` + SQL_MODEL.SQL_MODEL_PATIENT_ENCOUNTER 
  + `,` + SQL_MODEL.SQL_MODEL_PATIENT_BED_ASSIGNMENT
  + `,` + SQL_MODEL.SQL_MODEL_BED
  + `,` + SQL_MODEL.SQL_MODEL_ROOM
  + `,` + SQL_MODEL.SQL_MODEL_NURSE_UNIT
  + `,` + SQL_PART1
  + SQL_PART2;


  console.log(" sql: " + SQL_GET_ROOM_TIME);
  let NUrecords = await conn.execute(SQL_GET_ROOM_TIME, binds);
  // NUrecords = {"metadata":[], "rows":[]}
  var arr = NUrecords.rows;
  console.log("record size :", arr.length);
  if (arr.length < 1) {
    return ["Empty results"];
  }

  let results = getRoomTimeResults(arr);
  console.timeEnd('get Nurse unit for patient');
  return results;
}

function getRoomTimeResults(arr) {
  let results = [];
  let pendingResult;
  var resultId = 0;


  for (let NUrecord of arr) {
    // console.log("location: ", NUrecord);

    let singleResult = {};
    // console.log("NUrecord.NAME = [" + NUrecord.NAME + "]");

    singleResult.name = NUrecord.NAME;
    singleResult.room_name = NUrecord.ROOM_NAME;
    singleResult.bed_name = NUrecord.BED_NAME;
    singleResult.start = NUrecord.START_UNIX_TS;
    singleResult.end = NUrecord.END_UNIX_TS;
    if (pendingResult == null) {
      pendingResult = singleResult;
      continue;
    }

    if (pendingResult.name == singleResult.name 
      && pendingResult.room_name == singleResult.room_name 
      && pendingResult.bed_name == singleResult.bed_name
      && pendingResult.end == singleResult.start) {
      pendingResult.end = singleResult.end;
      continue;
    }

    if (pendingResult.end > singleResult.start) {
      console.log("error on result time: ", pendingResult.end);
    } else if (pendingResult.end == singleResult.start){

      pendingResult.id = resultId;
      results.push(pendingResult);  

    } else if (pendingResult.end < singleResult.start){

      pendingResult.id = resultId;
      results.push(pendingResult);
      resultId++;
      let homeResult = {};
      homeResult.name = "unknown";
      homeResult.room_name = "";
      homeResult.bed_name = "";
      homeResult.start = pendingResult.end;
      homeResult.end = singleResult.start;
      homeResult.id = resultId;
      results.push(homeResult);

    } else {
      console.log("error on time: ", pendingResult.end);
    }

    pendingResult = singleResult;
    resultId++;
  } 

  // last one
  if (pendingResult != null) {
    pendingResult.id = resultId;
    results.push(pendingResult);
  }

  return results; 
}

const getNUTime = database.withConnection(getNUTimeSqlExecutor);

module.exports = {
  getNUTime
};
