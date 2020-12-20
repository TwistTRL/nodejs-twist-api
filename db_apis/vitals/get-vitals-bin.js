/*
 * @Author: Peng Zeng
 * @Date: 2020-12-03 21:10:09
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-19 16:45:01
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

const getVitalsBin = ( bin_data, bin_def ) => {
  // console.log('bin_def :>> ', bin_def);
  // console.log('bin_data :>> ', bin_data);
  const BIN_ID_TO_RANGE = {};
  const NAME_TO_BIN_ID = {};
  const BIN_ID_TO_NAME = {};

  for (let row of bin_def) {
    BIN_ID_TO_RANGE[row.BIN_ID] = [row.LMT_ST, row.LMT_END];
    BIN_ID_TO_NAME[row.BIN_ID] = row.VITAL_TYPE;
    if (row.VITAL_TYPE in NAME_TO_BIN_ID) {
      NAME_TO_BIN_ID[row.VITAL_TYPE].push(row.BIN_ID);
    } else {
      NAME_TO_BIN_ID[row.VITAL_TYPE] = [row.BIN_ID];
    }

  }

  const ret = [BIN_ID_TO_RANGE];

  let dict = {}; // dict[start_time][source][name]

  bin_data.forEach((element) => {
    const from = Number(element.START_TM);
    const to = Number(element.END_TM);
    const time = (from + to) / 2;
    const name = BIN_ID_TO_NAME[element.BIN_ID];
    const source = element.table_source;
    if (!(from in dict)) {
      dict[from] = {};
    }

    if (!(source in dict[from])) {
      dict[from][source] = {};
    }

    if (!(name in dict[from][source])) {
      dict[from][source][name] = {
        from,
        to,
        time,
        name,
        source,
      };
    }

    dict[from][source][name][element.BIN_ID] = element.VAL;
  });

  Object.keys(dict)
    .sort((a, b) => a - b)
    .forEach((from_time) => {
      // only use one table source at the same timestamp
      const source_name = Object.keys(dict[from_time]).sort(
        (x, y) => SORTED_TABLE.indexOf(x) - SORTED_TABLE.indexOf(y)
      )[0];
      const twist_name = Object.keys(dict[from_time][source_name]).sort(
        (x, y) => SORTED_TWIST_NAME.indexOf(x) - SORTED_TWIST_NAME.indexOf(y)
      )[0];

      // fill all unused id with 0
      const cur_result = dict[from_time][source_name][twist_name];
      NAME_TO_BIN_ID[twist_name].forEach(binId => {
        if (!(binId in cur_result)) {
          cur_result[binId] = 0;
        }
      })
      ret.push(cur_result);
    });

  return ret;
};

module.exports = {
  getVitalsBin,
};
