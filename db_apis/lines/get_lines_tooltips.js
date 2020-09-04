/*
 * @Author: Peng Zeng
 * @Date: 2020-09-04 13:19:34
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-04 17:05:28
 */

const database = require("../../services/database");
const moment = require("moment");


  const DAY_START_HOUR = 7; // 7AM



const GET_PERSON_LINES_SQL = `
SELECT 
  ENCNTR_ID, 
  EVENT_CD_SUBTYPE, 
  DISP, 
  LINE_ID, 
  INSERT_DTM, 
  REMOVE_DTM, 
  EVENT_CD_GROUP,
  DIP, 
  LOCATION, 
  DIAM 
FROM LINES
WHERE PERSON_ID = :person_id
ORDER BY INSERT_DTM`;

const GET_PERSON_LINES_COUNTER_SQL = `
SELECT
  LINE_ID,
  LINE_CT,
  PERFORMED_DT_TM,
  ENCNTR_ID, 
  EVENT_CD_SUBTYPE, 
  EVENT_CD_GROUP,
  DRUG,
  THROMBOL,
  DRAW,
  FLUSH,
  CULTURE,
  ZERO,
  CAP_CHG,
  LINE_CHG,
  TRANSDUCER_CHG,
  TUBING_CHG
FROM LINES_COUNTER 
WHERE LINE_ID IS NOT NULL 
  AND PERSON_ID = :person_id
ORDER BY PERFORMED_DT_TM`;

const checkValidTime = (lines, linesCounter) => {
  return true;
};

const getCurTs = (timeString, day_start_hour) => {
  let current_time = moment(timeString);
  return current_time - current_time.hour(day_start_hour)
    ? current_time.hour(day_start_hour).minute(0).second(0).millisecond(0).unix()
    : current_time
        .hour(day_start_hour - 24)
        .minute(0)
        .second(0)
        .millisecond(0)
        .unix();
};

