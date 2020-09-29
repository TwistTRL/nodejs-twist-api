/*
 * @Author: Peng Zeng
 * @Date: 2020-09-10 17:00:02
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-18 08:24:27
 */

const database = require("../../services/database");
const {
  LABS_EVENT_CD_DICT,
  WORKING_LABS_XLSX_PATH,
} = require("../../db_relation/labs-db-relation");

const GET_LABS_BY_PERSONID_SQL = `
SELECT 
  DT_UNIX,
  ORDER_ID,
  EVENT_CD,
  LAB,
  VALUE,
  UNITS,
  NORMAL_LOW,
  NORMAL_HIGH,
  CRITICAL_LOW,
  CRITICAL_HIGH,
  CODE_VALUE.DISPLAY AS DISPLAY_NAME
FROM LABS
JOIN CODE_VALUE
  ON LABS.EVENT_CD = CODE_VALUE.CODE_VALUE
WHERE PERSON_ID = :person_id
ORDER BY DT_UNIX
`;

async function getLabSqlExecutor(conn, binds) {
  const lab = await conn.execute(GET_LABS_BY_PERSONID_SQL, binds);
  let arr = lab.rows;
  console.log("lab size of current person", arr.length);
  let resultArr = arr.map((x) => {
    return { ...x, ...LABS_EVENT_CD_DICT[x.EVENT_CD] };
  });

  return resultArr;
}

// TABLE DISPLAY_ORDER TWIST_DISPLAY_NAME EVENT_CD EVENT_CD_DESCRIPTION SOURCE NOTE

async function getLabDictSqlExecutor(conn, binds) {
  const labArray = await getLabSqlExecutor(conn, binds);
  let resultDict = {};
  labArray.forEach((element) => {

    // LAB should be DISPLAY_NAME the same
    if (element.LAB !== element.DISPLAY_NAME) {
      console.log('element :>> ', element);
    }

    if (!(element.TABLE in resultDict)) {
      resultDict[element.TABLE] = {};
    }

    if (!(element.TWIST_DISPLAY_NAME in resultDict[element.TABLE])) {
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME] = {}
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME].DISPLAY_ORDER = element.DISPLAY_ORDER;   
    }

    if (!(element.LAB in resultDict[element.TABLE][element.TWIST_DISPLAY_NAME])) {
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB] = {}
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB].DISPLAY_NAME = element.DISPLAY_NAME
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB].NORMAL_LOW = element.NORMAL_LOW
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB].NORMAL_HIGH = element.NORMAL_HIGH
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB].CRITICAL_LOW = element.CRITICAL_LOW
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB].CRITICAL_HIGH = element.CRITICAL_HIGH
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB].UNITS = element.UNITS
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB].DATA = []
    } else {
      resultDict[element.TABLE][element.TWIST_DISPLAY_NAME][element.LAB].DATA.push({
        DT_UNIX: element.DT_UNIX,
        EVENT_CD: element.EVENT_CD,
        VALUE: element.VALUE,
        EVENT_CD_DEFINITION: element.EVENT_CD_DEFINITION,
        SOURCE: element.SOURCE,
        NOTE: element.NOTE,
      })
    }
    
  });

  return resultDict;
}

const getLabsArray = database.withConnection(getLabSqlExecutor);
const getLabsDictionary = database.withConnection(getLabDictSqlExecutor);

module.exports = {
  getLabsArray,
  getLabsDictionary,
};
