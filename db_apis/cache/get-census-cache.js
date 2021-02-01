/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-23 13:03:10 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-01 10:14:53
 */

const database = require("../../services/database");


/**
 * getting data from 3 cache tables:
 * API_CACHE_CENSUS
 * API_CACHE_CENSUS_PERSONNEL --> get array
 * API_CACHE_CENSUS_INFUSIONS --> only get one record(time_type = 8, means recent 8 hours record) for each patient at current time
 */
const GET_CENSUS_CACHE_SQL = `
SELECT 
DTUNIX, PERSON_ID, MRN, FIRST_NAME, MIDDLE_NAME, LAST_NAME, BIRTH_UNIX_TS, DECEASED_UNIX_TS, SEX, BED_START_UNIX, BED_END_UNIX,
  LOC_NURSE_UNIT_CD,  LOC_ROOM_CD, NURSE_UNIT_DISP, LOCATION_BED, BED_DISP, ROOM_DISP, ASSIGN_ID, BED_ASSIGN_ID, PATIENT_WEIGHT, 
  WEIGHT_UNIX, E, V, N, INO, AGE_DISPLAY, ANATOMY_DISPLAY, RSS, RST, RSS_UNIX, ECMO_FLOW_NORM, ECMO_VAD_SCORE, ECMO_UNIX,
  TEAM, CHIEF_COMPLAINT, NAME_FULL_FORMATTED, CONTACT_NUM, ASSIGN_TYPE, TEAM_ASSIGN_TYPE, START_UNIX, API_CACHE_CENSUS_PERSONNEL.END_UNIX, 
  TIME_TYPE, DRUG, API_CACHE_CENSUS_INFUSIONS.END_UNIX AS INFUSIONS_END_UNIX, INFUSION_RATE, INFUSION_RATE_UNITS, RXCUI
FROM API_CACHE_CENSUS 
LEFT JOIN API_CACHE_CENSUS_PERSONNEL USING (PERSONNEL_LIST_ID)
LEFT JOIN API_CACHE_CENSUS_INFUSIONS USING (INFUSIONS_LIST_ID)
WHERE DTUNIX = (SELECT DISTINCT(DTUNIX) FROM API_CACHE_CENSUS ORDER BY DTUNIX DESC FETCH FIRST 1 ROW ONLY)
  AND (API_CACHE_CENSUS_INFUSIONS.TIME_TYPE is null OR API_CACHE_CENSUS_INFUSIONS.TIME_TYPE= 8)
`;

const getCensusCacheData = database.withConnection(
    async (conn) => await conn.execute(GET_CENSUS_CACHE_SQL).then((ret) => ret.rows)
);

module.exports = {
  getCensusCacheData,
};
