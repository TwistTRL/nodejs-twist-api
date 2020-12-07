/*
 * @Author: Peng
 * @Date: 2020-01-21 11:53:31
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-05 20:06:41
 */

// for get-vitals-all-v2
// get raw vitals between two timestamp

const { getVitalsRawData } = require("../../database_access/vitals/vitals-raw");

async function getVitalsRaw(query) {
  const vitalsData = await getVitalsRawData(query);
  const { vitals_result, vitals_2nd_result, vital_v500_result, vital_aims_result } = vitalsData;
  console.log("vitals_result.length :>> ", vitals_result ? vitals_result.length : 0);
  console.log("vitals_2nd_result.length :>> ", vitals_2nd_result ? vitals_2nd_result.length : 0);
  console.log("vital_v500_result.length :>> ", vital_v500_result ? vital_v500_result.length : 0);
  console.log("vital_aims_result.length :>> ", vital_aims_result ? vital_aims_result.length : 0);

  const formatResult = (source, originArray) =>
    originArray.map((x) => {
      let ret = { source };
      Object.keys(x).forEach((key) => {
        if (key === "DTUNIX") {
          ret.time = x[key];
        } else {
          ret.name = key;
          ret.value = x[key];
        }
      });
      return ret;
    });

  const result1 = formatResult("VITALS", vitals_result);
  const result2 = formatResult("VITALS", vitals_2nd_result);
  const result3 = formatResult("VITAL_V500", vital_v500_result);
  const result4 = formatResult("VITAL_AIMS", vital_aims_result);

  const result = [...result1, ...result2, ...result3, ...result4].sort(
    (a, b) => a.time - b.time
  );
  return result;
}

module.exports = {
  getVitalsRaw,
};
