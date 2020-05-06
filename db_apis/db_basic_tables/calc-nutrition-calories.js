/*
 * @Author: Peng
 * @Date: 2020-04-06 11:14:32
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-17 13:12:48
 */

const moment = require("moment");
const { bisect_left } = require("bisect-js");

const TPN_LIPID_RATIO = 0.2; //20% lipid, which is 0.2 grams fat/mL
const DEXTROSE_DICT = {
  "Dextrose 5% in Water": 0.05,
  "Dextrose 30% in Water": 0.3,
  "Dextrose 10% in Water": 0.1,
  "Dextrose 40% in Water": 0.4,
  "Dextrose 25% in Water": 0.25,
  "Dextrose 12.5% in Water": 0.125,
  "Dextrose 10% with 0.2% NaCl": 0.1,
  "Dextrose 5% in Lactated Ringers Injection": 0.05,
  "Dextrose 15% in Water": 0.15,
  "Dextrose 5% with 0.225% NaCl": 0.05,
  "Dextrose 20% in Water": 0.2,
  "Dextrose 5% with 0.9% NaCl": 0.05,
  "Dextrose 5% with 0.45% NaCl": 0.05,
  "Dextrose 10% with 0.9% NaCl": 0.1,
  "Dextrose 7.5% in Water": 0.075,
  "Dextrose 17.5% in Water": 0.175,
  "Dextrose 2.5% in Water": 0.025,
};


const AA_CALORIES = 4;
const DEX_CALORIES = 3.4;
const FAT_CALORIES = 9;

