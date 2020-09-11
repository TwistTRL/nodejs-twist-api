/*
 * @Author: Peng Zeng
 * @Date: 2020-09-10 17:00:02
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-11 14:43:14
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
  CRITICAL_HIGH
FROM LABS
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
//  "EVENT_CD_DEFINITION": "O2 Sat Venous",
//     "TABLE": "BLOOD GAS",
//     "SOURCE": "VENOUS",
//     "DISPLAY_ABBREV": "SvO2",
//     "DISPLAY_ORDER": 8

async function getLabDictSqlExecutor(conn, binds) {
  const labArray = await getLabSqlExecutor(conn, binds);
  let resultDict = {};
  labArray.forEach((element) => {
    if (!(element.TABLE in resultDict)) {
      resultDict[element.TABLE] = {};
    }
    if (element.LAB in resultDict[element.TABLE]) {
      resultDict[element.TABLE][element.LAB].DATA.push({
        DT_UNIX: element.DT_UNIX,
        VALUE: element.VALUE,
        EVENT_CD_DEFINITION: element.EVENT_CD_DEFINITION,
        SOURCE: element.SOURCE,
        DISPLAY_ABBREV: element.DISPLAY_ABBREV,
        DISPLAY_ORDER: element.DISPLAY_ORDER,
      });
    } else {
      resultDict[element.TABLE][element.LAB] = {};
      resultDict[element.TABLE][element.LAB].NORMAL_LOW = element.NORMAL_LOW;
      resultDict[element.TABLE][element.LAB].NORMAL_HIGH = element.NORMAL_HIGH;
      resultDict[element.TABLE][element.LAB].CRITICAL_LOW = element.CRITICAL_LOW;
      resultDict[element.TABLE][element.LAB].CRITICAL_HIGH = element.CRITICAL_HIGH;
      resultDict[element.TABLE][element.LAB].UNITS = element.UNITS;
      resultDict[element.TABLE][element.LAB].DATA = [
        {
          DT_UNIX: element.DT_UNIX,
          VALUE: element.VALUE,
          EVENT_CD_DEFINITION: element.EVENT_CD_DEFINITION,
          SOURCE: element.SOURCE,
          DISPLAY_ABBREV: element.DISPLAY_ABBREV,
          DISPLAY_ORDER: element.DISPLAY_ORDER,
        },
      ];
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
