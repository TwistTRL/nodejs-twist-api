/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-13 21:44:07 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-17 22:13:01
 */

const SORTED_TABLE = ["VITALS", "VITAL_V500"];
const SORTED_TWIST_NAME = [
  "DBP",
  "NBPD",
  "SBP1",
  "NBPS",
  "MBP1",
  "NBPM",
  "HR",
  "HR_PULSED",
  "TEMP1",
  "TEMPCORE1",
  "CVPM",
  "RAP",
  "LAPM",
  "RR",
  "SPO2_1",
];

const getVitalsCalc = (vitalsCalcData) => {
  let dict = {};
  vitalsCalcData.forEach(element => {
    const time = element.time;
    const source = element.table_source;
    const name = element.VITAL_TYPE;

    if (!(time in dict)) {
      dict[time] = {};
    }    
    if (!(source in dict[time])) {
      dict[time][source] = {};
    }
    if (!(name in dict[time][source])) {
      dict[time][source][name] = {
        time,
        name,
        source,
        "val_size": element.VAL_SIZE,
        "perc0":element.VAL_MIN,
        "perc1":element.VAL_PERC1,
        "perc5":element.VAL_PERC5,
        "perc25":element.VAL_PERC25,
        "perc50":element.VAL_PERC50,
        "perc75":element.VAL_PERC75,
        "perc95":element.VAL_PERC95,
        "perc99":element.VAL_PERC99,
        "perc100":element.VAL_MAX,
        "mean":element.VAL_MEAN,
      };
    }
  });

  const ret = [];
  
  Object.keys(dict)
  .sort((a, b) => a - b)
  .forEach((t) => {
    // only use one table source at the same timestamp
    const source_name = Object.keys(dict[t]).sort(
      (x, y) => SORTED_TABLE.indexOf(x) - SORTED_TABLE.indexOf(y)
    )[0];
    const twist_name = Object.keys(dict[t][source_name]).sort(
      (x, y) => SORTED_TWIST_NAME.indexOf(x) - SORTED_TWIST_NAME.indexOf(y)
    )[0];
    ret.push(dict[t][source_name][twist_name]);
  });

return ret; 
}


module.exports = {
  getVitalsCalc,
};
