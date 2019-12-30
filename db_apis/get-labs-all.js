#!/usr/bin/env node

/**
 * API FUNCTIONS FOR GETTING LABS BY POST JSON
 * 
 * PENG 
 * 12/10/19
 * 
 */

const database = require("../services/database");
const {categoryList, getCategory, categoryDictionary, getSingleTimeRecord,getLabNameFromLabCat} = require("../db_relation/labs-category-config");
const isValidJson = require("../utils/isJson");
const {ResourceNotFoundError,InputInvalidError} = require("../utils/errors");  

const catPersonId = "person_id";
const catLabNames = "lab_names";



const GET_LABS_BY_PERSONID_SQL_1 = `
SELECT
 DT_UNIX,
 VALUE,
 LAB
FROM LABS
WHERE PERSON_ID = `

const GET_LABS_BY_PERSONID_SQL_2 = ` AND `
const GET_LABS_BY_PERSONID_SQL_3 = `
ORDER BY DT_UNIX, VALUE
`

async function getLabSqlExecutor(conn,query){
  console.time('label');

  let person_id = query[catPersonId];
  let requestLabs = query[catLabNames];
  console.log("requestLabs = ", requestLabs);

  if (requestLabs == null || requestLabs.length == 0) {
    throw new InputInvalidError('Input array lab_names is empty or not valid');

  }

  let LAB_SQL = getLabNameByLabCatList(requestLabs);
  let SQL_STRING = GET_LABS_BY_PERSONID_SQL_1 + person_id + GET_LABS_BY_PERSONID_SQL_2 + LAB_SQL + GET_LABS_BY_PERSONID_SQL_3;
  console.log("sql string = ", SQL_STRING);


  let lab = await conn.execute(SQL_STRING);
  // lab = {"metadata":[], "rows":[]}
  var arr = lab["rows"];
  var cgDictionary = {};
  requestLabs.forEach(function(item) {
    cgDictionary[item] = [];
  });

  console.log("result size of current person: ", arr.length);
  console.log("cgDictionary", cgDictionary);
  for (let labRecord of arr) {
    // SINGLE_LABREPORT labRecord = {"PERSON_ID":...,"ORDER_ID":...,"DT_UTC":...,"EVENT_CD":...,"LAB":"...",...}
    let categoryString = getCategory(labRecord.LAB);
    if (categoryString !== null && requestLabs.includes(categoryString)) {
      // only need "DT_UNIX" and "VALUE" in the labRecord
      cgDictionary[categoryString].push({"DT_UNIX": labRecord.DT_UNIX, "VALUE": labRecord.VALUE*1})      
    }
  }
  console.timeEnd('label');

  return cgDictionary;
}

function getLabNameByLabCatList(requestLabs) {
  let _LAB_SQL = ` (1=0`;
  requestLabs.forEach(function(item){
    console.log("requestLabs.item", item);
    let currentLabArray = getLabNameFromLabCat(item);
    console.log("currentLabArray", currentLabArray);
    if (currentLabArray == null) {
      throw new InputInvalidError('Invalid lab_names: ' + item + ". All lab_names: 'Albumin', 'Alk Phos', 'BNP', 'HCO3', 'BUN', 'Cr', 'D-dimer', 'Lactate', 'SvO2', 'SaO2', 'PaCO2', 'pH', 'PaO2', 'TnI', 'TnT'.");
    }

    currentLabArray.forEach(function(item){

      _LAB_SQL += ` OR LAB = '` + item + `'`;
  
    });
  });
  return _LAB_SQL + `)`;
}

const getLabsQuery = database.withConnection(async function(conn,query){
  console.log("query = ", query);

  if(Object.entries(query).length === 0 && query.constructor === Object) {
    console.error("query empty");
    throw new InputInvalidError('Input not valid, so query is empty.');
  }

  if (!isValidJson.validate_labs(query)) {
    console.warn("not json");
    throw new InputInvalidError('Input not in valid json');
    const query = req.body;

  }

  return await getLabSqlExecutor(conn,query);

});

/**
 *  
 * getLab:
 * 
 * {
 *  "Albumin":[
 *    {
        "DT_UNIX": NUMBER
        "VALUE": VARCHAR2
      },,...
    ],
 *  "Alk Phos":[
 *    {
        "DT_UNIX": NUMBER
        "VALUE": VARCHAR2
      },,...
    ],
 *  "TnT":[
 *    {
        "DT_UNIX": NUMBER
        "VALUE": VARCHAR2
      },,...
    ],
 *  ...
 * }
 *   
 * 
 *  */ 

module.exports = {
  getLabsQuery
};