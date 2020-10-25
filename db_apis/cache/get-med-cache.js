/*
 * @Author: Peng Zeng
 * @Date: 2020-10-24 20:02:55
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-24 21:22:19
 */

const database = require("../../services/database");
const { MED_CAT_STRUCTURE_ARRAY } = require("../../db_relation/drug-category-relation");

const GET_MED_CACHE_SQL = `
SELECT
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
  SUCTION_TYPE
FROM API_CACHE_RSS
WHERE PERSON_ID = :person_id
`;

async function getMedCacheSqlExecutor(conn, binds) {
  const arr = await conn.execute(GET_MED_CACHE_SQL, binds).then((ret) => ret.rows);
  let result = { 
    cat_structure: MED_CAT_STRUCTURE_ARRAY
  };
  arr.forEach((element) => {
    if (!(element.MED_CATEGORY in result)) {
      result[element.MED_CATEGORY] = [];
    }
    let cur_record;
    if (element.MED_CATEGORY === "SUCTION") {
      cur_record = {
        name: "suction",
        time: element.SUCTION_TIME,
        start: element.START_TIME,
        lvl: element.LVL,
        comment: element.COMMENT,
        device: element.DEVICE,
        instillation: element.INSTILLATION,
        medication: element.MEDICATION,
        oxygenation: element.OXYGENATION,
        type: element.SUCTION_TYPE,
      };
    } else {
      cur_record = {
        name: element.MED_NAME,
        dose: element.DOSE,
        start: element.START_TIME,
        end: element.END_TIME || undefined,
        unit: element.UNIT,
        route: element.ROUTE,
        RXCUI: element.RXCUI,
        dosing_weight: element.DOSING_WEIGHT,
      }      
    }
    result[element.MED_CATEGORY].push(cur_record);
  });

  return result;
}

const getMedCache = database.withConnection(getMedCacheSqlExecutor);

module.exports = {
  getMedCache,
};