async function getLinesTooltipsSqlExecutor(conn, binds) {
  let person_lines = await conn.execute(GET_PERSON_LINES_SQL, binds).then((ret) => ret.rows);
  let person_lines_counter = await conn
    .execute(GET_PERSON_LINES_COUNTER_SQL, binds)
    .then((ret) => ret.rows);

  if (
    !person_lines ||
    !person_lines.length ||
    !person_lines_counter ||
    !person_lines_counter.length
  ) {
    return [];
  }

  if (!checkValidTime(person_lines, person_lines_counter)) {
    console.log("error time");
    return [];
  }

  let lines_dict = {};
  person_lines.forEach((element) => {
    let line_id = element["LINE_ID"];
    let cur_obj = {
      encounter_id: element["ENCNTR_ID"],
      event_subtype: element["EVENT_CD_SUBTYPE"],
      disp: element["DISP"],
      line_id: element["LINE_ID"],
      insert_dtm: element["INSERT_DTM"],
      remove_dtm: element["REMOVE_DTM"],
    };
    if (line_id in lines_dict) {
      console.log("error lines dict :>> ", line_id);
    } else {
      lines_dict[line_id] = cur_obj;
    }
  });

  let lines_counter_dict = {};
  person_lines_counter.forEach((element) => {
    let line_id = element["LINE_ID"];
    let cur_obj = {
      line_ct: element.LINE_CT,
      time: element.PERFORMED_DT_TM,
      encounter_id: element.ENCNTR_ID,
      event_subtype: element.EVENT_CD_SUBTYPE,
      event_group: element.EVENT_CD_GROUP,
      drug: element.DRUG,
      thrombol: element.THROMBOL,
      draw: element.DRAW,
      flush: element.FLUSH,
      culture: element.CULTURE,
      zero: element.ZERO,
      cap_chg: element.CAP_CHG,
      line_chg: element.LINE_CHG,
      transducer_chg: element.TRANSDUCER_CHG,
      tubing_chg: element.TUBING_CHG,
    };
    if (line_id in lines_counter_dict) {
      lines_counter_dict[line_id].push(cur_obj);
    } else {
      lines_counter_dict[line_id] = [cur_obj];
    }
  });


  const start_record_time =
    moment(person_lines[0].INSERT_DTM) - moment(person_lines_counter[0].PERFORMED_DT_TM)
      ? moment(person_lines_counter[0].PERFORMED_DT_TM)
      : moment(person_lines[0].INSERT_DTM);
  const start_time =
    start_record_time - start_record_time.hour(DAY_START_HOUR)
      ? start_record_time.hour(DAY_START_HOUR).minute(0).second(0).millisecond(0).unix()
      : start_record_time
          .hour(DAY_START_HOUR - 24)
          .minute(0)
          .second(0)
          .millisecond(0)
          .unix();

  const end_record_time =
    moment(person_lines[person_lines.length - 1].INSERT_DTM) -
    moment(person_lines_counter[person_lines_counter.length - 1].PERFORMED_DT_TM)
      ? moment(person_lines[person_lines.length - 1].INSERT_DTM)
      : moment(person_lines_counter[person_lines_counter.length - 1].PERFORMED_DT_TM);
  const end_time =
    end_record_time - end_record_time.hour(DAY_START_HOUR)
      ? start_record_time
          .hour(DAY_START_HOUR + 24)
          .minute(0)
          .second(0)
          .millisecond(0)
          .unix()
      : start_record_time.hour(DAY_START_HOUR).minute(0).second(0).millisecond(0).unix();

  let tooltip_dict = {};

  person_lines_counter.forEach((element) => {
    let cur_ts = getCurTs(element.PERFORMED_DT_TM, DAY_START_HOUR);
    if (!(cur_ts in tooltip_dict)) {
      tooltip_dict[cur_ts] = {};
    }

    let cur_id = element.LINE_ID;
    if (!(cur_id in tooltip_dict[cur_ts])) {
      tooltip_dict[cur_ts][cur_id] = { disp: lines_dict[cur_id].disp };
    }

    if (element.DRUG) {
      if (!("MEDICATIONS" in tooltip_dict[cur_ts][cur_id])) {
        tooltip_dict[cur_ts][cur_id].MEDICATIONS = {};
      }
      if (element.DRUG in tooltip_dict[cur_ts][cur_id].MEDICATIONS) {
        tooltip_dict[cur_ts][cur_id].MEDICATIONS[element.DRUG]++;
      } else {
        tooltip_dict[cur_ts][cur_id].MEDICATIONS[element.DRUG] = 1;
      }
    } else if (element.THROMBOL == 6) {
      if (tooltip_dict[cur_ts][cur_id].THROMBOL) {
        tooltip_dict[cur_ts][cur_id].THROMBOL++;
      } else {
        tooltip_dict[cur_ts][cur_id].THROMBOL = 1;
      }
    } else if (element.DRAW == 2) {
      if (tooltip_dict[cur_ts][cur_id].DRAW) {
        tooltip_dict[cur_ts][cur_id].DRAW++;
      } else {
        tooltip_dict[cur_ts][cur_id].DRAW = 1;
      }
    } else if (element.FLUSH == 3) {
      if (tooltip_dict[cur_ts][cur_id].FLUSH) {
        tooltip_dict[cur_ts][cur_id].FLUSH++;
      } else {
        tooltip_dict[cur_ts][cur_id].FLUSH = 1;
      }
    } else if (element.CULTURE == 4) {
      if (tooltip_dict[cur_ts][cur_id].CULTURE) {
        tooltip_dict[cur_ts][cur_id].CULTURE++;
      } else {
        tooltip_dict[cur_ts][cur_id].DRAW = 1;
      }
    } else if (element.ZERO == 5) {
      if (tooltip_dict[cur_ts][cur_id].ZERO) {
        tooltip_dict[cur_ts][cur_id].ZERO++;
      } else {
        tooltip_dict[cur_ts][cur_id].ZERO = 1;
      }
    } else if (element.CAP_CHG == 7) {
      if (tooltip_dict[cur_ts][cur_id].CAP_CHG) {
        tooltip_dict[cur_ts][cur_id].CAP_CHG++;
      } else {
        tooltip_dict[cur_ts][cur_id].CAP_CHG = 1;
      }
    } else if (element.LINE_CHG == 8) {
      if (tooltip_dict[cur_ts][cur_id].LINE_CHG) {
        tooltip_dict[cur_ts][cur_id].LINE_CHG++;
      } else {
        tooltip_dict[cur_ts][cur_id].LINE_CHG = 1;
      }
    } else if (element.TRANSDUCER_CHG == 9) {
      if (tooltip_dict[cur_ts][cur_id].TRANSDUCER_CHG) {
        tooltip_dict[cur_ts][cur_id].TRANSDUCER_CHG++;
      } else {
        tooltip_dict[cur_ts][cur_id].TRANSDUCER_CHG = 1;
      }
    } else if (element.TUBING_CHG == 10) {
      if (tooltip_dict[cur_ts][cur_id].TUBING_CHG) {
        tooltip_dict[cur_ts][cur_id].TUBING_CHG++;
      } else {
        tooltip_dict[cur_ts][cur_id].TUBING_CHG = 1;
      }
    } else {
      console.log("element warning:>> ", element);
    }
  });

  return tooltip_dict;
}

const getLinesTooltips = database.withConnection(getLinesTooltipsSqlExecutor);

module.exports = {
  getLinesTooltips,
};
