#!/usr/bin/env node

/**
 * API FUNCTIONS FOR GETTING LABS
 * 
 * PENG 
 * 12/3/19
 * 
 */

const database = require("../services/database");
const {getCategory, categoryDictionary} = require("../config/labs-category-config");

const GET_LABS_BY_PERSONID_SQL = `
SELECT *
FROM LABS
WHERE PERSON_ID = :person_id
`

async function getLabSqlExecutor(conn,binds){
  let lab = await conn.execute(GET_LABS_BY_PERSONID_SQL,binds);

  // lab = {"metadata":[], "rows":[]}
  var arr = lab["rows"];
  var cgDictionary = categoryDictionary;
  console.log("lab size of current person", arr.length);
  console.log("cgDictionary", cgDictionary);
  for (let labRecord of arr) {
    // SINGLE_LABREPORT labRecord = {"PERSON_ID":...,"ORDER_ID":...,"DT_UTC":...,"EVENT_CD":...,"LAB":"...",...}
    let categoryString = getCategory(labRecord.LAB);
    if (categoryString !== null) {
      cgDictionary[categoryString].push(labRecord)      
    }
  }
  return cgDictionary;
}

const getLab = database.withConnection(getLabSqlExecutor);


/**
 * getLab:
 * 
 * {
 *  "Albumin":[{SINGLE_LABREPORT},...],
 *  "Alk Phos":[{SINGLE_LABREPORT},...],
 *  "TnT":[{SINGLE_LABREPORT},...]
 *  ...
 * }
 *  
 *  */ 

module.exports = {
  getLab
};