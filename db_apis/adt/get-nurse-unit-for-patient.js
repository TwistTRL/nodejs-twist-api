/*
 * @Author: Peng Zeng 
 * @Date: 2020-10-15 15:22:42 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-15 15:34:50
 */

const database = require("../../services/database");
const {NURSE_UNIT_DICTIONARY} = require("../../db_relation/nurse-unit-abbr");

const GET_NURSE_UNIT_TIME_SQL = `
SELECT 
  NURSE_UNIT_DISP,
  ROOM_DISP,
  LOCATION_BED,
  START_UNIX,
  END_UNIX
FROM ADT
WHERE PERSON_ID = :person_id
ORDER BY START_UNIX
`;


async function getNurseUnitTimeSqlExecutor(conn,binds){
  console.time('get Nurse unit for patient');
  console.log(GET_NURSE_UNIT_TIME_SQL);
  let NUrecords = await conn.execute(GET_NURSE_UNIT_TIME_SQL, binds);
  let arr = NUrecords.rows;
  console.log("record size :", arr.length);
  if (arr.length < 1) {
    return [];
  }

  let results = getRoomTimeResults(arr);
  console.timeEnd('get Nurse unit for patient');
  return results;
}

const getRoomTimeResults = (arr) => {
  let results = [];
  let pendingResult;
  let resultId = 0;


  for (let NUrecord of arr) {
    // console.log("location: ", NUrecord);

    let singleResult = {};
    // console.log("NUrecord.NAME = [" + NUrecord.NAME + "]");

    singleResult.name = NUrecord.NURSE_UNIT_DISP;
    singleResult.room_name = NUrecord.ROOM_DISP;
    singleResult.bed_name = NUrecord.LOCATION_BED;
    singleResult.start = NUrecord.START_UNIX;
    singleResult.end = NUrecord.END_UNIX;
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

const getNurseUnitTime = database.withConnection(getNurseUnitTimeSqlExecutor);

module.exports = {
  getNurseUnitTime
};
