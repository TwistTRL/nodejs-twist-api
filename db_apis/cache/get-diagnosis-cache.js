/*
 * @Author: Peng Zeng
 * @Date: 2020-09-20 19:20:03
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-25 07:31:15
 */

const database = require("../../services/database");

const GET_DIAGNOSIS_CACHE_SQL = `
SELECT
  AGE_DISPLAY,
  SEX_DISPLAY,
  HETEROTAXY_DISPLAY,
  SDD_DISPLAY,
  DISEASE_DISPLAY,
  EVENT_ID, 
  DT_UNIX, 
  DIAGNOSES, 
  OPERATIVE_DISPLAY
FROM API_CACHE_DIAGNOSIS
WHERE PERSON_ID = :person_id
`;

const getDiagnosisCache =  database.withConnection(async (conn,binds) => {
  const arr = await conn.execute(GET_DIAGNOSIS_CACHE_SQL, binds).then( ret=>ret.rows );  
  return arr;
});


module.exports = {
  getDiagnosisCache,
};
