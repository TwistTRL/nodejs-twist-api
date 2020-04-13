/*
 * @Author: Peng 
 * @Date: 2020-04-09 12:08:48 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-09 23:26:45
 */


 /**
  * arrInOut from table `INTAKE_OUTPUT`,
  * arrDiluents from table `DRUG_DILUENTS`,
  * arrTPN from table `TPN`,
  * arrEN from table `EN`,
  * arrLipids from table `TPN_LIPIDS` 
  * 
  */

const {
  EVENT_CD_DICT,
  SL_TO_LABEL,
  SL_TO_SUBCAT,
  SL_TO_CAT,
  SL_TO_CALCS,
  IN_OUT_COLOR_MAP,
  CAT_CAP_TO_LOWER_MAP
} = require("../../db_relation/in-out-db-relation");


const calculateIO = (rawRecords, query) => {
  let { arrEN, arrTPN, arrLipids, arrInOut, arrDiluents } = rawRecords;
  let timeInterval = query.resolution;
  let startTime = query.from;
  let endTime = query.to;

  let resultEvent = [];
  if (arrInOut && arrInOut.length) {
    console.log("In-Out Event record size :", arrInOut.length);
    let countValue0 = 0;
    let countType0 = 0;
    let currentSameTimeArray = [];
    let currentTime = Math.floor(arrInOut[0].DT_UNIX / timeInterval) * timeInterval;

    for (let row of arrInOut) {
      //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "VALUE": 0.9}
      let io_calcs = EVENT_CD_DICT[row.EVENT_CD].IO_CALCS;

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      //if current DISPLAY_IO != '1', skip it
      if (EVENT_CD_DICT[row.EVENT_CD].DISPLAY_IO != "1") {
        continue;
      }

      if (!row.VALUE) {
        countValue0++;
        continue;
      }

      if (io_calcs != 1 && io_calcs != 2) {
        countType0++;
        continue;
      }

      //if current SHORT_LABEL == '', and if timeInterval == 3600 (seconds in 1 hour), push it directly to resultEvent
      row.SHORT_LABEL = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;
      if (row.SHORT_LABEL == "" && timeInterval == 3600 && row.VALUE) {
        let singleType0Result = {};
        singleType0Result.value = row.VALUE;
        singleType0Result.short_label = EVENT_CD_DICT[row.EVENT_CD].SHORT_LABEL;
        singleType0Result.time = currentTime;
        singleType0Result.type = io_calcs;
        resultEvent.push(singleType0Result);
        continue;
      }

      // first item or new array
      if (currentSameTimeArray.length == 0) {
        currentSameTimeArray.push(row);
        currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
        continue;
      }

      // if same time with previous record, combine to category
      if (currentTime + timeInterval > row.DT_UNIX) {
        currentSameTimeArray.push(row);
        continue;
      }

      // if not same time, push the calculated previous array and start with this new one
      let combinedSameTimeArray = handelSameTimeArray(
        currentSameTimeArray,
        currentTime,
        timeInterval
      );
      resultEvent.push(...combinedSameTimeArray);
      currentSameTimeArray = [];
      currentSameTimeArray.push(row);
      currentTime = Math.floor(row.DT_UNIX / timeInterval) * timeInterval;
    }

    if (currentSameTimeArray.length != 0) {
      let combinedSameTimeArray = handelSameTimeArray(
        currentSameTimeArray,
        currentTime,
        timeInterval
      );
      resultEvent.push(...combinedSameTimeArray);
    }
    console.log("In-Out Event records with 0/null value count: ", countValue0);
    console.log("In-Out Event records with type `0` count: ", countType0);

    // console.log('resultEvent :', resultEvent);
  }

  //example arrDiluents[indexArr2] = {
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

  let timeFlushDict = {};
  let timeDripsDict = {};
  if (arrDiluents && arrDiluents.length) {
    console.log("In-Out Diluents record size :", arrDiluents.length);

    for (let row of arrDiluents) {
      //example row = {"START_UNIX": 1524700800, "END_UNIX": "1524736800", "DRUG": "drug", "DILUENT": "aaa", "INFUSION_RATE": 0.9 .... }
      //(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES
      let currentTime =
        Math.floor(Math.max(row.START_UNIX, startTime) / timeInterval) *
        timeInterval;

      // console.log('row.START_UNIX :', row.START_UNIX);
      // console.log('startTime :', startTime);

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      let zoneNumber =
        Math.floor(
          (Math.min(row.END_UNIX, endTime) - currentTime) / timeInterval
        ) + 1;
      for (let i = 0; i < zoneNumber; i++) {
        let singleResult = {};
        let value = 0;
        let cTime = currentTime + i * timeInterval;
        // if (i == 0) {
        //   value = (Math.min(currentTime + timeInterval, row.END_UNIX) - row.START_UNIX) * row.INFUSION_RATE / 3600;
        // } else if (i == zoneNumber - 1) {
        //   value = (row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1)) * row.INFUSION_RATE / 3600;
        // } else {
        //   value = timeInterval * row.INFUSION_RATE / 3600;
        // }

        if (i == 0) {
          value =
            ((Math.min(currentTime + timeInterval, row.END_UNIX) -
              Math.max(startTime, row.START_UNIX)) *
              row.INFUSION_RATE) /
            3600;
          // let value1 =
          //   ((Math.min(currentTime + timeInterval, row.END_UNIX) -
          //     row.START_UNIX) *
          //     row.INFUSION_RATE) /
          //   3600;
          // if (value1 != value) {
          //   console.log("value1 :", value1);
          //   console.log('value :', value);
          // }
        } else if (i == zoneNumber - 1) {
          value =
            (Math.min(
              row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1),
              timeInterval
            ) *
              row.INFUSION_RATE) /
            3600;
          // let value2 =
          //   ((row.END_UNIX - currentTime - timeInterval * (zoneNumber - 1)) *
          //     row.INFUSION_RATE) /
          //   3600;
          // if (value2 != value) {
          //   console.log("value2 :", value2);
          // }
        } else {
          value = (timeInterval * row.INFUSION_RATE) / 3600;
        }

        if (value <= 0) {
          console.log("error value <= 0: ", value);
        }

        if (row.DRUG == "papavarine" || row.DRUG == "heparin flush") {
          // `Flushes`, write to timeFlushDict, key is start time of each binned time box
          // {1524700800: {singleResult}, ...}

          if (cTime in timeFlushDict) {
            timeFlushDict[cTime].value += value;
          } else {
            //FLUSHES	FLUSHES	FLUSH	FLUSH
            singleResult.value = value;
            singleResult.short_label = "Flushes";
            singleResult.time = cTime;
            singleResult.type = "1";
            timeFlushDict[singleResult.time] = singleResult;
          }
        } else {
          // `Infusions`, write to timeDripsDict, key is start time of each binned time box

          if (cTime in timeDripsDict) {
            timeDripsDict[cTime].value += value;
          } else {
            //INFUSIONS	INFUSIONS	DRIPS	DRIPS
            singleResult.value = value;
            singleResult.short_label = "Infusions";
            singleResult.time = cTime;
            singleResult.type = "1";
            timeDripsDict[singleResult.time] = singleResult;
          }
        }
      }
    }
  }
  //example arrTPN[indexArr3] = {
  // START_UNIX
  // EVENT_TAG
  // RESULT_VAL
  // END_UNIX}
  let timeTPNDict = {};

  if (arrTPN && arrTPN.length) {
    console.log("TPN record size :", arrTPN.length);

    for (let row of arrTPN) {
      //example row = {"START_UNIX": 1524700800, "END_UNIX": "1524736800", "DRUG": "drug", "DILUENT": "aaa", "INFUSION_RATE": 0.9 .... }
      //(DRUG = 'papavarine' OR DRUG = 'heparin flush') : FLUSHES

      let rowStart = row.START_UNIX;
      let rowEnd = row.END_UNIX + 1;

      let currentTime =
        Math.floor(Math.max(row.START_UNIX, startTime) / timeInterval) *
        timeInterval;

      // console.log('row.START_UNIX :', row.START_UNIX);
      // console.log('startTime :', startTime);

      // end when larger than endTime
      if (currentTime > endTime) {
        break;
      }

      let zoneNumber =
        Math.floor((Math.min(rowEnd, endTime) - currentTime) / timeInterval) +
        1;
      for (let i = 0; i < zoneNumber; i++) {
        let singleResult = {};
        let value = 0;
        let cTime = currentTime + i * timeInterval;

        if (i == 0) {
          value =
            ((Math.min(currentTime + timeInterval, rowEnd) -
              Math.max(startTime, row.START_UNIX)) *
              row.RESULT_VAL) /
            3600;
          let value1 =
            ((Math.min(currentTime + timeInterval, rowEnd) - row.START_UNIX) *
              row.RESULT_VAL) /
            3600;
          if (value1 != value) {
            console.log("value1 :", value1);
          }
        } else if (i == zoneNumber - 1) {
          value =
            (Math.min(
              rowEnd - currentTime - timeInterval * (zoneNumber - 1),
              timeInterval
            ) *
              row.RESULT_VAL) /
            3600;
          let value2 =
            ((rowEnd - currentTime - timeInterval * (zoneNumber - 1)) *
              row.RESULT_VAL) /
            3600;
          if (value2 != value) {
            console.log("value2 :", value2);
          }
        } else {
          value = (timeInterval * row.RESULT_VAL) / 3600;
        }

        if (value < 0) {
          console.log("error value <= 0: ", value);
        }

        // if (value == 0 && row.RESULT_VAL != 0) {
        //   console.log('row.RESULT_VAL :', row.RESULT_VAL);

        // }

        if (cTime in timeTPNDict) {
          timeTPNDict[cTime].value += value;
        } else {
          singleResult.value = value;
          singleResult.short_label = "TPN";
          singleResult.time = cTime;
          singleResult.type = "1";
          timeTPNDict[singleResult.time] = singleResult;
        }
      }
    }
  }


  let timeLipidsDict = {};
  if (arrLipids && arrLipids.length) {
    console.log("Lipids record size :", arrLipids.length);
    for (let row of arrLipids) {
      //example row = {"DT_UNIX": 1524700800, "RESULT_VAL": 2}
      let currentTime =
        Math.floor(Math.max(row.DT_UNIX, startTime) / timeInterval) *
        timeInterval;

      let singleResult = {};
      let value = Number(row.RESULT_VAL);

      if (currentTime in timeLipidsDict) {
        timeLipidsDict[currentTime].value += value;
      } else {
        singleResult.value = value;
        singleResult.short_label = "Lipids";
        singleResult.time = currentTime;
        singleResult.type = "1";
        timeLipidsDict[singleResult.time] = singleResult;
      }
    }
  }

  //example arrEN[indexArrEN] = {
  // START_TIME_DTUNIX
  // VOLUME

  let timeENDict = {};
  if (arrEN && arrEN.length) {
    console.log("EN record size :", arrEN.length);
    for (let row of arrEN) {
      //example row = {"START_TIME_DTUNIX": 1524700800, "VOLUME": 2}
      let currentTime =
        Math.floor(Math.max(row.START_TIME_DTUNIX, startTime) / timeInterval) *
        timeInterval;

      let singleResult = {};
      let value = row.VOLUME;

      if (currentTime in timeENDict) {
        timeENDict[currentTime].value += value;
      } else {
        singleResult.value = value;
        singleResult.short_label = "EN";
        singleResult.time = currentTime;
        singleResult.type = "1";
        timeENDict[singleResult.time] = singleResult;
      }
    }
  }

  let resultFlush = Object.values(timeFlushDict);
  let resultDrips = Object.values(timeDripsDict);
  let resultTPN = Object.values(timeTPNDict);
  let resultEN = Object.values(timeENDict);
  let resultLipids = Object.values(timeLipidsDict);

  //unsorted array from Event, Flush, Drips, TPN
  let arr = [...resultEvent, ...resultFlush, ...resultDrips, ...resultTPN, ...resultEN, ...resultLipids];
  arr.sort(function(a, b) {
    let keyA = a.time;
    let keyB = b.time;
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
  return arr;
}

/**
 *
 *
 * @param {*} array
 * @param {*} timeOfArray
 * @param {*} timeInterval timeInterval would be 3600 * n. if timeInterval === 3600, will return
 *                         record include short_label ==''. If timeInterval != 3600, won't return
 *                         record include short_label ==''.
 */
function handelSameTimeArray(array, timeOfArray, timeInterval) {
  let dict = {};
  let resultSameTime = [];

  for (let row of array) {
    //example row = {"DT_UNIX": "1524700800", "EVENT_CD": "2798974", "VALUE": 0.9, "SHORT_LABEL": "VAC"}
    let io_calcs = EVENT_CD_DICT[row.EVENT_CD].IO_CALCS;

    // todo, now combined with event cd

    let value;
    if (row.SHORT_LABEL in dict) {
      if (io_calcs == 2) {
        value = Math.abs(row.VALUE) * -1;
      } else {
        value = Math.abs(row.VALUE) * 1;
      }
      dict[row.SHORT_LABEL] += value;
    } else {
      if (io_calcs == 2) {
        value = Math.abs(row.VALUE) * -1;
      } else {
        value = Math.abs(row.VALUE) * 1;
      }
      dict[row.SHORT_LABEL] = value;
    }
  }

  // {"VAC": 0.9, "PIG1": 1.1}
  for (let key in dict) {
    // skip for (timeInterval != 3600 and short_label is empty)
    if ((timeInterval == 3600 || key != "") && dict[key]) {
      let singleResult = {};
      // console.log("key: ", key);
      singleResult.value = dict[key];
      singleResult.short_label = key;
      singleResult.time = timeOfArray;
      singleResult.type = SL_TO_CALCS[key];
      resultSameTime.push(singleResult);
    }
  }
  return resultSameTime;
}

module.exports = {
  calculateIO
};
