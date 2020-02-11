/*
 * @Author: Peng
 * @Date: 2020-02-11 11:50:13
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-11 16:27:54
 */

const database = require("../services/database");
const {
  RXCUI_LIST,
  DRUG_LIST,
  CAT_LIST,
  RXCUI_BY_CAT_ORDER_DICT,
  RXCUI_TO_CAT_DICT,
  MEDICATION_CATEGORY_STRUCTURE
} = require("../db_relation/drug-category-relation");

const SQL_INFUSIONS_PART1 = `
SELECT 
  START_UNIX,
  END_UNIX,
  DRUG,
  RXCUI,
  INFUSION_RATE,
  INFUSION_RATE_UNITS
FROM DRUG_INFUSIONS
WHERE (1=0`;

const SQL_INFUSIONS_PART2 = `) AND PERSON_ID = :person_id
ORDER BY START_UNIX, DRUG`;

const SQL_INTERMITTENT_PART1 = `
SELECT 
  DT_UNIX,
  DRUG,
  RXCUI,
  ADMIN_DOSAGE,
  ADMIN_ROUTE,
  DOSAGE_UNITS
FROM DRUG_INTERMITTENT
WHERE (1=0`;

const SQL_INTERMITTENT_PART2 = `) AND PERSON_ID = :person_id
ORDER BY DT_UNIX, DRUG`;

async function getINFUSIONSSqlExecutor(conn, binds) {
  // var SQL_Infusions = ``;
  // DRUG_INFUSIONS_LIST.forEach(function(item) {
  //   SQL_Infusions += ` OR DRUG = '` + item + `'`;
  // });

  let SQL_Infusions = RXCUI_LIST.reduce((acc, item) => acc + ` OR RXCUI = '` + item + `'`, "");
  let SQL_ALL = SQL_INFUSIONS_PART1 + SQL_Infusions + SQL_INFUSIONS_PART2;
  console.log("SQL Get Drug Infusions = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);
  return drugRecords.rows;
}

async function getIntermittentSqlExecutor(conn, binds) {
  let SQL_Intermittent = RXCUI_LIST.reduce((acc, item) => acc + ` OR RXCUI = '` + item + `'`, "");
  let SQL_ALL = SQL_INTERMITTENT_PART1 + SQL_Intermittent + SQL_INTERMITTENT_PART2;
  console.log("SQL Get Drug Intermittent = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);
  return drugRecords.rows;
}

function _calculateRawRecords(rawRecords) {
  let { arr1, arr2 } = rawRecords;

  console.log("arr1.length :", arr1.length);
  console.log("arr2.length :", arr2.length);

  let result_dict = {"cat_structure": MEDICATION_CATEGORY_STRUCTURE};
  CAT_LIST.forEach(cat => {
    result_dict[cat] = [];
  });

  if (arr1.length > 0) {
    arr1.forEach(element => {
      let singleResult = {};
      singleResult.name = element.DRUG;
      singleResult.dose = element.INFUSION_RATE;
      singleResult.start = element.START_UNIX;
      singleResult.end = element.END_UNIX;
      singleResult.unit = element.INFUSION_RATE_UNITS;
      singleResult.RXCUI = element.RXCUI;
      let cats = RXCUI_TO_CAT_DICT[element.RXCUI];
      cats.forEach(cat => {
        result_dict[cat].push(singleResult);
      });
    });
  }

  if (arr2.length > 0) {
    arr2.forEach(element => {
      let singleResult = {};
      singleResult.name = element.DRUG;
      singleResult.dose = element.ADMIN_DOSAGE;
      singleResult.start = element.DT_UNIX;
      singleResult.unit = element.DOSAGE_UNITS;
      singleResult.route = element.ADMIN_ROUTE;
      singleResult.RXCUI = element.RXCUI;
      let cats = RXCUI_TO_CAT_DICT[element.RXCUI];
      cats.forEach(cat => {
        result_dict[cat].push(singleResult);
      });
    });
  }


  CAT_LIST.forEach(cat => {
    // remove empty cat
    if (result_dict[cat].length == 0) {
      delete result_dict[cat];
    } else {
      // order cat by RXCUI order in this cat
      result_dict[cat].sort(function(a, b) {
        return a.start - b.start;

        // return RXCUI_BY_CAT_ORDER_DICT[cat].indexOf(a.RXCUI) - RXCUI_BY_CAT_ORDER_DICT[cat].indexOf(b.RXCUI);
      });
    }
  });

  return result_dict;
}

async function parallelQuery(conn, binds) {
  // should parallel do the sql query
  const task1 = await getINFUSIONSSqlExecutor(conn, binds);
  const task2 = await getIntermittentSqlExecutor(conn, binds);
  return {
    arr1: task1,
    arr2: task2
  };
}

const getMed = database.withConnection(async function(conn, binds) {
  let rawResult = await parallelQuery(conn, binds);
  let result = _calculateRawRecords(rawResult);
  return result;
});

/**
 * 

 getOrangeDrug = get paralytics drug for person
 
 */

module.exports = {
  getMed
};
