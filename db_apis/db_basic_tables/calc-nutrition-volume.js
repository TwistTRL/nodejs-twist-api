/*
 * @Author: Peng
 * @Date: 2020-04-01 17:31:22
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-17 15:14:08
 */

const moment = require("moment");
const { bisect_left } = require("bisect-js");
const { EVENT_CD_DICT } = require("../../db_relation/in-out-db-relation");

const calculateNutriVolume = (rawRecords) => {
  // get hour binned data
  let { arrTPN, arrTpnLipid, arrEN, arrDiluents, arrInout, arrMed, arrWeight, resolution, from } = rawRecords;
  let retDict = {};

  console.log('resolution :', resolution);
console.log('from :', from);
console.log('arrTPN.length :', arrTPN.length);
console.log('arrEN.length :', arrEN.length);
  if (arrTPN && arrTPN.length) {
    // TPN database is already binned by hour
    console.log("Tpn record size :", arrTPN.length);
    for (let row of arrTPN) {
      //example row = {"START_UNIX": 1524700800, "Amino_Acids g/kg": 2}
      let start = row["START_UNIX"];
      let end = row["END_UNIX"];
      if (start >= end) {
        // console.warn("TPN row error start/end time:", row);
        continue;
      }
      if (start && end && row["RESULT_VAL"]) {
        let timestamp = Math.floor(start / 3600) * 3600;
        if (timestamp - start) {
          if (timestamp - Math.floor((end - 1) / 3600) * 3600) {
            // console.log('TPN row has abnormal start/end time :', row);
          }
        }
        let tpn = row["RESULT_VAL"] / getWeight(timestamp, arrWeight);
        accValueToDict(tpn, timestamp, "TPN", retDict);
      } else if (!start || !end) {
        console.log("TPN start or end time null :", row);
      }
    }
  }

  if (arrTpnLipid && arrTpnLipid.length) {
    // TPN database is already binned by hour
    console.log("TpnLipid record size :", arrTpnLipid.length);
    for (let row of arrTpnLipid) {
      let timestamp = Math.floor(row["DT_UNIX"] / 3600) * 3600;
      if (timestamp && row["RESULT_VAL"]) {
        let tpnlipid = row["RESULT_VAL"] / getWeight(timestamp, arrWeight);
        accValueToDict(tpnlipid, timestamp, "LIPIDS", retDict);
      }
    }
  }

  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_DTUNIX": 1524700800, "VOLUME": 2}
      let timestamp = Math.floor(row["START_TIME_DTUNIX"] / 3600) * 3600;
      if (timestamp && row["VOLUME"]) {
        let feeds = row["VOLUME"] / getWeight(timestamp, arrWeight);
        accValueToDict(feeds, timestamp, "FEEDS", retDict);
      }
    }
  }

  if (arrMed && arrMed.length) {
    console.log("Med record size :", arrMed.length);
    for (let row of arrMed) {
      // DT_UNIX,  INFUSED_VOLUME
      let timestamp = Math.floor(row["DT_UNIX"] / 3600) * 3600;
      if (timestamp && row["INFUSED_VOLUME"]) {
        let medications = row["INFUSED_VOLUME"] / getWeight(timestamp, arrWeight);
        accValueToDict(medications, timestamp, "MEDICATIONS", retDict);
      }
    }
  }

  if (arrDiluents && arrDiluents.length) {
    console.log("arrDiluents record size :", arrDiluents.length);
    for (let row of arrDiluents) {
      // START_UNIX,  END_UNIX,  DRUG,  DILUENT,  INFUSION_RATE,  INFUSION_RATE_UNITS
      // the unit of rate is mL/hr, since this volume API we binned by hour, the rate stands for "mL"
      let start = row["START_UNIX"];
      let end = row["END_UNIX"];
      let rate = row["INFUSION_RATE"] / row["DOSING_WEIGHT"];
      let drugName = row["DRUG"];

      if (start && end && row["INFUSION_RATE"] && end > start) {
        let startTimestamp = Math.floor(start / 3600) * 3600;
        let binNumber = Math.ceil(end / 3600) - Math.floor(start / 3600);

        // calculate value for each bin
        // 1. binNumber == 1, `start` to `end`
        // 2. binNumber == 2, left value is `start` to left bin end, right value is right bin start to `end`
        // 3. binNumber == 3, first bin: left value, last bin: right value, middle others: all equal rate
        if (binNumber === 1) {
          let value = (rate * (end - start)) / 3600;
          accDiluentsVolumeToDict(drugName, value, startTimestamp, retDict);
        } else if (binNumber === 2) {
          let leftValue = (rate * (startTimestamp + 3600 - start)) / 3600;
          let rightValue = (rate * (end - startTimestamp - 3600)) / 3600;

          accDiluentsVolumeToDict(drugName, leftValue, startTimestamp, retDict);
          accDiluentsVolumeToDict(drugName, rightValue, startTimestamp + 3600, retDict);
        } else {
          for (let i = 0; i < binNumber; i++) {
            let timestamp = startTimestamp + 3600 * i;
            if (i === 0) {
              let leftValue = (rate * (startTimestamp + 3600 - start)) / 3600;
              accDiluentsVolumeToDict(drugName, leftValue, timestamp, retDict);
            } else if (i === binNumber - 1) {
              let rightValue = (rate * (end - startTimestamp - 3600 * i)) / 3600;
              accDiluentsVolumeToDict(drugName, rightValue, timestamp, retDict);
            } else {
              accDiluentsVolumeToDict(drugName, rate, timestamp, retDict);
            }
          }
        }
      } else {
        console.warn("error: on start/end/rate for this row :", row);
      }
    }
  }

  if (arrInout && arrInout.length) {
    console.log("InOut record size :", arrInout.length);
    for (let row of arrInout) {
      // DT_UNIX,  EVENT_CD,  VALUE
      let timestamp = Math.floor(row["DT_UNIX"] / 3600) * 3600;
      if (timestamp > 0 && row["VALUE"]) {
        let inout = row["VALUE"] / getWeight(timestamp, arrWeight);
        if (EVENT_CD_DICT[row["EVENT_CD"]]["IO_CAT"] === "IVF") {
          accValueToDict(inout, timestamp, "IVF", retDict);
        } else if (EVENT_CD_DICT[row["EVENT_CD"]]["IO_CAT"] === "BLOOD PRODUCT") {
          accValueToDict(inout, timestamp, "BLOOD PRODUCT", retDict);
        }
      }
    }
  }

  console.log('Object.keys(retDict).length :', Object.keys(retDict).length);

  // transfer hourly binned retDict to retArr with resolution
  // [{
  //   "timestamp": 1543251600,
  //   "TPN": 1,
  //   "LIPIDS": 1,
  //   "MEDICATIONS": 1,
  //   "INFUSIONS": 1,
  //   "FLUSHES": 1,
  //   "FEEDS": 1,
  //   "IVF": 1,
  //   "BLOOD PRODUCT": 1
  // },...]

  let retDictWithResolution = {};
  let isStartDST = moment(from * 1000).isDST();
  let isPreDST = isStartDST;
  let preTS = from;
  let binnedTs = from;

  if (resolution === 1) {
    console.log("binned by days, considering DST");
    console.log("isStartDST :", isStartDST);
  }

  for (let timestamp in retDict) {
    if (timestamp >= from) {
      if (resolution !== 1) {
        binnedTs = Math.floor((Number(timestamp) - from) / resolution) * resolution + from;
      } else {
        // resolution is 1 day, considering DST
        const SEC_OF_DAY = 24 * 3600;
        let isCurrentDST = moment(timestamp * 1000).isDST();
        if (isStartDST === isCurrentDST) {
          // start and now are the same
          binnedTs = Math.floor((Number(timestamp) - from) / SEC_OF_DAY) * SEC_OF_DAY + from;
        } else if (isStartDST && !isCurrentDST) {
          binnedTs =
            Math.floor((Number(timestamp) - from - 3600) / SEC_OF_DAY) * SEC_OF_DAY + from + 3600;
          // DST entering non-DST
          if (isPreDST && binnedTs - 3600 === preTS) {
            binnedTs -= 3600;
          }
        } else if (!isStartDST && isCurrentDST) {
          binnedTs =
            Math.floor((Number(timestamp) - from + 3600) / SEC_OF_DAY) * SEC_OF_DAY + from - 3600;
          // non-DST entering DST
          if (!isPreDST && binnedTs + 3600 === preTS) {
            binnedTs += 3600;
          }
        }
        // new binnedTS, update preTS and isPreDST
        if (binnedTs !== preTS) {
          preTS = binnedTs;
          isPreDST = isCurrentDST;
        }
      }

      if (binnedTs in retDictWithResolution) {
        if (retDict[timestamp].FEEDS) {
          retDictWithResolution[binnedTs]["FEEDS"] =
            retDict[timestamp].FEEDS + (retDictWithResolution[binnedTs]["FEEDS"] || 0);
        }
        if (retDict[timestamp].TPN) {
          retDictWithResolution[binnedTs]["TPN"] =
            retDict[timestamp].TPN + (retDictWithResolution[binnedTs]["TPN"] || 0);
        }
        if (retDict[timestamp].LIPIDS) {
          retDictWithResolution[binnedTs]["LIPIDS"] =
            retDict[timestamp].LIPIDS + (retDictWithResolution[binnedTs]["LIPIDS"] || 0);
        }
        if (retDict[timestamp].MEDICATIONS) {
          retDictWithResolution[binnedTs]["MEDICATIONS"] =
            retDict[timestamp].MEDICATIONS + (retDictWithResolution[binnedTs]["MEDICATIONS"] || 0);
        }
        if (retDict[timestamp].INFUSIONS) {
          retDictWithResolution[binnedTs]["INFUSIONS"] =
            retDict[timestamp].INFUSIONS + (retDictWithResolution[binnedTs]["INFUSIONS"] || 0);
        }
        if (retDict[timestamp].FLUSHES) {
          retDictWithResolution[binnedTs]["FLUSHES"] =
            retDict[timestamp].FLUSHES + (retDictWithResolution[binnedTs]["FLUSHES"] || 0);
        }
        if (retDict[timestamp].IVF) {
          retDictWithResolution[binnedTs]["IVF"] =
            retDict[timestamp].IVF + (retDictWithResolution[binnedTs]["IVF"] || 0);
        }
        if (retDict[timestamp]["BLOOD PRODUCT"]) {
          retDictWithResolution[binnedTs]["BLOOD PRODUCT"] =
            retDict[timestamp]["BLOOD PRODUCT"] +
            (retDictWithResolution[binnedTs]["BLOOD PRODUCT"] || 0);
        }
      } else {
        retDictWithResolution[binnedTs] = {};
        if (retDict[timestamp].FEEDS) {
          retDictWithResolution[binnedTs]["FEEDS"] = retDict[timestamp].FEEDS;
        }
        if (retDict[timestamp].TPN) {
          retDictWithResolution[binnedTs]["TPN"] = retDict[timestamp].TPN;
        }
        if (retDict[timestamp].LIPIDS) {
          retDictWithResolution[binnedTs]["LIPIDS"] = retDict[timestamp].LIPIDS;
        }
        if (retDict[timestamp].MEDICATIONS) {
          retDictWithResolution[binnedTs]["MEDICATIONS"] = retDict[timestamp].MEDICATIONS;
        }
        if (retDict[timestamp].INFUSIONS) {
          retDictWithResolution[binnedTs]["INFUSIONS"] = retDict[timestamp].INFUSIONS;
        }
        if (retDict[timestamp].FLUSHES) {
          retDictWithResolution[binnedTs]["FLUSHES"] = retDict[timestamp].FLUSHES;
        }
        if (retDict[timestamp].IVF) {
          retDictWithResolution[binnedTs]["IVF"] = retDict[timestamp].IVF;
        }
        if (retDict[timestamp]["BLOOD PRODUCT"]) {
          retDictWithResolution[binnedTs]["BLOOD PRODUCT"] = retDict[timestamp]["BLOOD PRODUCT"];
        }
      }
    }
  }

  console.log('Object.keys(retDictWithResolution).length :', Object.keys(retDictWithResolution).length);

  // dictionary to sorted array
  let retArr = [];
  for (let timestamp in retDictWithResolution) {
    let curObj = { timestamp: Number(timestamp), ...retDictWithResolution[timestamp] };
    retArr.push(curObj);
  }
  console.log("return array length :", retArr.length);
  return retArr.sort((a, b) => a.timestamp - b.timestamp);
};

const getWeight = (timestamp, arrWeight) => {
  let index = bisect_left(arrWeight, timestamp, (x) => x["DT_UNIX"]);
  if (index < 0) {
    console.log("at timestamp has no weight:", timestamp);
    return arrWeight[0]["WEIGHT_CALC"];
  } else {
    return arrWeight[index]["WEIGHT_CALC"];
  }
};

const accValueToDict = (value, catKey, childKey, dict) => {
  if (catKey in dict) {
    if (childKey in dict[catKey]) {
      dict[catKey][childKey] += value;
    } else {
      dict[catKey][childKey] = value;
    }
  } else {
    dict[catKey] = {};
    dict[catKey][childKey] = value;
  }
};

const accDiluentsVolumeToDict = (drugName, value, timestamp, dict) => {
  if (drugName === "papavarine" || drugName === "heparin flush") {
    accValueToDict(value, timestamp, "FLUSHES", dict);
  } else {
    accValueToDict(value, timestamp, "INFUSIONS", dict);
  }
};

module.exports = {
  calculateNutriVolume,
};
