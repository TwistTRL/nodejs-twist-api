/*
 * @Author: Peng Zeng
 * @Date: 2020-08-27 11:07:25
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-18 19:17:54
 */
 
const database = require("../../services/database");

const moment = require("moment");
const {
  DIAGNOSES_TO_DISPLAY,
} = require("twist-xlsx");

const SQL_GET_OPERATIVE = `
SELECT 
  MRN,
  EVENT_ID,
  EVENT_DT_TM,
  DIAGNOSES,
  STUDY_TYPE
FROM FYLER_RAW
WHERE STUDY_TYPE LIKE 'SURG_FYLER_PRI_PRO'
  AND MRN = :mrn
ORDER BY EVENT_DT_TM`;

const SQL_GET_ECMO = `
SELECT
  VALID_FROM_DT_TM,
  ECMO_VAD_SCORE
FROM ECMO_VAD_VARIABLE
JOIN CHB_MRN USING (PERSON_ID)
WHERE MRN = :mrn
ORDER BY VALID_FROM_DT_TM`;

async function operativeQuerySQLExecutor(conn, binds) {
  // set nls_date_format for oracledb.fetchAsString
  await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS'`)
  
  console.log("~~SQL_GET_OPERATIVE: ", SQL_GET_OPERATIVE);
  let rawRecord = await conn.execute(SQL_GET_OPERATIVE, binds);
  if (!rawRecord.rows[0]) {
    console.log("Warning: no OPERATIVE");
    return null;
  }
  console.log('==> rawRecord.rows[0] :>> ', rawRecord.rows[0]);

  const rawDisplayArr = rawRecord.rows.map((item) => {
    return {
      event_id: item.EVENT_ID,
      event_time: item.EVENT_DT_TM,
      diagnoses: item.DIAGNOSES,
      operative_display: DIAGNOSES_TO_DISPLAY[item.DIAGNOSES],
    };
  });

  // [...{
  //     "event_id": 3139345,
  //     "event_time": "2018-08-15T01:15:00.000Z",
  //     "diagnoses": "6921 - Extracorporeal membrane oxygenator cannulation through neck vessels",
  //     "operative_display": "ECMO cannulation"
  // },
  // {
  //     "event_id": 3139340,
  //     "event_time": "2018-08-15T05:00:00.000Z",
  //     "diagnoses": "6919 - Extracorporeal membrane oxygenator cannula revision",
  //     "operative_display": "ECMO cannula revision"
  // },
  // {
  //     "event_id": 3140845,
  //     "event_time": "2018-08-17T18:10:00.000Z",
  //     "diagnoses": "6913 - Extracorporeal membrane oxygenator decannulation",
  //     "operative_display": "ECMO decannulation"
  // },...]

  return await calculateEcmoDays(rawDisplayArr, conn, binds);
}

/**
 * ecmo days calculation
 * @param {Array} arr 
 */
const calculateEcmoDays = async (arr, conn, binds) => {
   let result = [];
   let curECMOStart;
   let curECMOStartIndex;
   let revisionECMOAsStart;
 
   for (let record of arr) {
     if (record.operative_display === "ECMO cannulation") {
       if (curECMOStart) {
         // previous ECMO not finish, new ECMO start (error)
         result[curECMOStartIndex].operative_display = "ECMO cannulation (unknown days)";
       }
       curECMOStart = record;
       curECMOStartIndex = result.length;
       result.push({ ...record, ...{ ecmo_ids: [record.event_id] } });
     } else if (record.operative_display === "ECMO cannula revision") {
       if (curECMOStart) {
         // normal start with a revision now
         result[curECMOStartIndex].ecmo_ids.push(record.event_id);
       } else {
         // no start but has a revision now
         if (!revisionECMOAsStart) {
           revisionECMOAsStart = record;
         }
       }
     } else if (record.operative_display === "ECMO decannulation") {
       if (curECMOStart) {
         // normal end
         result[curECMOStartIndex].ecmo_ids.push(record.event_id);
         let ecmo_days = moment(record.event_time).diff(
           moment(curECMOStart.event_time),
           "days",
           true
         );
         ecmo_days = Math.round(ecmo_days * 10) / 10;
         result[curECMOStartIndex].operative_display = `ECMO cannulation (${ecmo_days} days)`;
       } else {
         // no start but has an end now
         let endTime = record.event_time;
 
         const rawRecordECMO = await conn.execute(SQL_GET_ECMO, binds);
 
         const ecmo_arr = rawRecordECMO.rows;
         let ecmo_days;
         if (!ecmo_arr || !ecmo_arr[0] || moment.unix(ecmo_arr[0].VALID_FROM_DT_TM) > moment(endTime)) {
           console.log('ecmo_arr :>> ', ecmo_arr);
           ecmo_days = "error ";
         } else {
           let ecmo_start = ecmo_arr[0].VALID_FROM_DT_TM;
           let pre_ecmo = ecmo_start;
           let found_ecmo_start = false;
           for (let time of ecmo_arr.map((x) => x[0])) {
             if (moment(endTime).diff(moment.unix(time), "hours") > 12) {
               if (moment.unix(time).diff(moment.unix(pre_ecmo), "hours") < 12) {
                 pre_ecmo = time;
               } else {
                 ecmo_start = time;
                 pre_ecmo = ecmo_start;
               }
             } else {
               found_ecmo_start = true;
             }
           }
           if (found_ecmo_start) {
             ecmo_days = moment(endTime).diff(moment.unix(ecmo_start), "days");
           } else {
             ecmo_days = "error ";
           }
         }
 
         record.operative_display = `ECMO cannulation (${ecmo_days} days)`;
         result.push(record);
       }
       curECMOStart = null;
       curECMOStartIndex = null;
       revisionECMOAsStart = null;
     } else {
       result.push(record);
     }
   }
   return result;
}

const getOperativeDisplay = database.withConnection(async function (conn, binds) {
  return await operativeQuerySQLExecutor(conn, binds);
});

module.exports = {
  getOperativeDisplay,
  calculateEcmoDays,
};
