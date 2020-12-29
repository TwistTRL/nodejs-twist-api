/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-27 14:45:16 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-28 19:09:48
 */

const oracledb = require("oracledb");
const dbConfig = require("../../config/database-config.js");

//TODO: cahce all landing page current patients info

// const INSERT_CENSUS_CACHE_SQL = `
// INSERT INTO API_CACHE_CENSUS
//   (DTUNIX, PERSON_ID, MRN, FIRST_NAME, MIDDLE_NAME, LAST_NAME, BIRTH_UNIX_TS, DECEASED_UNIX_TS, SEX, BED_START_UNIX, BED_END_UNIX,
//     LOC_NURSE_UNIT_CD,  LOC_ROOM_CD, NURSE_UNIT_DISP, LOCATION_BED, BED_DISP, ROOM_DISP, ASSIGN_ID, BED_ASSIGN_ID, PATIENT_WEIGHT, 
//     WEIGHT_UNIX, E, V, N, INO, AGE_DISPLAY, ANATOMY_DISPLAY, RSS, RST, RSS_UNIX, ECMO_FLOW_NORM, ECMO_VAD_SCORE, ECMO_UNIX,
//     TEAM, CHIEF_COMPLAINT, PERSONNEL_LIST_ID)
// VALUES
//   (:dtunix, :person_id, :mrn, :first_name, :middle_name, :last_name, :birth_unix_ts, :deceased_unix_ts, :sex, :bed_start_unix, :bed_end_unix,
//     :loc_nurse_unit_cd,  :loc_room_cd, :nurse_unit_disp, :location_bed, :bed_disp, :room_disp, :assign_id, :bed_assign_id, :patient_weight, 
//     :weight_unix, :e, :v, :n, :ino, :age_display, :anatomy_display, :rss, :rst, :rss_unix, :ecmo_flow_norm, :ecmo_vad_score, :ecmo_unix,
//     :team, :chief_complaint, :personnel_list_id)
// `;

// const INSERT_CENSUS_PERSONNEL_CACHE_SQL = `
// INSERT INTO API_CACHE_CENSUS_PERSONNEL
//   (PERSONNEL_LIST_ID, NAME_FULL_FORMATTED, CONTACT_NUM, ASSIGN_TYPE, TEAM_ASSIGN_TYPE, START_UNIX, END_UNIX)
// VALUES
//   (:personnel_list_id, :name_full_formatted, :contact_num, :assign_type, :team_assign_type, :start_unix, :end_unix)
// `;

// const DELETE_EXPIRED_PERSONNEL_CACHE_SQL = (ts) => `
// DELETE FROM API_CACHE_CENSUS_PERSONNEL
// WHERE PERSONNEL_LIST_ID IN (
//   SELECT DISTINCT PERSONNEL_LIST_ID
//   FROM API_CACHE_CENSUS
//   WHERE DTUNIX <= ${ts}
// )
// `

// const DELETE_EXPIRED_CENSUS_CACHE_SQL = (ts) => `
// DELETE FROM API_CACHE_CENSUS
// WHERE DTUNIX <= ${ts}
// `



// const insertCensusCache = async (dtunix, current_census_data) => {
//   const census_binds = [];
//   let personnel_binds = [];

//   current_census_data.forEach((element) => {
//     census_binds.push({
//       dtunix,
//       person_id: element.PERSON_ID,
//       mrn: element.MRN,
//       first_name: element.FIRST_NAME,
//       middle_name: element.MIDDLE_NAME,
//       last_name: element.LAST_NAME,
//       birth_unix_ts: element.BIRTH_UNIX_TS,
//       deceased_unix_ts: element.DECEASED_UNIX_TS,
//       sex: element.SEX,
//       bed_start_unix: element.BED_START_UNIX,
//       bed_end_unix: element.BED_END_UNIX,
//       loc_nurse_unit_cd: element.LOC_NURSE_UNIT_CD,
//       loc_room_cd: element.LOC_ROOM_CD,
//       nurse_unit_disp: element.NURSE_UNIT_DISP,
//       location_bed: element.LOCATION_BED,
//       bed_disp: element.BED_DISP,
//       room_disp: element.ROOM_DISP,
//       assign_id: element.ASSIGN_ID,
//       bed_assign_id: element.BED_ASSIGN_ID,
//       patient_weight: element.WEIGHT,
//       weight_unix: element.WEIGHT_UNIX,
//       e: Number(element.E),
//       v: Number(element.V),
//       n: Number(element.N),
//       ino: Number(element.INO),
//       age_display: element.AGE_DISPLAY,
//       anatomy_display: element.ANATOMY_DISPLAY,
//       rss: element.RSS,
//       rst: element.RST,
//       rss_unix: element.RSS_UNIX,
//       ecmo_flow_norm: element.ECMO_FLOW_NORM,
//       ecmo_vad_score: element.ECMO_VAD_SCORE,
//       ecmo_unix: element.ECMO_UNIX,
//       team: element.TEAM,
//       chief_complaint: element.CHIEF_COMPLAINT,
//       personnel_list_id: element.PERSON_ID + "-" + dtunix,
//     });

//     const current_personnel_list = element.PERSONNEL.map((item) => ({
//       personnel_list_id: element.PERSON_ID + "-" + dtunix,
//       name_full_formatted: item.NAME_FULL_FORMATTED,
//       contact_num: item.CONTACT_NUM,
//       assign_type: item.ASSIGN_TYPE,
//       team_assign_type: item.TEAM_ASSIGN_TYPE,
//       start_unix: item.START_UNIX,
//       end_unix: item.END_UNIX,
//     }));

//     personnel_binds = [...personnel_binds, ...current_personnel_list];
//   });

//   // console.log('census_binds :>> ', census_binds);
//   // console.log('personnel_binds :>> ', personnel_binds);

//   console.time("insert-database-census");
//   const conn = await oracledb.getConnection(dbConfig.poolAlias);
//   const insertCensusTable = await conn.executeMany(INSERT_CENSUS_CACHE_SQL, census_binds);
//   const insertPersonnelTable = await conn.executeMany(
//     INSERT_CENSUS_PERSONNEL_CACHE_SQL,
//     personnel_binds
//   );
//   await conn.commit();
//   await conn.close();
//   console.timeEnd("insert-database-census");
//   console.log('insertCensusTable  :>> ', insertCensusTable );
//   console.log('insertPersonnelTable  :>> ', insertPersonnelTable );

//   return { insertCensusTable, insertPersonnelTable };
// };


// const deleteExpiredCensusCache = async (expired_ts) => {

//   console.time("delete-database-census");
//   const conn = await oracledb.getConnection(dbConfig.poolAlias);
//   // delete personnel cache first because need personnel_list_id in census cache
//   const deletePersonnelTable = await conn.execute(
//     DELETE_EXPIRED_PERSONNEL_CACHE_SQL(expired_ts)
//   );
//   const deleteCensusTable = await conn.execute(DELETE_EXPIRED_CENSUS_CACHE_SQL(expired_ts));

//   await conn.commit();
//   await conn.close();
//   console.timeEnd("delete-database-census");
//   return { deletePersonnelTable, deleteCensusTable };
// }

module.exports = {
  // insertCensusCache,
  // deleteExpiredCensusCache,
};
