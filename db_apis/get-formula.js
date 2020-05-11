/*
 * @Author: Peng Zeng
 * @Date: 2020-05-06 10:16:13
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-11 15:36:47
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;

let timeLable = 0;

// EN table is already binned by hour
// START_TIME_UNIX % 3600 === 0
const SQL_GET_EN = (person_id) => `
SELECT  
  START_TIME_UNIX,
  DISPLAY_LINE,
  "VOLUME",
  UNIT,
  ROUTE,
  METHOD
FROM EN
WHERE PERSON_ID = ${person_id}
ORDER BY START_TIME_UNIX`;

const getFormula = database.withConnection(async function (conn, person_id) {
  let consoleTimeCount = timeLable++;
  console.time("getFormula" + consoleTimeCount);
  let rawResults = await conn.execute(SQL_GET_EN(person_id));
  let ret = [];
  if (rawResults && rawResults.rows) {
    let preTS;
    let curTS;
    let delayHoursCalc = false;
    rawResults.rows.forEach((element) => {
      let curTS = element.START_TIME_UNIX;

      if (curTS === preTS) {
        if (ret[ret.length - 1].display_line === element.DISPLAY_LINE) {
          ret[ret.length - 1].volume += element.VOLUME;
          return;
        } else {
          console.warn("this element has same ts as last one :>> ", element);
          console.warn("display_line not equal :>> ", ret[ret.length - 1]);
        }
      }

      // if last record is Bolus and need calculat hours base on this record
      if (delayHoursCalc) {
        ret[ret.length - 1].hours_between_feeds = getHourDiff(curTS, preTS);
        delayHoursCalc = false;
      }

      let currentRecord = {
        timestamp: curTS,
        display_line: element.DISPLAY_LINE,
        volume: element.VOLUME,
        unit: element.UNIT,
      };
      currentRecord.route = getRoute(element.ROUTE);

      if (
        (element.METHOD && element.METHOD.includes("Continuous")) ||
        getHourDiff(curTS, preTS) === 1
      ) {
        currentRecord.method = "Continuous";
      } else {
        let lastFeedHourDiff = getHourDiff(curTS, preTS);
        if (lastFeedHourDiff <= 6) {
          currentRecord.method = "Bolus";
          currentRecord.hours_between_feeds = lastFeedHourDiff;
        } else {
          currentRecord.method = "Bolus";
          delayHoursCalc = true;
        }
      }
      preTS = curTS;
      ret.push(currentRecord);
    });
  }

  console.timeEnd("getFormula" + consoleTimeCount);
  console.log("get formula array length :>> ", ret.length);
  return ret;
});

const ROUTE_MAP = {
  "NG Tube": "NG",
  "ND Tube": "ND",
  "NJ Tube": "NJ",
  "J-tube": "J",
  "G-tube": "G",
};

const getRoute = (routeName) => {
  if (routeName) {
    if (routeName in ROUTE_MAP) {
      return ROUTE_MAP[routeName];
    }
    console.log("abnormal route name :>> ", routeName);
    return routeName.slice(0, -5);
  }
  return null;
};

const getHourDiff = (timestampA, timestampB) =>
  Math.round(Math.abs(timestampA - timestampB) / 3600);

module.exports = {
  getFormula,
};
