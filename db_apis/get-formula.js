/*
 * @Author: Peng Zeng
 * @Date: 2020-05-06 10:16:13
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-11 17:19:19
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
        ret[ret.length - 1].volume += element.VOLUME;
        if (ret[ret.length - 1].display_line !== element.DISPLAY_LINE) {
          ret[ret.length - 1].display_line += ` and ${element.DISPLAY_LINE}`;
        }
        if (ret[ret.length - 1].route !== getRoute(element.ROUTE)) {
          ret[ret.length - 1].route += ` and ${getRoute(element.ROUTE)}`;
        }
        if (ret[ret.length - 1].route && element.METHOD) {
          if (ret[ret.length - 1].route.includes("Bolus") && element.METHOD.includes("Continuous")) {
            console.log('element method B->C :>> ', element);
          } else if (ret[ret.length - 1].route.includes("Continuous") && element.METHOD.includes("Bolus")) {
            console.log('element method C->B:>> ', element);
          }
        }
        return;
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
  "G-Tube": "G",
};

const getRoute = (routeName) => {
  if (routeName) {
    if (routeName in ROUTE_MAP) {
      return ROUTE_MAP[routeName];
    }
    console.log("abnormal route name :>> ", "~~>" + routeName + "<~~");
    return routeName.slice(0, -5);
  }
  return null;
};

const getHourDiff = (timestampA, timestampB) =>
  Math.round(Math.abs(timestampA - timestampB) / 3600);

module.exports = {
  getFormula,
};
