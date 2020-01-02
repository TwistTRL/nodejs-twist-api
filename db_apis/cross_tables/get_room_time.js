const database = require("../../services/database");
const SQL_MODEL = require("../../db_relation/converted-database"); 

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
  ROOM.NAME, TEMP.START_UNIX_TS, TEMP.END_UNIX_TS
FROM
  TEMP JOIN BED USING(BED_CD)
  JOIN ROOM USING(ROOM_CD)
ORDER BY TEMP.START_UNIX_TS, ROOM.NAME 
`;


async function getRoomTimeSqlExecutor(conn,binds){
  console.time('get Room for patient');

  let SQL_GET_ROOM_TIME = `
  WITH`
  + SQL_MODEL.SQL_MODEL_PATIENT 
  + `,` + SQL_MODEL.SQL_MODEL_PATIENT_ENCOUNTER 
  + `,` + SQL_MODEL.SQL_MODEL_PATIENT_BED_ASSIGNMENT
  + `,` + SQL_MODEL.SQL_MODEL_BED
  + `,` + SQL_MODEL.SQL_MODEL_ROOM
  + `,` + SQL_PART1
  + SQL_PART2;


  console.log(" sql: " + SQL_GET_ROOM_TIME);


  let roomRecords = await conn.execute(SQL_GET_ROOM_TIME, binds);
  let result = [];
  // roomRecords = {"metadata":[], "rows":[]}
  var arr = roomRecords.rows;
  console.log("record size :", arr.length);
  if (arr.length < 1) {
    return ["Empty results"];
  }

  for (let roomRecord of arr) {

    result.push(roomRecord);
  }  


  console.timeEnd('get Room for patient');
  return result;
}

const getRoomTime = database.withConnection(getRoomTimeSqlExecutor);

module.exports = {
  getRoomTime
};
