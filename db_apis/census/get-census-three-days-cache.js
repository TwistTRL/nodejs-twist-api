/*
 * @Author: Peng Zeng
 * @Date: 2020-12-23 13:53:26
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-17 18:06:49
 */

const { getInOutTooltipQueryV2 } = require("../get-in-out-tooltip-v2");
const moment = require("moment");
const database = require("../../services/database");

// Variable	Day before yesterday	Yesterday	Today

//   Lines	    DAY_BEFORE_YESTERDAY_END	    YESTERDAY_END	    TODAY_END
//   Fluid in/out	7-7 day before yesterday	7-7 yesterday	7-current today
// RSS	last entry in window	Last entry in window	Last entry in window
// ECMO_VAD	last entry in window	Last entry in window	Last entry in window
//   Drug_infusions	last entry in window	Last entry in window	Last entry in window
//   Drug_intermittent and counts	sum for window	sum for window	sum for window

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

const GET_3DAYS_DRUG_INFUSIONS_SQL = `
SELECT 
  START_UNIX,
  END_UNIX,
  DRUG,
  RXCUI,
  INFUSION_RATE,
  INFUSION_RATE_UNITS,
  DOSING_WEIGHT
FROM DRUG_INFUSIONS
WHERE PERSON_ID = :person_id
AND START_UTC >= SYSDATE - 72 / 24
ORDER BY START_UNIX DESC`;

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
  RST,
  RSS,
  EVENT_END_DT_TM_UNIX
FROM RSS_UPDATED
WHERE PERSON_ID = :person_id
  AND EVENT_END_DT_TM_UNIX > ${ereyesterday_start}
ORDER BY EVENT_END_DT_TM_UNIX
`;

const getCensus3DaysCache = async (person_id) => {
  const today_start =
    moment().hour() >= 7 ? moment().hour(7).unix() : moment().hour(7).unix() - 24 * 60 * 60;
  const yesterday_start = today_start - 24 * 60 * 60;
  const ereyesterday_start = yesterday_start - 24 * 60 * 60;

  const getLines3Days = database.withConnection(
    async (conn, person_id) =>
      await conn.execute(GET_3DAYS_LINES_SQL, { person_id }).then((res) => res.rows)
  );
  const getInfusions3Days = database.withConnection(
    async (conn, person_id) =>
      await conn.execute(GET_3DAYS_DRUG_INFUSIONS_SQL, { person_id }).then((res) => res.rows)
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

  // fluid in out
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

  // lines
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

  // infusions
  const infusionsData = await getInfusions3Days(person_id);
  let getInfusionsToday;
  let getInfusionsYesterday;
  let getInfusionsEreyesterday;

  for (const row of infusionsData) {
    const rowUnixTime = row.START_UNIX;
    if (rowUnixTime < ereyesterday_start) {
      break;
    }
    if (!getInfusionsToday) {
      if (rowUnixTime >= today_start) {
        getInfusionsToday = row;
        continue;
      }
    }
    if (!getInfusionsYesterday) {
      if (rowUnixTime >= yesterday_start && rowUnixTime < today_start) {
        getInfusionsYesterday = row;
        continue;
      }
    }
    if (!getInfusionsEreyesterday) {
      if (rowUnixTime >= ereyesterday_start && rowUnixTime < yesterday_start) {
        getInfusionsEreyesterday = row;
        continue;
      }
    }
  }

  // intermittent
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

  return {
    fluid,
    lines,
    infusions,
    intermittent,
    ecmo,
    rss,
  };
};

module.exports = {
  getCensus3DaysCache,
};
