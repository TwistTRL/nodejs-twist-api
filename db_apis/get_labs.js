#!/usr/bin/env node

/**
 * API FUNCTIONS FOR GETTING LABS
 *
 * PENG
 * 12/3/19
 *
 */

const database = require('../services/database');
const {categoryList, getCategory, categoryDictionary, getSingleTimeRecord, getLabNameFromLabCat} = require('../db_relation/labs-category-config');

const GET_LABS_BY_PERSONID_SQL = `
SELECT 
  LAB,
  DT_UNIX,
  VALUE
FROM LABS
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX, VALUE
`;


async function getLabSqlExecutor(conn, binds) {
  console.time('label');

  const lab = await conn.execute(GET_LABS_BY_PERSONID_SQL, binds);
  // lab = {"metadata":[], "rows":[]}
  let arr = lab['rows'];
  console.log('lab size of current person', arr.length);
  // console.log('cgDictionary', cgDictionary);

  console.timeEnd('label');
  result = getResult(arr);

  return result;
  // return cgDictionary;
}

function getResult(arr) {
  let cgDictionary = {};
  for (let c of categoryList) {
    cgDictionary[c] = [];
  }
  for (let labRecord of arr) {
    // SINGLE_LABREPORT labRecord = {"PERSON_ID":...,"ORDER_ID":...,"DT_UTC":...,"EVENT_CD":...,"LAB":"...",...}
    let categoryString = getCategory(labRecord.LAB);
    if (categoryString !== null) {
      // only need "DT_UNIX" and "VALUE" in the labRecord
      cgDictionary[categoryString].push({'DT_UNIX': labRecord.DT_UNIX, 'VALUE': labRecord.VALUE*1});
      // cgDictionary[categoryString].push(labRecord)
    }
  }
  return cgDictionary;
}

async function getLabSqlExecutorV2(conn, binds) {
  console.time('label');

  const lab = await conn.execute(GET_LABS_BY_PERSONID_SQL, binds);
  let cgArrayV2 = [];

  // lab = {"metadata":[], "rows":[]}
  let arr = lab['rows'];
  console.log('lab size of current person', arr.length);

  if (arr.length < 1) {
    return null;
  }

  let currentTime = 0;
  for (const labRecord of arr) {
    // SINGLE_LABREPORT labRecord = {"PERSON_ID":...,"ORDER_ID":...,"DT_UTC":...,"EVENT_CD":...,"LAB":"...",...}
    const categoryString = getCategory(labRecord.LAB);
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
          console.log('start pushing into array...');
        }
        currentTime = labRecord.DT_UNIX;
        singleSimpleRecord = getSingleTimeRecord(currentTime);
      }

      singleSimpleRecord[categoryString] = labRecord.VALUE*1;
    }
  }
  // last item
  if (cgArrayV2[cgArrayV2.length - 1] != singleSimpleRecord) {
    cgArrayV2.push(singleSimpleRecord);
  }
  console.timeEnd('label');


  let result = {};
  result.keys = categoryList;
  result.data = cgArrayV2;

  return result;
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
 * {
 * "keys": [
    "Albumin",
    "Alk Phos",
    "BNP",
    "HCO3",
    "BUN",
    "Cr",
    "D-dimer",
    "Lactate",
    "SvO2",
    "SaO2",
    "PaCO2",
    "pH",
    "PaO2",
    "TnI",
    "TnT"
  ],
 *
 *
 * "data":
 * [
 *    {
        "time": NUMBER,
        "SvO2": NUMBER,
        ...
      },
      {
        "time": 1524732420,
        "Lactate": NUMBER,
        ...
      },
      ...
 * ]
 * }
 *
 *
 *  */

module.exports = {
  getLab,
  getLabV2
};
