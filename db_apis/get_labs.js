#!/usr/bin/env node

/**
 * API FUNCTIONS FOR GETTING LABS
 * 
 * PENG 
 * 12/3/19
 * 
 */

const database = require("../services/database");
const {getCategory, categoryDictionary, getSingleTimeRecord} = require("../config/labs-category-config");

const GET_LABS_BY_PERSONID_SQL = `
SELECT *
FROM LABS
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX
`

async function getLabSqlExecutor(conn,binds){
  console.time('label');

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
      // only need "DT_UNIX" and "VALUE" in the labRecord
      cgDictionary[categoryString].push({"DT_UNIX": labRecord.DT_UNIX, "VALUE": labRecord.VALUE})      
      //cgDictionary[categoryString].push(labRecord)

    }
  }
  console.timeEnd('label');

  return cgDictionary;
}

async function getLabSqlExecutorV2(conn,binds){
  console.time('label');

  let lab = await conn.execute(GET_LABS_BY_PERSONID_SQL,binds);
  var cgArrayV2 = [];

  // lab = {"metadata":[], "rows":[]}
  var arr = lab["rows"];
  console.log("lab size of current person", arr.length);

  if (arr.length < 1) {
    return null;
  }

  var currentTime = 0;
  for (let labRecord of arr) {
    // SINGLE_LABREPORT labRecord = {"PERSON_ID":...,"ORDER_ID":...,"DT_UTC":...,"EVENT_CD":...,"LAB":"...",...}
    let categoryString = getCategory(labRecord.LAB);
    if (categoryString !== null) {
      // Since we only need "DT_UNIX" and "VALUE" in the labRecord
      // an example for singleSimpleRecord:
      // {
      //   "time": 1524725340,
      //   "SvO2": "69",
      //   "Lactate": "4.5"
      // }
      var singleSimpleRecord;

      // time was sorted when sql query done.
      // for a currentTime same with last record, add all categoryString to this singleSimpleRecord
      // for a new currentTime, create a new dictionary with timestamp

      if (currentTime != labRecord.DT_UNIX) {

        if (currentTime != 0) {
          cgArrayV2.push(singleSimpleRecord);
        } else {
          console.log("start pushing into array...");
        }
        currentTime = labRecord.DT_UNIX;
        singleSimpleRecord = getSingleTimeRecord(currentTime);
      }

      singleSimpleRecord[categoryString] = labRecord.VALUE;
    }
  }
  // last item
  if (cgArrayV2[cgArrayV2.length - 1] != singleSimpleRecord) {
    cgArrayV2.push(singleSimpleRecord);
  }
  console.timeEnd('label');

  return cgArrayV2;
}

const getLab = database.withConnection(getLabSqlExecutor);
const getLabV2 = database.withConnection(getLabSqlExecutorV2);


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
 * 
 * getLabV2:
 * 
 * [  
 *    {
        "time": NUMBER,
        "SvO2": VARCHAR2,
        ...
      },
      {
        "time": 1524732420,
        "Lactate": VARCHAR2,
        ...
      },
      ...
 * ]
 * 
 *  
 * 
 *  */ 

module.exports = {
  getLab,
  getLabV2
};