/*
 * @Author: Peng Zeng
 * @Date: 2020-09-19 12:00:21
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-19 14:55:21
 */

// `INTAKE_OUTPUT` updated to including inoutcodes.xlsx

/**
 * arr1 from table `INTAKE_OUTPUT`,
 * arr2 from table `DRUG_DILUENTS`,
 * arr3 from table `TPN`,
 * arrEN from table `EN`,
 * arrLipids from table `TPN_LIPIDS`
 * arrMed from table `DRUG_INTERMITTENT`
 *
 * unit is mL only, because
 * `select distinct INFUSION_RATE_UNITS from drug_diluents` is `mL/hr`
 *
 *
 */

const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const InputInvalidError = require("../utils/errors").InputInvalidError;
const {
  EVENT_CD_DICT,
  SL_ORDER_ARRAY,
  CAT_ORDER_ARRAY,
  IVF_TO_DEXTROSE,
} = require("../db_relation/in-out-db-relation");
const { getBinarySearchNearest } = require("./utils/binarySearchUtils");

const PERSON_ID = "person_id";
const FROM = "from";
const TO = "to";
const RESOLUTION = "resolution";
var timeLable = 0;
const UNIT_ML = "ml";

console.log("SL_ORDER_ARRAY :>> ", SL_ORDER_ARRAY);
console.log("CAT_ORDER_ARRAY :>> ", CAT_ORDER_ARRAY);
console.log("IVF_TO_DEXTROSE :>> ", IVF_TO_DEXTROSE);

const SQL_GET_TPN_LIPID_PART1 = `
SELECT
  DT_UNIX,
  RESULT_VAL
FROM TPN_LIPID
WHERE PERSON_ID = `;
const SQL_GET_TPN_LIPID_PART2 = `
AND DT_UNIX <= `;
const SQL_GET_TPN_LIPID_PART3 = ` AND DT_UNIX >= `;
const SQL_GET_TPN_LIPID_PART4 = ` 
ORDER BY DT_UNIX`;

const SQL_GET_TPN_PART1 = `
SELECT  
  START_UNIX,
  END_UNIX, 
  RESULT_VAL,
  "DEXTROSE_PN",
  "AMINO_ACID_PN",
  "SELENIUM_PN",
  "POTASSIUM_PN",
  "CALCIUM_PN",
  "MAGNESIUM_MEQ",
  "PHOSPHORUS_PN",
  "HEPARIN_PN",
  "RANITIDINE_PN",
  "EXTRA_PHYTONADIONE_PN",
  "SODIUM_PN",
  "VITAMIN_PN",
  "CARNITINE_PN"
FROM TPN
WHERE PERSON_ID = `;
const SQL_GET_TPN_PART2 = `
AND START_UNIX <= `;
const SQL_GET_TPN_PART3 = ` AND END_UNIX >= `;
const SQL_GET_TPN_PART4 = ` 
ORDER BY START_UNIX`;

const SQL_GET_EN_PART1 = `
SELECT  
  START_TIME_UNIX,
  "VOLUME",
  "DISPLAY_LINE",
  UNIT,
  CAL_DEN,
  G_PTN_ROW,
  G_FAT_ROW,
  G_CHO_ROW
FROM EN
WHERE PERSON_ID = `;
const SQL_GET_EN_PART2 = `
AND START_TIME_UNIX <= `;
const SQL_GET_EN_PART3 = ` AND START_TIME_UNIX >= `;
const SQL_GET_EN_PART4 = ` 
ORDER BY START_TIME_UNIX`;

// get raw in-out by event between two timestamp
const SQL_GET_IN_OUT_EVENT_PART1 = `
SELECT  
  DT_UNIX,
  EVENT_CD,
  RESULT_VAL,
  EVENT_TAG,
  RESULT_UNITS_CD,
  UNIT,
  DESC_EVENT,
  EVENT_CD_DEFINITION,
  DISPLAY_IO,
  IO_CALCS,
  IO_CAT,
  SUBCAT,
  LABEL_TWIST,
  SHORT_LABEL,
  DEXTROSE  
FROM INTAKE_OUTPUT
WHERE PERSON_ID = `;
const SQL_GET_IN_OUT_EVENT_PART2 = `
AND DT_UNIX >= `;
const SQL_GET_IN_OUT_EVENT_PART3 = ` AND DT_UNIX <= `;
const SQL_GET_IN_OUT_EVENT_PART4 = ` 
ORDER BY DT_UNIX
`;

// get raw in-out by FLUSHES and INFUSIONS between two timestamp
//(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES
// others: INFUSIONS
// SEND: mL in each bin (calculated from rate), drug, diluent, conc, stength_unit,vol_unit, infusion_rate, infusion_rate_units, [admin site,]

