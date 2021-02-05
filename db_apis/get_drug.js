/**
 * API FUNCTIONS FOR GETTING DRUG
 * 
 * getOrangeDrug = get paralytics drug
 * 
 * PENG 
 * 12/27/19
 * 
 */

const database = require("../services/database");
const {DRUG_INFUSIONS_LIST,DRUG_INTERMITTENT_LIST,ORANGE_DRUG_LIST} = require("../db_relation/drug-category-relation");


const SQL_INFUSIONS_PART1 = `
SELECT 
  START_UNIX,
  END_UNIX,
  DRUG,
  INFUSION_RATE,
  INFUSION_RATE_UNITS
FROM DRUG_INFUSIONS
WHERE (1=0`

const SQL_INFUSIONS_PART2 = `) AND PERSON_ID = :person_id
ORDER BY START_UNIX, DRUG`


const SQL_ORANGE_INFUSIONS_PART1 = `
SELECT 
  START_UNIX,
  END_UNIX,
  DRUG
FROM DRUG_INFUSIONS
WHERE (1=0`

const SQL_ORANGE_INFUSIONS_PART2 = `) AND PERSON_ID = :person_id
ORDER BY START_UNIX, DRUG`



const SQL_INTERMITTENT_PART1 = `
SELECT 
  DT_UNIX,
  DRUG,
  ADMIN_DOSAGE,
  ADMIN_ROUTE,
  DOSAGE_UNITS
FROM DRUG_INTERMITTENT
WHERE (1=0`

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

async function getOrangeDrugSqlExecutor(conn,binds){
  console.time('getOrangeDrug');
  var SQL_Orange_Infusions = ``;

  ORANGE_DRUG_LIST.forEach(function(item) {
    SQL_Orange_Infusions += ` OR DRUG = '` + item + `'`; 
  });

  let SQL_ORANGE = SQL_ORANGE_INFUSIONS_PART1 + SQL_Orange_Infusions + SQL_ORANGE_INFUSIONS_PART2;
  console.log("SQL_ORANGE = " + SQL_ORANGE);

  let drugRecords = await conn.execute(SQL_ORANGE, binds);    
  let jsonString = calculateOrangeDrugRecords(drugRecords);
  console.timeEnd('getOrangeDrug');
  return jsonString;
}

async function getParalyticsDrugByTimeSqlExecutor(conn,binds){
  console.time('getParalyticsDrugByTime');
  let SQL_Orange_Infusions = ``;

  ORANGE_DRUG_LIST.forEach(function(item) {
    SQL_Orange_Infusions += ` OR DRUG = '` + item + `'`; 
  });

  let SQL_ORANGE = SQL_ORANGE_INFUSIONS_PART1 + SQL_Orange_Infusions + `) AND PERSON_ID = :person_id
    AND END_UNIX > :end_unix
  ORDER BY START_UNIX, DRUG`;

  console.log('SQL_ORANGE :>> ', SQL_ORANGE);

  let drugRecords = await conn.execute(SQL_ORANGE, binds);    
  let jsonString = calculateOrangeDrugRecords(drugRecords);
  console.timeEnd('getParalyticsDrugByTime');
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


function calculateInfusionsRecords(drugRecords) {
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
    singleResult.dose = drugRecord.INFUSION_RATE;
    singleResult.start = drugRecord.START_UNIX;
    singleResult.end = drugRecord.END_UNIX;
    singleResult.unit = drugRecord.INFUSION_RATE_UNITS;
    result.push(singleResult);
  }

  return result;
}

function calculateOrangeDrugRecords(drugRecords) {
  var result = [];
  
  // drugRecords = {"metadata":[], "rows":[]}
  var arr = drugRecords.rows;
  console.log("record size :", arr.length);

  if (arr.length < 1) {
    return [];
  }

  var start = 0;
  var end = 0;
  for (let drugRecord of arr) {
    if (start == 0) {
      start = drugRecord.START_UNIX;
      end = drugRecord.END_UNIX;
    } else {
      if (end + 1 >= drugRecord.START_UNIX) {
        // combine
        end = Math.max(end, drugRecord.END_UNIX);
      } else {
        // seperated
        result.push({"start" : start, "end" : end});
        start = drugRecord.START_UNIX;
        end = drugRecord.END_UNIX;
      } 
    }
  }  
  // last one
  result.push({"start" : start, "end" : end});
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
    singleResult.unit = drugRecord.DOSAGE_UNITS;
    singleResult.route = drugRecord.ADMIN_ROUTE;
    result.push(singleResult);
  }

  return result;
}

const getDrugInfusions = database.withConnection(getInfusionsSqlExecutor);
const getDrugIntermittent = database.withConnection(getIntermittentSqlExecutor);
const getOrangeDrug = database.withConnection(getOrangeDrugSqlExecutor);
const getParalyticsDrugByTime = database.withConnection(getParalyticsDrugByTimeSqlExecutor);


/**
 * 

 getOrangeDrug = get paralytics drug for person
 
 */


module.exports = {
  getDrugInfusions,
  getOrangeDrug,
  getDrugIntermittent,
  getParalyticsDrugByTime,
};