/*
 * @Author: Peng Zeng
 * @Date: 2020-12-23 13:53:26
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-05 11:16:31
 */

const { getInOutTooltipQueryV2 } = require("../get-in-out-tooltip-v2");
const moment = require("moment");
const database = require("../../services/database");
const { getPersonFromPersonId } = require("../person/get-person-info");
const { getWeight } = require("../get-weight");
const { getParalyticsDrugByTime } = require("../get_drug");
const {
  RXCUI_BY_CAT_ORDER_DICT,
  CAT_ORDER_LIST,
  RXCUI_TO_CAT_DICT,
} = require("../../db_relation/drug-category-relation");

// Variable	Day before yesterday	Yesterday	Today

//   Lines	    DAY_BEFORE_YESTERDAY_END	    YESTERDAY_END	    TODAY_END
//   Fluid in/out	7-7 day before yesterday	7-7 yesterday	7-current today
// RSS	last entry in window	Last entry in window	Last entry in window
// ECMO_VAD	last entry in window	Last entry in window	Last entry in window
//   Drug_infusions	last entry in window	Last entry in window	Last entry in window
//   Drug_intermittent and counts	sum for window	sum for window	sum for window

// each day start: Xray starts from midnight, others start from 7AM

// TODO: Cache tables for this API

const GET_3DAYS_LINES_SQL = `
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
AND INSERT_DTM >= SYSDATE - 72 / 24
ORDER BY INSERT_DTM DESC`;

// const GET_3DAYS_DRUG_INFUSIONS_SQL = `
// SELECT
//   START_UNIX,
//   END_UNIX,
//   DRUG,
//   RXCUI,
//   INFUSION_RATE,
//   INFUSION_RATE_UNITS,
//   DOSING_WEIGHT
// FROM DRUG_INFUSIONS
// WHERE PERSON_ID = :person_id
// AND START_UTC >= SYSDATE - 72 / 24
// ORDER BY START_UNIX DESC`;

const GET_INFUSIONS_DURING_TIME_SQL = `
SELECT
  DRUG, END_UNIX, INFUSION_RATE, INFUSION_RATE_UNITS, RXCUI, DOSING_WEIGHT 
FROM DRUG_INFUSIONS
WHERE PERSON_ID = :person_id
  AND END_UNIX >= :lower_timestamp
  AND END_UNIX < :upper_timestamp
-- ORDER BY END_UNIX DESC
`;

const GET_3DAYS_DRUG_INTERMITTENT_SQL = `
SELECT 
  DT_UNIX,
  DRUG,
  RXCUI,
  ADMIN_DOSAGE,
  ADMIN_ROUTE,
  DOSAGE_UNITS,
  DOSING_WEIGHT
FROM DRUG_INTERMITTENT
WHERE PERSON_ID = :person_id
AND DT_UTC >= SYSDATE - 72 / 24
ORDER BY DT_UNIX DESC`;

const GET_3DAYS_ECMO_SQL = (ereyesterday_start) => `
SELECT
  VALID_FROM_DT_TM,
  ECMO_VAD_SCORE
FROM ECMO_VAD_VARIABLE
WHERE PERSON_ID = :person_id
AND VALID_FROM_DT_TM > ${ereyesterday_start}
ORDER BY VALID_FROM_DT_TM`;

const GET_3DAYS_RSS_SQL = (ereyesterday_start) => `
SELECT  
  ROWNUM AS ID,
  PERSON_ID,
  RST,
  RSS,
  INO_DOSE,
  EVENT_END_DT_TM_UNIX AS TIME
FROM RSS_UPDATED
WHERE PERSON_ID = :person_id
  AND EVENT_END_DT_TM_UNIX >= ${ereyesterday_start}
ORDER BY EVENT_END_DT_TM_UNIX
`;

const GET_2DAYS_XRAY_SQL = (date_string) => `
SELECT
  ID,
  ACCESSION_NUMBER,
  FILE_THUMBNAILES,
  FILE_NAME,
  MRN,
  STUDY_DATE,
  STUDY_DESCRIPTION,
  STUDY_ID,
  STUDY_TIME
FROM API_CACHE_XRAY 
WHERE MRN = :mrn
AND STUDY_DATE >= ${date_string}
`;