//  ADMIN_SITE not avaelable
const SQL_GET_IN_OUT_DILUENTS_PART1 = `
SELECT  
  START_UNIX,
  END_UNIX,
  DRUG,
  DILUENT,
  CONC,
  STRENGTH_UNIT,
  VOL_UNIT,
  INFUSION_RATE,
  INFUSION_RATE_UNITS
FROM DRUG_DILUENTS
WHERE PERSON_ID = `;
const SQL_GET_IN_OUT_DILUENTS_PART2 = ` 
ORDER BY START_UNIX`;

const SQL_GET_MED_VOL = `
SELECT 
  DT_UNIX,
  DRUG,
  INFUSED_VOLUME,
  VOLUME_UNITS,
  ADMIN_ROUTE
FROM DRUG_INTERMITTENT
WHERE PERSON_ID = :person_id 
  AND (VOLUME_UNITS = 'mL' OR VOLUME_UNITS = 'L')
  AND DT_UNIX BETWEEN :from_ AND :to_
ORDER BY DT_UNIX`;

// const SQL_GET_WEIGHT_PART1 = `
// SELECT
//   DT_UNIX,
//   WEIGHT
// FROM WEIGHTS
// WHERE PERSON_ID = `;
// const SQL_GET_WEIGHT_PART2 = `
// ORDER BY DT_UNIX`;

async function enQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_EN =
    SQL_GET_EN_PART1 +
    query[PERSON_ID] +
    SQL_GET_EN_PART2 +
    Number(query[TO]) +
    SQL_GET_EN_PART3 +
    Number(query[FROM]) +
    SQL_GET_EN_PART4;
  console.log("~~SQL for EN: ", SQL_GET_EN);
  console.time("getEN-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_EN);
  console.timeEnd("getEN-sql" + timestampLable);
  return rawRecord.rows;
}

async function tpnQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_TPN =
    SQL_GET_TPN_PART1 +
    query[PERSON_ID] +
    SQL_GET_TPN_PART2 +
    Number(query[TO]) +
    SQL_GET_TPN_PART3 +
    Number(query[FROM]) +
    SQL_GET_TPN_PART4;
  console.log("~~SQL for TPN: ", SQL_GET_TPN);
  console.time("getTPN-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_TPN);
  console.timeEnd("getTPN-sql" + timestampLable);
  return rawRecord.rows;
}

async function lipidsQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_LIPIDS =
    SQL_GET_TPN_LIPID_PART1 +
    query[PERSON_ID] +
    SQL_GET_TPN_LIPID_PART2 +
    Number(query[TO]) +
    SQL_GET_TPN_LIPID_PART3 +
    Number(query[FROM]) +
    SQL_GET_TPN_LIPID_PART4;
  console.log("~~SQL for LIPIDS: ", SQL_GET_LIPIDS);
  console.time("getLipids-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_LIPIDS);
  console.timeEnd("getLipids-sql" + timestampLable);
  return rawRecord.rows;
}

async function inOutEventTooltipQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_IN_OUT_EVENT =
    SQL_GET_IN_OUT_EVENT_PART1 +
    query[PERSON_ID] +
    SQL_GET_IN_OUT_EVENT_PART2 +
    query[FROM] * 1 +
    SQL_GET_IN_OUT_EVENT_PART3 +
    query[TO] * 1 +
    SQL_GET_IN_OUT_EVENT_PART4;
  console.log("~~SQL for in-out Event: ", SQL_GET_IN_OUT_EVENT);
  console.time("getInOutEvent-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_EVENT);
  console.timeEnd("getInOutEvent-sql" + timestampLable);
  return rawRecord.rows;
}

