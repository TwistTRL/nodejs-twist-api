/**
 * TEST DRUG OVERLAP
 * 
 * PENG 
 * 12/30/19
 * 
 */

const database = require("../services/database");
const {
  DRUG_INFUSIONS_LIST,
  DRUG_INTERMITTENT_LIST
} = require("../db_relation/drug-category-relation");


const SQL_INFUSIONS_PART1 = `
SELECT 
  START_UNIX,
  END_UNIX,
  DRUG,
  INFUSION_RATE
FROM DRUG_INFUSIONS
WHERE (1=0`

const SQL_INTERMITTENT_PART1 = `
SELECT 
  DT_UNIX,
  DRUG,
  ADMIN_DOSAGE
FROM DRUG_INTERMITTENT
WHERE (1=0`

const SQL_INFUSIONS_PART2 = `) AND PERSON_ID = :person_id
ORDER BY DRUG, START_UNIX`

const SQL_INTERMITTENT_PART2 = `) AND PERSON_ID = :person_id
ORDER BY DT_UNIX, DRUG`

async function getInfusionsSqlExecutor(conn, binds) {
  console.time('getDrugInfusions');
  var SQL_Infusions = ``;

  DRUG_INFUSIONS_LIST.forEach(function (item) {
    SQL_Infusions += ` OR DRUG = '` + item + `'`;
  });

  let SQL_ALL = SQL_INFUSIONS_PART1 + SQL_Infusions + SQL_INFUSIONS_PART2;
  console.log("SQL_ALL = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);
  let jsonString = calculateInfusionsRecords(drugRecords);
  console.timeEnd('getDrugInfusions');
  return jsonString;
}

async function getIntermittentSqlExecutor(conn, binds) {
  console.time('getDrugIntermittent');
  var SQL_Intermittent = ``;

  DRUG_INTERMITTENT_LIST.forEach(function (item) {
    SQL_Intermittent += ` OR DRUG = '` + item + `'`;
  });

  let SQL_ALL = SQL_INTERMITTENT_PART1 + SQL_Intermittent + SQL_INTERMITTENT_PART2;
  console.log("SQL_ALL = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);
  let jsonString = calculateIntermittentRecords(drugRecords);
  console.timeEnd('getDrugIntermittent');
  return jsonString;
}


function calculateInfusionsRecords(drugRecords) {
  var result = [];

  // drugRecords = {"metadata":[], "rows":[]}
  var arr = drugRecords.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  // var currentDrug = arr[0].DRUG.toLowerCase();
  var currentDrug = "";
  var currentEndtime = 0;
  var realOverlapCount = 0;
  var closeCount = 0;

  for (let drugRecord of arr) {

    if (drugRecord.DRUG.toLowerCase() != currentDrug) {
      currentDrug = drugRecord.DRUG.toLowerCase();

      let dividor = "~ DRUG: " + drugRecord.DRUG.toLowerCase();
      result.push(dividor);
      continue;
    }

    if (drugRecord.START_UNIX < currentEndtime || drugRecord.START_UNIX - currentEndtime <= 2) {


      if (drugRecord.START_UNIX < currentEndtime) {
        realOverlapCount ++;
        result.push("~~~~ overlap ~~~~")
      } else {
        closeCount ++;
      }
      let singleResult = {};
      singleResult.name = drugRecord.DRUG.toLowerCase();
      singleResult.dose = drugRecord.INFUSION_RATE;
      singleResult.start = drugRecord.START_UNIX;
      singleResult.end = drugRecord.END_UNIX;
      result.push(singleResult);
    }

    currentEndtime = drugRecord.END_UNIX;
  }
  result.push("overlap count : " + realOverlapCount);
  result.push("close end-start time count : " + closeCount);

  return result;
}



function calculateIntermittentRecords(drugRecords) {
  var result = [];

  // drugRecords = {"metadata":[], "rows":[]}
  var arr = drugRecords.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  for (let drugRecord of arr) {
    let singleResult = {};
    singleResult.name = drugRecord.DRUG.toLowerCase();
    singleResult.dose = drugRecord.ADMIN_DOSAGE;
    singleResult.start = drugRecord.DT_UNIX;
    result.push(singleResult);
  }

  return result;
}

const testDrugInfusions = database.withConnection(getInfusionsSqlExecutor);
const getDrugIntermittent = database.withConnection(getIntermittentSqlExecutor);



/**
 * 

 
 */


module.exports = {
  testDrugInfusions,
  getDrugIntermittent
};