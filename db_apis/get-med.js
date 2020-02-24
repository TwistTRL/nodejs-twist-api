/*
 * @Author: Peng
 * @Date: 2020-02-11 11:50:13
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-24 15:48:16
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

const SQL_SUCTION_PART1 = `
SELECT
EVENT_START_DT_TM,
LVL,
"COMMENT",
"Suction Device",
"Suction Instillation",
"Suction Pre-Medication",
"Suction Pre-Oxygenation",
"Suction Type",
"Trach Suction Catheter Size",
"Trach Suction Depth"
FROM SUCTION
WHERE PERSON_ID = :person_id
ORDER BY EVENT_START_DT_TM`;

async function getSuctionSqlExecutor(conn, binds) {
  let SQL_SUCTION = SQL_SUCTION_PART1;
  console.log("SQL Get Suction = " + SQL_SUCTION);
  let suctionRecords = await conn.execute(SQL_SUCTION, binds);
  return suctionRecords.rows;
}

async function getINFUSIONSSqlExecutor(conn, binds) {
  // var SQL_Infusions = ``;
  // DRUG_INFUSIONS_LIST.forEach(function(item) {
  //   SQL_Infusions += ` OR DRUG = '` + item + `'`;
  // });

  let SQL_Infusions = RXCUI_LIST.reduce(
    (acc, item) => acc + ` OR RXCUI = '` + item + `'`,
    ""
  );
  let SQL_ALL = SQL_INFUSIONS_PART1 + SQL_Infusions + SQL_INFUSIONS_PART2;
  console.log("SQL Get Drug Infusions = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);
  return drugRecords.rows;
}

async function getIntermittentSqlExecutor(conn, binds) {
  let SQL_Intermittent = RXCUI_LIST.reduce(
    (acc, item) => acc + ` OR RXCUI = '` + item + `'`,
    ""
  );
  let SQL_ALL =
    SQL_INTERMITTENT_PART1 + SQL_Intermittent + SQL_INTERMITTENT_PART2;
  console.log("SQL Get Drug Intermittent = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);
  return drugRecords.rows;
}

function _calculateRawRecords(rawRecords) {
  let { arr1, arr2, arr3 } = rawRecords;

  console.log("infusions length :", arr1.length);
  console.log("intermittent length :", arr2.length);
  console.log("suction length :", arr3.length);

  let suctionArray = [];
  if (arr3.length > 0) {
    arr3.forEach(element => {
      let singleResult = {};
      singleResult.time =
        new Date(element["EVENT_START_DT_TM"]).getTime() / 1000;
      singleResult.lvl = element.LVL;
      singleResult.comment = element.COMMENT;
      singleResult.device = element["Suction Device"];
      singleResult.instillation = element["Suction Instillation"];
      singleResult.medication = element["Suction Pre-Medication"];
      singleResult.oxygenation = element["Suction Pre-Oxygenation"];
      singleResult.type = element["Suction Type"];
      suctionArray.push(singleResult);
    });
  }

  let suctionCatStructure = {
    name: "SUCTION",
    children: [{ name: "suction" }, { name: "child2" }, { name: "child3" }]
  };
  let catStructureArray = [suctionCatStructure, ...MEDICATION_CATEGORY_STRUCTURE];
  let result_dict = {
    cat_structure: catStructureArray,
    suction: suctionArray
  };
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
  const task3 = await getSuctionSqlExecutor(conn, binds);
  return {
    arr1: task1,
    arr2: task2,
    arr3: task3
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