const GET_3DAYS_LOCATION_SQL = (ereyesterday_start) => `
SELECT 
  NURSE_UNIT_DISP,
  ROOM_DISP,
  LOCATION_BED,
  START_UNIX,
  END_UNIX
FROM ADT
WHERE PERSON_ID = :person_id
  AND END_UNIX >= ${ereyesterday_start}
ORDER BY START_UNIX
`

const getCensus3DaysCache = async (person_id) => {
  const today_start =
    moment().hour() >= 7 ? moment().hour(7).minute(0).second(0).unix() : moment().hour(7).minute(0).second(0).unix() - 24 * 60 * 60;
  const yesterday_start = today_start - 24 * 60 * 60;
  const ereyesterday_start = yesterday_start - 24 * 60 * 60;

  const today_month_string =
    moment().month() + 1 < 10 ? "0" + (moment().month() + 1) : (moment().month() + 1).toString();
  const today_date_string =
    moment().date() < 10 ? "0" + moment().date() : moment().date().toString();
  const xray_today_date = moment().year().toString() + today_month_string + today_date_string;

  const xray_yesterday = moment().subtract(1, "days");
  const yesterday_month_string =
    xray_yesterday.month() + 1 < 10
      ? "0" + (xray_yesterday.month() + 1)
      : (xray_yesterday.month() + 1).toString();

  const yesterday_date_string =
    xray_yesterday.date() < 10 ? "0" + xray_yesterday.date() : xray_yesterday.date().toString();

  const xray_yesterday_date =
    xray_yesterday.year().toString() + yesterday_month_string + yesterday_date_string;

  const getLines3Days = database.withConnection(async (conn, person_id) => {
    await conn.execute(`ALTER SESSION SET nls_date_format = 'YYYY-MM-DD"T"HH24:MI:SS"Z"'`);
    return await conn.execute(GET_3DAYS_LINES_SQL, { person_id }).then((res) => res.rows);
  });
  // const getInfusions3Days = database.withConnection(
  //   async (conn, person_id) =>
  //     await conn.execute(GET_3DAYS_DRUG_INFUSIONS_SQL, { person_id }).then((res) => res.rows)
  // );
  const getLatestInfusionsDuringTime = database.withConnection(
    async (conn, { person_id, lower_timestamp, upper_timestamp }) =>
      await conn
        .execute(GET_INFUSIONS_DURING_TIME_SQL, { person_id, lower_timestamp, upper_timestamp })
        .then((res) => res.rows)
  );
  const getIntermittent3Days = database.withConnection(
    async (conn, person_id) =>
      await conn.execute(GET_3DAYS_DRUG_INTERMITTENT_SQL, { person_id }).then((res) => res.rows)
  );

  const getECMO3Days = database.withConnection(
    async (conn, person_id) =>
      await conn
        .execute(GET_3DAYS_ECMO_SQL(ereyesterday_start), { person_id })
        .then((res) => res.rows)
  );

  const getRSS3Days = database.withConnection(
    async (conn, person_id) =>
      await conn
        .execute(GET_3DAYS_RSS_SQL(ereyesterday_start), { person_id })
        .then((res) => res.rows)
  );

  const getLocation3Days = database.withConnection(
    async (conn, person_id) =>
      await conn
        .execute(GET_3DAYS_LOCATION_SQL(ereyesterday_start), { person_id })
        .then((res) => res.rows)
  );

  const getXray2Days = database.withConnection(
    async (conn, mrn) =>
      await conn.execute(GET_2DAYS_XRAY_SQL(xray_yesterday_date), { mrn }).then((res) => res.rows)
  );

  // ------ weight
  const weight = {
    today: null,
    yesterday: null,
    ereyesterday: null,
  };

  const weightArr = await getWeight(person_id).then((arr) => arr.reverse());
  if (weightArr.length) {
    weight.today = weightArr[0].WEIGHT;
    for (const curWeight of weightArr) {
      if (!weight.yesterday) {
        if (curWeight.DT_UNIX < yesterday_start) {
          weight.yesterday = curWeight.WEIGHT;
          if (curWeight.DT_UNIX < ereyesterday_start) {
            weight.ereyesterday = curWeight.WEIGHT;
            break;
          }
        }
      } else if (!weight.ereyesterday) {
        if (curWeight.DT_UNIX < ereyesterday_start) {
          weight.ereyesterday = curWeight.WEIGHT;
          break;
        }
      } else {
        break;
      }
    }
  }

  // ------ xray
  const personInfo = await getPersonFromPersonId({ person_id });
  console.log("personInfo :>> ", personInfo);
  const mrns = personInfo.MRNS;
  if (!mrns.length) {
    console.warn("error personInfo :>> ", personInfo);
    return null;
  }
  const mrn = mrns[0].MRN;
  const getXray = await getXray2Days(mrn);
  console.log("getXray :>> ", getXray);
  console.log("xray_today_date :>> ", xray_today_date);
  const getXrayToday = getXray
    .filter((item) => item.STUDY_DATE.toString() === xray_today_date)
    .map((item) => ({
      id: item.ID,
      accession_number: item.ACCESSION_NUMBER,
      mrn: item.MRN,
      study_description: item.STUDY_DESCRIPTION,
      study_id: item.STUDY_ID,
      study_timestamp: moment(item.STUDY_DATE + item.STUDY_TIME, "YYYYMMDDhhmmss").unix(),
      thumbnails: item.FILE_THUMBNAILES.toString("base64"),
    }));
  console.log("getXrayToday :>> ", getXrayToday);
  const getXrayYesterday = getXray
    .filter((item) => item.STUDY_DATE.toString() === xray_yesterday_date)
    .map((item) => ({
      id: item.ID,
      accession_number: item.ACCESSION_NUMBER,
      mrn: item.MRN,
      study_description: item.STUDY_DESCRIPTION,
      study_id: item.STUDY_ID,
      study_timestamp: moment(item.STUDY_DATE + item.STUDY_TIME, "YYYYMMDDhhmmss").unix(),
      thumbnails: item.FILE_THUMBNAILES.toString("base64"),
    }));

  // ------ fluid in out
  const resolution = 24 * 60 * 60; // 1 day
  const fluidTodayInput = {
    person_id,
    from: today_start,
    to: today_start + resolution - 1,
    resolution,
  };
  const fluidYesterdayInput = {
    person_id,
    from: yesterday_start,
    to: yesterday_start + resolution - 1,
    resolution,
  };
  const fluidEreyesterdayInput = {
    person_id,
    from: ereyesterday_start,
    to: ereyesterday_start + resolution - 1,
    resolution,
  };

  const getFluidToday = await getInOutTooltipQueryV2(fluidTodayInput);
  const getFluidYesterday = await getInOutTooltipQueryV2(fluidYesterdayInput);
  const getFluidEreyesterday = await getInOutTooltipQueryV2(fluidEreyesterdayInput);

  // ------ lines
  const linesData = await getLines3Days(person_id);
  let getLinesToday;
  let getLinesYesterday;
  let getLinesEreyesterday;

  for (const row of linesData) {
    const rowUnixTime = moment(row.INSERT_DTM).unix();
    if (rowUnixTime < ereyesterday_start) {
      break;
    }
    if (!getLinesToday) {
      if (rowUnixTime >= today_start) {
        getLinesToday = row;
        continue;
      }
    }
    if (!getLinesYesterday) {
      if (rowUnixTime >= yesterday_start && rowUnixTime < today_start) {
        getLinesYesterday = row;
        continue;
      }
    }
    if (!getLinesEreyesterday) {
      if (rowUnixTime >= ereyesterday_start && rowUnixTime < yesterday_start) {
        getLinesEreyesterday = row;
        continue;
      }
    }
  }

  // ------ infusions
  const getInfusionsLatestRecordEachDrug = (arr) => {
    if (!arr || !arr.length) {
      return [];
    }
    const drugDict = {};
    arr.forEach((item) => {
      const possibleCatArr = RXCUI_TO_CAT_DICT[item.RXCUI].sort(
        (a, b) => CAT_ORDER_LIST.indexOf(a) - CAT_ORDER_LIST.indexOf(b)
      );
      if (!possibleCatArr || !possibleCatArr.length) {
        console.warn("wrong catogery for :>> ", item);
        return;
      }

      if (possibleCatArr.length > 1) {
        console.log("this drug has two cats :>> ", item);
      }

      const cat = possibleCatArr[0];

      if (!(item.RXCUI in drugDict)) {
        drugDict[item.RXCUI] = { CATEGORY: cat, ...item };
      } else if (item.END_UNIX > drugDict[item.RXCUI].END_UNIX) {
        drugDict[item.RXCUI] = { CATEGORY: cat, ...item };
      }
    });

    const drugCatDict = {};
    Object.values(drugDict).forEach((item) => {
      const cat = item.CATEGORY;
      if (cat in drugCatDict) {
        drugCatDict[cat].push(item);
      } else {
        drugCatDict[cat] = [item];
      }
    });

    let ret = [];
    CAT_ORDER_LIST.forEach((cat) => {
      if (cat in drugCatDict) {
        const curCatDrugs = drugCatDict[cat].sort(
          (a, b) =>
            RXCUI_BY_CAT_ORDER_DICT[cat].indexOf(a) - RXCUI_BY_CAT_ORDER_DICT[cat].indexOf(b)
        );
        ret = [...ret, ...curCatDrugs];
      }
    });
    return ret;
    //   {
    //     "DRUG": "nitroprusside",
    //     "END_UNIX": 1612246199,
    //     "INFUSION_RATE": 0.25,
    //     "INFUSION_RATE_UNITS": "mcg/kg/min",
    //     "RXCUI": 7476,
    //     "DOSING_WEIGHT": 16.4
    // },
  };

  const getInfusionsToday = getInfusionsLatestRecordEachDrug(
    await getLatestInfusionsDuringTime({
      person_id,
      upper_timestamp: moment().unix(),
      lower_timestamp: today_start,
    })
  );
  const getInfusionsYesterday = getInfusionsLatestRecordEachDrug(
    await getLatestInfusionsDuringTime({
      person_id,
      upper_timestamp: today_start,
      lower_timestamp: yesterday_start,
    })
  );
  const getInfusionsEreyesterday = getInfusionsLatestRecordEachDrug(
    await getLatestInfusionsDuringTime({
      person_id,
      upper_timestamp: yesterday_start,
      lower_timestamp: ereyesterday_start,
    })
  );

  // ------ intermittent
  const intermittentData = await getIntermittent3Days(person_id);
  let getIntermittentToday;
  let getIntermittentYesterday;
  let getIntermittentEreyesterday;

  for (const row of intermittentData) {
    const rowUnixTime = row.DT_UNIX;
    if (rowUnixTime < ereyesterday_start) {
      break;
    }
    if (!getIntermittentToday) {
      if (rowUnixTime >= today_start) {
        getIntermittentToday = row;
        continue;
      }
    }
    if (!getIntermittentYesterday) {
      if (rowUnixTime >= yesterday_start && rowUnixTime < today_start) {
        getIntermittentYesterday = row;
        continue;
      }
    }
    if (!getIntermittentEreyesterday) {
      if (rowUnixTime >= ereyesterday_start && rowUnixTime < yesterday_start) {
        getIntermittentEreyesterday = row;
        continue;
      }
    }
  }

  const xray = {
    today: getXrayToday,
    yesterday: getXrayYesterday,
  };

  const fluid = {
    today: getFluidToday,
    yesterday: getFluidYesterday,
    ereyesterday: getFluidEreyesterday,
  };

  const lines = {
    today: getLinesToday,
    yesterday: getLinesYesterday,
    ereyesterday: getLinesEreyesterday,
  };

  const infusions = {
    today: getInfusionsToday,
    yesterday: getInfusionsYesterday,
    ereyesterday: getInfusionsEreyesterday,
  };
  const intermittent = {
    today: getIntermittentToday,
    yesterday: getIntermittentYesterday,
    ereyesterday: getIntermittentEreyesterday,
  };

  const ecmo = await getECMO3Days(person_id);
  const rss = await getRSS3Days(person_id);
  const locations = await getLocation3Days(person_id);
  const paralytics = await getParalyticsDrugByTime({person_id, end_unix: ereyesterday_start})
  const cacheRange = [ereyesterday_start, moment().unix()];

  return {
    weight,
    xray,
    fluid,
    lines,
    infusions,
    intermittent,
    ecmo,
    rss,
    locations,
    paralytics,
    cacheRange,
  };
};

module.exports = {
  getCensus3DaysCache,
};