async function inOutDiluentsTooltipQuerySQLExecutor(conn, query) {
  let timestampLable = timeLable++;
  let SQL_GET_IN_OUT_DILUENTS =
    SQL_GET_IN_OUT_DILUENTS_PART1 +
    query[PERSON_ID] +
    ` 
    AND ((START_UNIX < ` +
    query[FROM] +
    ` AND END_UNIX > ` +
    query[FROM] +
    `)
    OR (START_UNIX >= ` +
    query[FROM] +
    ` AND END_UNIX <= ` +
    query[TO] +
    ` )
    OR (START_UNIX < ` +
    query[TO] +
    ` AND END_UNIX >  ` +
    query[TO] +
    `))` +
    SQL_GET_IN_OUT_DILUENTS_PART2;
  console.log("~~SQL for in-out Diluents: ", SQL_GET_IN_OUT_DILUENTS);
  console.time("getInOutDiluents-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_IN_OUT_DILUENTS);
  console.timeEnd("getInOutDiluents-sql" + timestampLable);
  return rawRecord.rows;
}

async function medVolQuerySQLExecutor(conn, query) {
  let binds = {
    person_id: Number(query.person_id),
    from_: Number(query[FROM]),
    to_: Number(query[TO]),
  };
  console.log("binds :>> ", binds);
  let timestampLable = timeLable++;
  console.log("~~SQL for med volume in tooltip-v2: ", SQL_GET_MED_VOL);
  console.time("getMedVol-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_MED_VOL, binds);
  console.timeEnd("getMedVol-sql" + timestampLable);
  return rawRecord.rows;
}

// async function weightQuerySQLExecutor(conn, query) {
//   let timestampLable = timeLable++;
//   let SQL_GET_WEIGHT =
//     SQL_GET_WEIGHT_PART1 + query[PERSON_ID] + SQL_GET_WEIGHT_PART2;
//   console.log("~~SQL for get weight: ", SQL_GET_WEIGHT);
//   console.time("getWeight-sql" + timestampLable);
//   let rawRecord = await conn.execute(SQL_GET_WEIGHT);
//   console.timeEnd("getWeight-sql" + timestampLable);
//   return rawRecord.rows;
// }

function _calculateRawRecords(rawRecords, timeInterval, startTime, endTime) {
  // result will be [type1Dict, type2Dict], first item is "in" and second is "out".
  let type1Dict = {};
  let type2Dict = {};

  let { arr1, arr2, arr3, arrEN, arrLipids, arrMed } = rawRecords;

  if (arr1 && arr1.length) {
    console.log("In-Out Event record size :", arr1.length);
    console.log("arr1 :>> ", arr1);

    let countNull = 0;
    let currentTime = startTime;

    for (let row of arr1) {
      //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "RESULT_VAL": 0.9}
      let io_calcs = EVENT_CD_DICT[row.EVENT_CD].IO_CALCS;

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      //if current DISPLAY_IO != '1', or IO_CALCS == 0, skip it
      if (EVENT_CD_DICT[row.EVENT_CD].DISPLAY_IO != "1" || !io_calcs) {
        continue;
      }

      if (row.RESULT_VAL == null) {
        countNull++;
      }

      if (currentTime + timeInterval <= row.DT_UNIX) {
        // this row record has different time zone with currentTime, setting new currentTime
        currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
      }

      if (io_calcs == "1") {
        type1Dict = _updateRowToDict(currentTime, row, type1Dict);
      } else if (io_calcs == "2") {
        type2Dict = _updateRowToDict(currentTime, row, type2Dict);
      } else {
        console.log("Error IO_CALCS");
      }
    }
    console.log("null value number for In-Out Event records: ", countNull);
  }

  console.log("type1Dict :>> ", type1Dict);
  console.log("type2Dict :>> ", type2Dict);

  //example arr2 = {
  // START_UNIX,
  // END_UNIX,
  // DRUG,
  // DILUENT,
  // CONC,
  // STRENGTH_UNIT,
  // VOL_UNIT,
  // INFUSION_RATE,
  // INFUSION_RATE_UNITS,
  // ADMIN_SITE}

  if (arr2 && arr2.length) {
    console.log("In-Out Diluents record size :", arr2.length);
    for (let row of arr2) {
      //example row = {"START_UNIX": 1524700800, "END_UNIX": "1524736800", "DRUG": "drug", "DILUENT": "aaa", "INFUSION_RATE": 0.9 .... }
      //(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES

      // console.log("row: ", row);
      let currentTime = startTime;

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      let zoneNumber =
        Math.floor((Math.min(row.END_UNIX, endTime) - currentTime) / timeInterval) + 1;
      for (let i = 0; i < zoneNumber; i++) {
        let value = 0;
        let calTime = currentTime + i * timeInterval;

        if (i == 0) {
          value =
            ((Math.min(currentTime + timeInterval, row.END_UNIX) -
              Math.max(startTime, row.START_UNIX)) *
              row.INFUSION_RATE) /
            3600;
        } else if (i == zoneNumber - 1) {
          value =
            (Math.min(row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1), timeInterval) *
              row.INFUSION_RATE) /
            3600;
        } else {
          value = (timeInterval * row.INFUSION_RATE) / 3600;
        }

        if (value < 0) {
          console.error("arr2 value < 0: ", value);
          console.log("i :", i);
          console.log("zoneNumber :", zoneNumber);
          console.log("currentTime :", currentTime);
          console.log("startTime :", startTime);
          console.log("row.START_UNIX :", row.START_UNIX);
          console.log("row.END_UNIX :", row.END_UNIX);
          console.log("row.INFUSION_RATE :", row.INFUSION_RATE);

          console.log(
            "Math.min(currentTime + timeInterval, row.END_UNIX) :",
            Math.min(currentTime + timeInterval, row.END_UNIX)
          );
          console.log("Math.max(startTime, row.START_UNIX) :", Math.max(startTime, row.START_UNIX));
        }

        let singleResult = {};
        singleResult.value = value;
        singleResult.drug = row.DRUG;
        singleResult.diluent = row.DILUENT;
        singleResult.rate = row.INFUSION_RATE;
        singleResult.unit = row.INFUSION_RATE_UNITS;
        singleResult.conc = row.CONC;
        singleResult.strength_unit = row.STRENGTH_UNIT;
        singleResult.vol_unit = row.VOL_UNIT;
        singleResult.end_time = Math.min(row.END_UNIX, currentTime + timeInterval);

        if (!row.DRUG) {
          console.log("row :", row);
          continue;
        }

        // singleResult.location = "not ready";

        let typeFlush = row.DRUG == "papavarine" || row.DRUG == "heparin flush" ? 1 : 0;
        if (!(calTime in type1Dict)) {
          type1Dict[calTime] = { value: 0 };
        }

        if (typeFlush) {
          // Flushes cat
          singleResult.location = "not ready";
          if (!type1Dict[calTime].Flushes) {
            type1Dict[calTime].Flushes = { value: 0, drugs: [] };
            type1Dict[calTime].Flushes.drugs.push(singleResult);
          } else {
            let drugsArray = type1Dict[calTime].Flushes.drugs;
            let isMerged = false;

            for (let i = 0; i < drugsArray.length; i++) {
              if (
                drugsArray[i].drug == singleResult.drug &&
                drugsArray[i].diluent == singleResult.diluent &&
                drugsArray[i].location == singleResult.location
              ) {
                type1Dict[calTime].Flushes.drugs[i].value += singleResult.value;
                if (singleResult.end_time >= type1Dict[calTime].Flushes.drugs[i].end_time) {
                  // updated to most recent rate
                  type1Dict[calTime].Flushes.drugs[i].end_time = singleResult.end_time;
                  type1Dict[calTime].Flushes.drugs[i].rate = singleResult.rate;
                  type1Dict[calTime].Flushes.drugs[i].unit = singleResult.unit;
                  type1Dict[calTime].Flushes.drugs[i].conc = singleResult.conc;
                  type1Dict[calTime].Flushes.drugs[i].strength_unit = singleResult.strength_unit;
                  type1Dict[calTime].Flushes.drugs[i].vol_unit = singleResult.vol_unit;
                }
                isMerged = true;
                break;
              }
            }

            if (!isMerged) {
              type1Dict[calTime].Flushes.drugs.push(singleResult);
            }
          }
          type1Dict[calTime].value += value;
          type1Dict[calTime].Flushes.value += value;
        } else {
          // Infusions cat
          if (!type1Dict[calTime].Infusions) {
            type1Dict[calTime].Infusions = { value: 0, drugs: [] };
            type1Dict[calTime].Infusions.drugs.push(singleResult);
          } else {
            let drugsArray = type1Dict[calTime].Infusions.drugs;
            let isMerged = false;

            for (let i = 0; i < drugsArray.length; i++) {
              if (
                drugsArray[i].drug == singleResult.drug &&
                drugsArray[i].diluent == singleResult.diluent
              ) {
                type1Dict[calTime].Infusions.drugs[i].value += singleResult.value;
                if (singleResult.end_time >= type1Dict[calTime].Infusions.drugs[i].end_time) {
                  // updated to most recent rate
                  type1Dict[calTime].Infusions.drugs[i].end_time = singleResult.end_time;
                  type1Dict[calTime].Infusions.drugs[i].rate = singleResult.rate;
                  type1Dict[calTime].Infusions.drugs[i].unit = singleResult.unit;
                  type1Dict[calTime].Infusions.drugs[i].conc = singleResult.conc;
                  type1Dict[calTime].Infusions.drugs[i].strength_unit = singleResult.strength_unit;
                  type1Dict[calTime].Infusions.drugs[i].vol_unit = singleResult.vol_unit;
                }
                isMerged = true;
                break;
              }
            }

            if (!isMerged) {
              type1Dict[calTime].Infusions.drugs.push(singleResult);
            }
          }
          type1Dict[calTime].value += value;
          type1Dict[calTime].Infusions.value += value;
        }
      }
    }

    Object.values(type1Dict).forEach((elementTimestamp) => {
      for (let [key, value] of Object.entries(elementTimestamp)) {
        if (key == "Infusions" || key == "Flushes") {
          if (value && value.drugs) {
            value.drugs.forEach((element) => {
              delete element.end_time;
            });
            value.drugs.sort((a, b) => b.rate - a.rate); // sorted by rate from high to low
          }
        }
      }
    });
  }

  // TPN data is "in" type
  if (arr3 && arr3.length) {
    console.log("TPN record size :", arr3.length);
    for (let row of arr3) {
      //example row = {"EVENT_START_DT_TM": 1524700800, "EVENT_END_DT_TM": "1524736800", "RESULT_VAL": 0.9 .... }

      // console.log("row: ", row);
      let currentTime = startTime;

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      let rowStart = row.START_UNIX;
      let rowEnd = row.END_UNIX + 1;

      let zoneNumber = Math.floor((Math.min(rowEnd, endTime) - currentTime) / timeInterval) + 1;
      for (let i = 0; i < zoneNumber; i++) {
        let value = 0;
        let calTime = currentTime + i * timeInterval;

        if (i == 0) {
          value =
            ((Math.min(currentTime + timeInterval, rowEnd) - Math.max(startTime, rowStart)) *
              row.RESULT_VAL) /
            3600;
        } else if (i == zoneNumber - 1) {
          value =
            (Math.min(rowEnd - currentTime - timeInterval * (zoneNumber - 1), timeInterval) *
              row.RESULT_VAL) /
            3600;
        } else {
          value = (timeInterval * row.RESULT_VAL) / 3600;
        }

        if (value < 0) {
          console.error("arr3 value < 0: ", value);
          console.log("i :", i);
          console.log("zoneNumber :", zoneNumber);
          console.log("currentTime :", currentTime);
          console.log("startTime :", startTime);
          console.log("rowStart :", rowStart);
          console.log("rowEnd :", rowEnd);
          console.log("row.RESULT_VAL :", row.RESULT_VAL);
          console.log(
            "Math.min(currentTime + timeInterval, rowEnd) :",
            Math.min(currentTime + timeInterval, rowEnd)
          );
          console.log("Math.max(startTime, rowStart) :", Math.max(startTime, rowStart));
        }

        let tpnResultArr = [];
        const tpnList = [
          "DEXTROSE_PN",
          "AMINO_ACID_PN",
          "SELENIUM_PN",
          "POTASSIUM_PN",
          "CALCIUM_PN",
          "MAGNESIUM_MEQ",
          "PHOSPHORUS_PN",
          "HEPARIN_PN",
          "RANITIDINE_PN",
          "EXTRA_PHYTONADIONE_PN",
          "SODIUM_PN",
          "CARNITINE_PN",
        ];

        const TPN_UNIT_DICT = {
          DEXTROSE_PN: "g/L",
          AMINO_ACID_PN: "g/L",
          SELENIUM_PN: "mcg/L",
          POTASSIUM_PN: "mEq/L",
          CALCIUM_PN: "mEq/L",
          MAGNESIUM_MEQ: "mEq/L",
          PHOSPHORUS_PN: "mmol/L",
          HEPARIN_PN: "unit/L",
          RANITIDINE_PN: "mg/L",
          EXTRA_PHYTONADIONE_PN: "mg/L",
          SODIUM_PN: "mEq/L",
          CARNITINE_PN: "mg/L",
        };

        tpnList.forEach((element) => {
          let singleResult = {};
          singleResult.name = element;
          singleResult.value = row[element];
          singleResult.unit = TPN_UNIT_DICT[element];
          // if value is 0, won't be pushed
          if (singleResult.value) {
            tpnResultArr.push(singleResult);
          }
        });

        if (!type1Dict[calTime]) {
          type1Dict[calTime] = {
            value: 0,
            Nutrition: {
              value: 0,
              items: [{ value: 0, name: "TPN", items: tpnResultArr }],
            },
          };
        } else if (!type1Dict[calTime].Nutrition) {
          type1Dict[calTime].Nutrition = {
            value: 0,
            items: [{ value: 0, name: "TPN", items: tpnResultArr }],
          };
        } else {
          type1Dict[calTime].Nutrition.items[0].items = tpnResultArr;
        }
        type1Dict[calTime].value += value;
        type1Dict[calTime].Nutrition.value += value;
        type1Dict[calTime].Nutrition.items[0].value += value;
      }
    }
  }

  if (arrLipids && arrLipids.length) {
    console.log("TPN Lipids record size :", arrLipids.length);

    for (let row of arrLipids) {
      let currentTime = startTime;
      if (currentTime + timeInterval <= row.DT_UNIX) {
        // this row record has different time zone with currentTime, setting new currentTime
        currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
      }

      let value = Number(row["RESULT_VAL"]);
      let name = "Lipids";
      let unit = "ml";
      if (!type1Dict[currentTime]) {
        type1Dict[currentTime] = {
          value: 0,
          Nutrition: {
            value: 0,
            items: [{ value, name, unit }],
          },
        };
      } else if (!type1Dict[currentTime].Nutrition) {
        type1Dict[currentTime].Nutrition = {
          value: 0,
          items: [{ value: 0, name, unit }],
        };
      } else if (!type1Dict[currentTime].Nutrition.items.map((x) => x.name).includes("Lipids")) {
        type1Dict[currentTime].Nutrition.items.push({ value, name, unit });
      } else {
        let lipidsItem =
          type1Dict[currentTime].Nutrition.items[
            type1Dict[currentTime].Nutrition.items.map((x) => x.name).indexOf("Lipids")
          ];
        lipidsItem.value += value;
      }
      type1Dict[currentTime].value += value;
      type1Dict[currentTime].Nutrition.value += value;
    }
  }

  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_UNIX": 1524700800, "VOLUME": 2}
      let calTime = startTime;
      let value = row.VOLUME;

      let enList = ["DISPLAY_LINE", "UNIT", "CAL_DEN", "G_PTN_ROW", "G_FAT_ROW", "G_CHO_ROW"];
      let singleResult = {};
      singleResult.name = row["DISPLAY_LINE"];
      singleResult.value = row["VOLUME"];
      singleResult.unit = row["UNIT"];
      singleResult.fat = row["G_FAT_ROW"];
      singleResult.ptn = row["G_PTN_ROW"];
      singleResult.den = row["CAL_DEN"];
      singleResult.cho = row["G_CHO_ROW"];

      // for EN, will combine same name records, for example:
      // {
      //   DISPLAY_LINE: "a",
      //   value: 1,
      //   unit: "mL",
      //   fat: 1,
      //   ptn: 1,
      //   den: 100
      // },
      // {
      //   DISPLAY_LINE: "b",
      //   value: 3,
      //   unit: "mL",
      //   fat: 3,
      //   ptn: 3,
      //   CAL_DEN: 200
      // }
      // => will added to
      // {
      //   DISPLAY_LINE: "b",
      //   value: 4,
      //   unit: "mL",
      //   fat: 4,
      //   ptn: 4,
      //   CAL_DEN: 200
      // }

      if (!type1Dict[calTime]) {
        type1Dict[calTime] = {
          value: 0,
          Nutrition: {
            value: 0,
            items: [{ value: 0, name: "EN", items: [singleResult] }],
          },
        };
      } else if (!type1Dict[calTime].Nutrition) {
        type1Dict[calTime].Nutrition = {
          value: 0,
          items: [{ value: 0, name: "EN", items: [singleResult] }],
        };
      } else if (!type1Dict[calTime].Nutrition.items.map((x) => x.name).includes("EN")) {
        type1Dict[calTime].Nutrition.items.push({ value: 0, name: "EN", items: [singleResult] });
      } else {
        let enItem =
          type1Dict[calTime].Nutrition.items[
            type1Dict[calTime].Nutrition.items.map((x) => x.name).indexOf("EN")
          ].items[0];
        enItem.value += singleResult.value;
        enItem.fat += singleResult.fat;
        enItem.ptn += singleResult.ptn;
        enItem.cho += singleResult.cho;
        enItem.name = singleResult.name;
        enItem.den = singleResult.den;
      }
      type1Dict[calTime].value += value;
      type1Dict[calTime].Nutrition.value += value;
      type1Dict[calTime].Nutrition.items[
        type1Dict[calTime].Nutrition.items.map((x) => x.name).indexOf("EN")
      ].value += value;
    }
  }

  if (arrMed && arrMed.length) {
    console.log("In-Out Intermittent record size :", arrMed.length);
    let currentTime = startTime;

    for (let row of arrMed) {
      //example row = {"DT_UNIX": 1524700800, "DRUG": "dfdf", "INFUSED_VOLUME": "1111", "VOLUME_UNITS": "mL", "ADMIN_ROUTE": "aaa" }
      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      if (currentTime + timeInterval <= row.DT_UNIX) {
        // this row record has different time zone with currentTime, setting new currentTime
        currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
      }

      let value =
        row.VOLUME_UNITS === "mL" ? Number(row.INFUSED_VOLUME) : row.INFUSED_VOLUME * 1000;

      if (!type1Dict[currentTime]) {
        type1Dict[currentTime] = {
          value: 0,
        };
      }

      type1Dict[currentTime].value += value;
      if (!type1Dict[currentTime].Medications) {
        type1Dict[currentTime].Medications = { value: 0 };
      }
      type1Dict[currentTime].Medications.value += value;
      if (!type1Dict[currentTime].Medications.items) {
        type1Dict[currentTime].Medications.items = [];
      }
      type1Dict[currentTime].Medications.items.push({
        time: row.DT_UNIX,
        name: row.DRUG,
        value,
        unit: row.VOLUME_UNITS,
        route: row.ADMIN_ROUTE,
      });
    }
  }

  let inDict = {};
  let outDict = {};
  Object.entries(type1Dict).forEach(([timestampKey, timestampValue]) => {
    inDict[timestampKey] = [];
    Object.entries(timestampValue).forEach(([catKey, catValue]) => {
      if (catKey !== "value") {
        let currentCatDict = {
          name: catKey,
          value: catValue.value,
          unit: UNIT_ML,
          items: [],
        };

        if (catKey === "IVF") {
          let currentIvfNameArray = [];
          catValue.items.forEach((element) => {
            let currentIvfName = EVENT_CD_DICT[element.EVENT_CD].EVENT_CD_DEFINITION;
            if (currentIvfNameArray.includes(currentIvfName)) {
              for (const ivfItem of currentCatDict.items) {
                if (ivfItem.name === currentIvfName) {
                  ivfItem.value += element.RESULT_VAL;
                  break;
                }
              }
            } else {
              currentIvfNameArray.push(currentIvfName);
              let newSingleIvfObj = {
                name: currentIvfName,
                value: element.RESULT_VAL,
                unit: UNIT_ML,
                sub_cat: "IVF",
                label: "IVF",
              };
              currentCatDict.items.push(newSingleIvfObj);
            }
          });
        } else if (catKey === "Nutrition") {
          Object.entries(catValue).forEach(([slKey, slValue]) => {
            if (slKey !== "value") {
              slValue.forEach((element) => {
                let currentSlDict = {
                  name: element.name,
                  value: element.value,
                  unit: UNIT_ML,
                  items: element.items,
                };
                currentCatDict.items.push(currentSlDict);
              });
            }
          });
        } else if (catKey === "Medications") {
          Object.entries(catValue).forEach(([medKey, medValue]) => {
            if (medKey !== "value") {
              medValue.forEach((element) => {
                let currentSlDict = {
                  name: element.name,
                  value: element.value,
                  unit: UNIT_ML,
                  route: element.route,
                };
                currentCatDict.items.push(currentSlDict);
              });
            }
          });
        } else if (catKey === "Infusions" || catKey === "Flushes") {
          currentCatDict.unit = "mL";
          catValue.drugs.forEach((drugDict) => {
            let newDrugDict = {
              name: drugDict.drug,
              value: drugDict.value,
              unit: drugDict.unit,
              diluent: drugDict.diluent,
              rate: drugDict.rate,
              conc: drugDict.conc,
              strength_unit: drugDict.strength_unit,
              vol_unit: drugDict.vol_unit,
            };
            currentCatDict.items.push(newDrugDict);
          });
          currentCatDict.items.sort((a, b) => b.rate - a.rate);
        } else {
          catValue.short_labels.forEach((slDict) => {
            let newSlDict;
            // item name is short label ,if no short label then label, then cat
            if (slDict.short_label) {
              newSlDict = {
                name: slDict.short_label,
                value: slDict.value,
                unit: UNIT_ML,
                sub_cat: slDict.sub_cat,
                label: slDict.label,
              };
            } else if (slDict.label) {
              newSlDict = {
                name: slDict.label,
                value: slDict.value,
                unit: UNIT_ML,
                sub_cat: slDict.sub_cat,
                label: slDict.label,
              };
            } else {
              newSlDict = {
                name: catKey,
                value: slDict.value,
                unit: UNIT_ML,
                sub_cat: slDict.sub_cat,
              };
            }

            currentCatDict.items.push(newSlDict);
          });
        }
        inDict[timestampKey].push(currentCatDict);
      }
    });
  });

  Object.entries(type2Dict).forEach(([timestampKey, timestampValue]) => {
    outDict[timestampKey] = [];
    Object.entries(timestampValue).forEach(([catKey, catValue]) => {
      if (catKey !== "value") {
        let currentCatDict = {
          name: catKey,
          value: catValue.value,
          unit: UNIT_ML, // see talbe intake_output
          items: [],
        };

        catValue.short_labels.forEach((slDict) => {
          let newSlDict;
          // item name is short label ,if no short label then label, then cat
          if (slDict.short_label) {
            newSlDict = {
              name: slDict.short_label,
              value: slDict.value,
              unit: UNIT_ML,
              sub_cat: slDict.sub_cat,
              label: slDict.label,
            };
          } else if (slDict.label) {
            newSlDict = {
              name: slDict.label,
              value: slDict.value,
              unit: UNIT_ML,
              sub_cat: slDict.sub_cat,
              label: slDict.label,
            };
          } else {
            newSlDict = {
              name: catKey,
              value: slDict.value,
              unit: UNIT_ML,
              sub_cat: slDict.sub_cat,
            };
          }

          currentCatDict.items.push(newSlDict);
        });
        outDict[timestampKey].push(currentCatDict);
      }
    });
  });

  // Order api/inout-tooltip-v2 by CAT_ORDER_ARRAY #15
  for (const ts in inDict) {
    inDict[ts].sort((a, b) => CAT_ORDER_ARRAY.indexOf(a.name) - CAT_ORDER_ARRAY.indexOf(b.name));
  }
  for (const ts in outDict) {
    outDict[ts].sort((a, b) => CAT_ORDER_ARRAY.indexOf(a.name) - CAT_ORDER_ARRAY.indexOf(b.name));
  }

  return [inDict, outDict];
}