const calculateNutriCalories = (rawRecords) => {
  // get hour binned data
  let { arrEN, arrTPN, arrLipids, arrDiluents, arrWeight, resolution, from } = rawRecords;
  let retDict = {};

  if (arrTPN && arrTPN.length) {
    // TPN database is already binned by hour
    console.log("TpnNutr record size :", arrTPN.length);
    for (let row of arrTPN) {
      //example row = {"START_UNIX": 1524700800, "Amino_Acids g/kg": 2}
      let start = row["START_UNIX"];
      let end = row["END_UNIX"];
      if (start >= end) {
        // console.warn("TPN row error start/end time:", row);
        continue;
      }
      if (start && end) {
        let timestamp = Math.floor(start / 3600) * 3600;
        if (timestamp - start) {
          if (timestamp - Math.floor((end - 1) / 3600) * 3600) {
            // console.log('TPN row has abnormal start/end time :', row);
          }
        }
        // calories calculation for TPN
        let caloriesTPN =
          (row["Amino_Acids g/kg"] || 0) * AA_CALORIES + (row["Dextrose g/kg"] || 0) * DEX_CALORIES;
        accValueToDict(caloriesTPN, timestamp, "TPN", retDict);
      } else {
        console.log("TPN start or end time null :", row);
      }
    }
  }

  if (arrLipids && arrLipids.length) {
    console.log("TpnLipid record size :", arrLipids.length);
    for (let row of arrLipids) {
      let timestamp = Math.floor(row["DT_UNIX"] / 3600) * 3600;
      if (timestamp && row["RESULT_VAL"]) {
        let fatValue = (row["RESULT_VAL"] * TPN_LIPID_RATIO) / getWeight(timestamp, arrWeight);
        let caloriesLipid = fatValue * FAT_CALORIES;
        accValueToDict(caloriesLipid, timestamp, "LIPIDS", retDict);
      }
    }
  }

  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_UNIX": 1524700800, "VOLUME": 2}
      let timestamp = Math.floor(row["START_TIME_UNIX"] / 3600) * 3600;
      if (timestamp && row["VOLUME"]) {
        // calories calculation for EN
        let feeds = (row["VOLUME"] * row["CAL_DEN"]) / (30 * getWeight(timestamp, arrWeight));
        accValueToDict(feeds, timestamp, "FEEDS", retDict);
      }
    }
  }

  if (arrDiluents && arrDiluents.length) {
    console.log("DiluNutr record size :", arrDiluents.length);
    for (let row of arrDiluents) {
      if (row["DILUENT"] in DEXTROSE_DICT) {
        // normalized rate: 'Dextrose 10% in Water' means rate * 0.1
        // divided by most recent weight then * 3.4 for dextrose g to kCal
        let rate =
          (row["INFUSION_RATE"] * DEXTROSE_DICT[row["DILUENT"]] * DEX_CALORIES) /
          row["DOSING_WEIGHT"];
        let start = row["START_UNIX"];
        let end = row["END_UNIX"];
        let drugName = row["DRUG"];
        if (start && end && rate && end > start) {
          let startTimestamp = Math.floor(start / 3600) * 3600;
          let binNumber = Math.ceil(end / 3600) - Math.floor(start / 3600);

          // calculate value for each bin
          // 1. binNumber == 1, `start` to `end`
          // 2. binNumber == 2, left value is `start` to left bin end, right value is right bin start to `end`
          // 3. binNumber == 3, first bin: left value, last bin: right value, middle others: all equal rate
          if (binNumber === 1) {
            let value = (rate * (end - start)) / 3600;
            accDiluentsCaloriesToDict(drugName, value, startTimestamp, retDict);
          } else if (binNumber === 2) {
            let leftValue = (rate * (startTimestamp + 3600 - start)) / 3600;
            accDiluentsCaloriesToDict(drugName, leftValue, startTimestamp, retDict);
            let rightValue = (rate * (end - startTimestamp - 3600)) / 3600;
            accDiluentsCaloriesToDict(drugName, rightValue, startTimestamp + 3600, retDict);
          } else {
            for (let i = 0; i < binNumber; i++) {
              let timestamp = startTimestamp + 3600 * i;
              if (i === 0) {
                let leftValue = (rate * (startTimestamp + 3600 - start)) / 3600;
                accDiluentsCaloriesToDict(drugName, leftValue, timestamp, retDict);
              } else if (i === binNumber - 1) {
                let rightValue = (rate * (end - startTimestamp - 3600 * i)) / 3600;
                accDiluentsCaloriesToDict(drugName, rightValue, timestamp, retDict);
              } else {
                accDiluentsCaloriesToDict(drugName, rate, timestamp, retDict);
              }
            }
          }
        } else {
          console.warn("error: on start/end/rate for this row :", row);
        }
      } else if (row["DILUENT"].includes("Dextrose")) {
        console.warn("error: Dextrose key not in list: ", row);
      }
    }
  }

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
          binnedTs = Math.floor((Number(timestamp) - from - 3600) / SEC_OF_DAY) * SEC_OF_DAY + from + 3600;
          // DST entering non-DST
          if (isPreDST && binnedTs - 3600 === preTS) {
            binnedTs -= 3600;
          }
        } else if (!isStartDST && isCurrentDST) {
          binnedTs = Math.floor((Number(timestamp) - from + 3600) / SEC_OF_DAY) * SEC_OF_DAY + from - 3600;
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
        if (retDict[timestamp].INFUSIONS) {
          retDictWithResolution[binnedTs]["INFUSIONS"] =
            retDict[timestamp].INFUSIONS + (retDictWithResolution[binnedTs]["INFUSIONS"] || 0);
        }
        if (retDict[timestamp].FLUSHES) {
          retDictWithResolution[binnedTs]["FLUSHES"] =
            retDict[timestamp].FLUSHES + (retDictWithResolution[binnedTs]["FLUSHES"] || 0);
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
        if (retDict[timestamp].INFUSIONS) {
          retDictWithResolution[binnedTs]["INFUSIONS"] = retDict[timestamp].INFUSIONS;
        }
        if (retDict[timestamp].FLUSHES) {
          retDictWithResolution[binnedTs]["FLUSHES"] = retDict[timestamp].FLUSHES;
        }
      }
    }
  }

  // dictionary to sorted array
  let retArr = [];
  for (let timestamp in retDictWithResolution) {
    let curObj = { timestamp: Number(timestamp), ...retDictWithResolution[timestamp] };
    retArr.push(curObj);
  }
  console.log("return array length :", retArr.length);
  return retArr.sort((a, b) => a.timestamp - b.timestamp);
}

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

const accDiluentsCaloriesToDict = (drugName, value, timestamp, dict) => {
  if (drugName === "papavarine" || drugName === "heparin flush") {
    accValueToDict(value, timestamp, "FLUSHES", dict);
  } else {
    accValueToDict(value, timestamp, "INFUSIONS", dict);
  }
};

module.exports = {
  calculateNutriCalories,
};
