/*
 * @Author: Peng Zeng
 * @Date: 2020-05-04 17:16:28
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-18 17:33:04
 */

const database = require("../services/database");
const { CATALOG_CD_DICT } = require("../db_relation/radiology-db-relation");
const { RADIOLOGY_TOKEN } = require("../config/token");
var timeLable = 0;

const SQL_GET_RADIOLOGY = (person_id) => `
SELECT 
    ORDER_ID,
    CATALOG_CD,
    DISPLAY,
    RAD_PACS_ID,
    REASON_FOR_EXAM,
    ORDER_PHYSICIAN_ID,    
    COMPLETE_DT_TM_UNIX    
FROM RADIOLOGY
WHERE PERSON_ID = ${person_id}
ORDER BY COMPLETE_DT_TM_UNIX
`;

async function radiologyQuerySQLExecutor(conn, person_id) {
  let timestampLable = timeLable++;
  console.log("~~SQL for get radiology: ", SQL_GET_RADIOLOGY(person_id));
  console.time("getRadiology-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_RADIOLOGY(person_id));
  console.timeEnd("getRadiology-sql" + timestampLable);
  if (rawRecord && rawRecord.rows) {
    console.log('radiology image records length :>> ', rawRecord.rows.length);
    return rawRecord.rows.map((row) => {
      if (!CATALOG_CD_DICT[row.CATALOG_CD]) {
        console.log('CATALOG_CD_DICT[row.CATALOG_CD] null:>> ', row.CATALOG_CD);
      }
      let location = CATALOG_CD_DICT[row.CATALOG_CD] ? CATALOG_CD_DICT[row.CATALOG_CD].location : null;
      let study_type = CATALOG_CD_DICT[row.CATALOG_CD] ? CATALOG_CD_DICT[row.CATALOG_CD].study_type : null;
      let order_id = row.ORDER_ID;
      let catalog_cd = row.CATALOG_CD;
      let display = row.DISPLAY;
      let accession_number = row.RAD_PACS_ID;
      let reason_for_exam = row.REASON_FOR_EXAM;
      let order_physician_id = row.ORDER_PHYSICIAN_ID;
      let dt_unix = row.COMPLETE_DT_TM_UNIX;
      let token = RADIOLOGY_TOKEN;
      return {
        order_id,
        catalog_cd,
        display,
        accession_number,
        reason_for_exam,
        order_physician_id,
        dt_unix,
        location,
        study_type,
        token,
      };
    });
  }
  console.log("no radiology results");
  return [];
}

const getRadiology = database.withConnection(radiologyQuerySQLExecutor);

module.exports = {
  getRadiology,
};