function _updateRowToDict(currentTime, row, dict) {
  let io_calcs = EVENT_CD_DICT[row.EVENT_CD].IO_CALCS;
  let newValue = io_calcs == "2" ? -1 * row.RESULT_VAL : row.RESULT_VAL;
  let newCat = EVENT_CD_DICT[row.EVENT_CD].IO_CAT;
  let newShortLabel = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;


  if (!(currentTime in dict)) {
    dict[currentTime] = { value: 0 };
  }
  if (!(newCat in dict[currentTime])) {
    dict[currentTime][newCat] = { value: 0, short_labels: [] };
  }
  dict[currentTime].value += newValue;
  dict[currentTime][newCat].value += newValue;

  if (newCat === "IVF") {
    if (!dict[currentTime].IVF.items) {
      dict[currentTime].IVF.items = [];
    }
    dict[currentTime].IVF.items.push(row);
  } else {
    let isNewSlInDict = false;
    for (let i = 0; i < dict[currentTime][newCat].short_labels.length; i++) {
      if (dict[currentTime][newCat].short_labels[i].short_label == newShortLabel) {
        dict[currentTime][newCat].short_labels[i].value += newValue;
        isNewSlInDict = true;
        break;
      }
    }

    if (!isNewSlInDict) {
      let singleResult = {};
      singleResult.short_label = newShortLabel;
      singleResult.value = newValue;
      singleResult.sub_cat = EVENT_CD_DICT[row.EVENT_CD].Subcat;
      singleResult.label = EVENT_CD_DICT[row.EVENT_CD].LABEL;
      if (dict[currentTime][newCat].short_labels.length == 0) {
        dict[currentTime][newCat].short_labels.push(singleResult);
      } else {
        dict[currentTime][newCat].short_labels.splice(
          binarySearch(dict[currentTime][newCat].short_labels, singleResult, comp),
          0,
          singleResult
        );
      }
    }
  } 
  return dict;
}

