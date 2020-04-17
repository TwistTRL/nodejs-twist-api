/*
 * @Author: Peng
 * @Date: 2020-02-11 11:50:13
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-17 11:02:39
 */

const database = require("../services/database");
const {
  RXCUI_LIST,
  DRUG_LIST,
  CAT_LIST,
  RXCUI_BY_CAT_ORDER_DICT,
  RXCUI_TO_CAT_DICT,
  DRUG_TO_CAT_DICT,
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
  DATETIMEUTC,
  LVL,
  COMMENT_TXT,
  SUCTION_DEVICE,
  SUCTION_INSTILLATION,
  SUCTION_PRE_MEDICATION,
  SUCTION_PRE_OXYGENATION,
  SUCTION_TYPE,
  TRACH_SUCTION_CATHETER_SIZE,
  TRACH_SUCTION_DEPTH
FROM SUCTION
WHERE PERSON_ID = :person_id
ORDER BY DATETIMEUTC`;

const SQL_INFUSIONS_UNIT = `
SELECT
  DISTINCT DRUG,
  INFUSION_RATE_UNITS
FROM DRUG_INFUSIONS
WHERE PERSON_ID = :person_id
ORDER BY DRUG`;

async function getInfusionsUnitSqlExecutor(conn, binds) {
  console.log("~~SQL Get Infusions Unit = " + SQL_INFUSIONS_UNIT);
  let infusionsUnitRecords = await conn.execute(SQL_INFUSIONS_UNIT, binds);
  return infusionsUnitRecords.rows;
}

async function getSuctionSqlExecutor(conn, binds) {
  let SQL_SUCTION = SQL_SUCTION_PART1;
  console.log("~~SQL Get Suction = " + SQL_SUCTION);
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
  console.log("~~SQL Get Drug Infusions (part) = " + SQL_INFUSIONS_PART1);

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
  console.log("~~SQL Get Drug Intermittent (part) = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);
  return drugRecords.rows;
}

function _calculateRawRecords(rawRecords) {
  let { arr1, arr2, arr3, arr4 } = rawRecords;

  console.log("infusions length :", arr1.length);
  console.log("intermittent length :", arr2.length);
  console.log("suction length :", arr3.length);
  console.log("infusions units length :", arr4.length);

  let suctionArray = [];
  if (arr3.length > 0) {
    arr3.forEach(element => {
      let singleResult = {};
      singleResult.name = "suction";
      singleResult.time =
        new Date(element["DATETIMEUTC"]).getTime() / 1000;
      singleResult.start =
        new Date(element["DATETIMEUTC"]).getTime() / 1000;
      singleResult.lvl = element.LVL;
      singleResult.comment = element["COMMENT_TXT"];
      singleResult.device = element["SUCTION_DEVICE"];
      singleResult.instillation = element["SUCTION_INSTILLATION"];
      singleResult.medication = element["SUCTION_PRE_MEDICATION"];
      singleResult.oxygenation = element["SUCTION_PRE_OXYGENATION"];
      singleResult.type = element["SUCTION_TYPE"];
      suctionArray.push(singleResult);
    });
  }

  let suctionCatStructure = {
    name: "SUCTION",
    children: [{ name: "suction" }, { name: "child2" }, { name: "child3" }]
  };

  // console.log("arr4 :", arr4);
  // arr4: [ { DRUG: 'DOPamine', INFUSION_RATE_UNITS: 'mcg/kg/min' },
  // { DRUG: 'EPINEPHrine', INFUSION_RATE_UNITS: 'mcg/kg/min' },...]

  let unitDict = {};
  arr4.forEach(element => {
    let cat = DRUG_TO_CAT_DICT[element.DRUG];
    if (!(cat in unitDict)) {
      unitDict[cat] = {};
    }
    unitDict[cat][element.DRUG] = element.INFUSION_RATE_UNITS;
  });

  // console.log('newCatStructure :', newCatStructure);
  // unitDict : { CV:
  //   { DOPamine: 'mcg/kg/min',
  //     alprostadil: 'mcg/kg/min',
  //     esmolol: 'mcg/kg/min',
  //     fenoldopam: 'mcg/kg/min',
  //     milrinone: 'mcg/kg/min',
  //     niCARdipine: 'mcg/kg/min',
  //     nitroprusside: 'mcg/kg/min',
  //     norepinephrine: 'mcg/kg/min' },
  //  RESP: { EPINEPHrine: 'mcg/kg/min' },...}

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
  let result_dict = {
    cat_structure: catStructureArray,
    SUCTION: suctionArray
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
  const task4 = await getInfusionsUnitSqlExecutor(conn, binds);
  return {
    arr1: task1,
    arr2: task2,
    arr3: task3,
    arr4: task4
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
