/*
 * @Author: Peng Zeng
 * @Date: 2020-10-24 20:02:55
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-26 10:51:42
 */

const database = require("../../services/database");
const {
  DRUG_TO_CAT_DICT,
  MEDICATION_CATEGORY_STRUCTURE
} = require("../../db_relation/drug-category-relation");
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
  SUCTION_COMMENT,
  DEVICE,
  INSTILLATION,
  MEDICATION,
  OXYGENATION,
  SUCTION_TYPE
FROM API_CACHE_MED
WHERE PERSON_ID = :person_id
`;

// adding suction parts to MED_CAT_STRUCTURE_ARRAY 
const SQL_INFUSIONS_UNIT = `
SELECT
  DISTINCT DRUG,
  INFUSION_RATE_UNITS
FROM DRUG_INFUSIONS 
`;


const getMedCatStructure = infusionsUnit => {
  let unitDict = {};
  infusionsUnit.rows.forEach(element => {
    let cat = DRUG_TO_CAT_DICT[element.DRUG];
    if (!(cat in unitDict)) {
      unitDict[cat] = {};
    }
    unitDict[cat][element.DRUG] = element.INFUSION_RATE_UNITS;
  });
  
  let suctionCatStructure = {
    name: "SUCTION",
    children: [{ name: "suction" }, { name: "child2" }, { name: "child3" }]
  };
  let newCatStructure = [...MEDICATION_CATEGORY_STRUCTURE];
  newCatStructure.forEach(element => {
    if (element.name in unitDict) {
      element.children.forEach(item => {
        if (item.name in unitDict[element.name]) {
          item.unit = unitDict[element.name][item.name];
        }
      });
    }
  });
  
  let catStructureArray = [suctionCatStructure, ...newCatStructure];
  return catStructureArray;
};


async function getMedCacheSqlExecutor(conn, binds) {
  const arr = await conn.execute(GET_MED_CACHE_SQL, binds).then((ret) => ret.rows);
  const infusionsUnit = await conn.execute(SQL_INFUSIONS_UNIT);
  const cat_structure = getMedCatStructure(infusionsUnit);
  let result = { 
    cat_structure,
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
        comment: element.SUCTION_COMMENT,
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