function binarySearch(ar, el, compare_fn) {
  if (compare_fn(ar[0].short_label, el.short_label)) {
    return 0;
  }
  if (compare_fn(el.short_label, ar[ar.length - 1].short_label)) {
    return ar.length;
  }

  var m = 0;
  var n = ar.length - 1;
  while (m <= n) {
    var k = (n + m) >> 1;
    var cmp = compare_fn(el.short_label, ar[k].short_label);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

function comp(a, b) {
  return SL_ORDER_ARRAY.indexOf(a) > SL_ORDER_ARRAY.indexOf(b);
}

async function parallelQuery(conn, query) {
  // should parallel do the sql query
  const task1 = await inOutEventTooltipQuerySQLExecutor(conn, query);
  const task2 = await inOutDiluentsTooltipQuerySQLExecutor(conn, query);
  const task3 = await tpnQuerySQLExecutor(conn, query);
  const task4 = await enQuerySQLExecutor(conn, query);
  const task5 = await lipidsQuerySQLExecutor(conn, query);
  const task6 = await medVolQuerySQLExecutor(conn, query);

  return {
    arr1: await task1,
    arr2: await task2,
    arr3: await task3,
    arrEN: await task4,
    arrLipids: await task5,
    arrMed: await task6,
  };
}

/**
 * query:
 * {
    "person_id": 11111111,
    "from":3600,   //optional
    "to":7200,     //optional
    "resolution":3600    //optional
}

 * @param {*} conn 
 * @param {*} query 
 */
const getInOutTooltipQueryV3 = database.withConnection(async function (conn, query) {
  let consoleTimeCount = timeLable++;
  console.time("getInOutTooltip" + consoleTimeCount);
  let rawResult = await parallelQuery(conn, query);
  let result = _calculateRawRecords(rawResult, query[RESOLUTION], query[FROM], query[TO]);
  console.timeEnd("getInOutTooltip" + consoleTimeCount);
  return result;
});

module.exports = {
  getInOutTooltipQueryV3,
};
