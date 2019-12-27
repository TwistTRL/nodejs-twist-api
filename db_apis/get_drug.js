/**
 * API FUNCTIONS FOR GETTING DRUG
 * 
 * PENG 
 * 12/27/19
 * 
 */

const database = require("../services/database");
const {DRUG_INFUSIONS_LIST,DRUG_INTERMITTENT_LIST} = require("../db_relation/drug-category-relation");


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
ORDER BY START_UNIX, DRUG`

const SQL_INTERMITTENT_PART2 = `) AND PERSON_ID = :person_id
ORDER BY DT_UNIX, DRUG`

async function getInfusionsSqlExecutor(conn,binds){
  console.time('getDrugInfusions');
  var SQL_Infusions = ``;

  DRUG_INFUSIONS_LIST.forEach(function(item) {
    SQL_Infusions += ` OR DRUG = '` + item + `'`; 
  });

  let SQL_ALL = SQL_INFUSIONS_PART1 + SQL_Infusions + SQL_INFUSIONS_PART2;
  console.log("SQL_ALL = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);    
  let jsonString = calculateInfusionsRecords(drugRecords);
  console.timeEnd('getDrugInfusions');
  return jsonString;
}

async function getIntermittentSqlExecutor(conn,binds){
  console.time('getDrugIntermittent');
  var SQL_Intermittent = ``;

  DRUG_INTERMITTENT_LIST.forEach(function(item) {
    SQL_Intermittent += ` OR DRUG = '` + item + `'`; 
  });

  let SQL_ALL = SQL_INTERMITTENT_PART1 + SQL_Intermittent + SQL_INTERMITTENT_PART2;
  console.log("SQL_ALL = " + SQL_ALL);

  let drugRecords = await conn.execute(SQL_ALL, binds);    
  let jsonString = calculateIntermittentRecords(drugRecords);
  console.timeEnd('getDrugIntermittent');
  return jsonString;
}


function calculateInfusionsRecords(drugRecords, timeString) {
  var result = [];
  
  // drugRecords = {"metadata":[], "rows":[]}
  var arr = drugRecords.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  for (let drugRecord of arr) {
    let singleResult = {};
    singleResult.start = drugRecord.START_UNIX;
    singleResult.end = drugRecord.END_UNIX;
    singleResult.name = drugRecord.DRUG;
    singleResult.dose = drugRecord.INFUSION_RATE;
    result.push(singleResult);
  }

  return result;
}



function calculateIntermittentRecords(drugRecords, timeString) {
  var result = [];
  
  // drugRecords = {"metadata":[], "rows":[]}
  var arr = drugRecords.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  for (let drugRecord of arr) {
    let singleResult = {};
    singleResult.start = drugRecord.DT_UNIX;
    singleResult.name = drugRecord.DRUG;
    singleResult.dose = drugRecord.ADMIN_DOSAGE;
    result.push(singleResult);
  }

  return result;
}

const getDrugInfusions = database.withConnection(getInfusionsSqlExecutor);
const getDrugIntermittent = database.withConnection(getIntermittentSqlExecutor);



/**
 * 

 
 */


module.exports = {
  getDrugInfusions,
  getDrugIntermittent
};