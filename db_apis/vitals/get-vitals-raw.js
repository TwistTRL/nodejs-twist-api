/*
 * @Author: Peng
 * @Date: 2020-01-21 11:53:31
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-13 23:18:56
 */

// calc raw vitals between two timestamp

async function getVitalsRaw(vitalsRawData) {
  const { vitals_result, vital_v500_result, vital_aims_result } = vitalsRawData;
  const formatResult = (source, originArray) =>
    originArray.map((x) => {
      let ret = { source };
      let names = [];
      Object.keys(x).forEach((key) => {
        if (key === "DTUNIX") {
          ret.time = x[key];
        } else if (x[key] !== null) {
          ret[key] = x[key];
          names.push(key);
        }
      });
      ret.names = names;
      return ret;
    });

  const formatted_vitals_result = formatResult("VITALS", vitals_result);
  const formatted_vital_v500_result = formatResult("VITAL_V500", vital_v500_result);
  const formatted_vital_aims_result = formatResult("VITAL_AIMS", vital_aims_result);

  const result = [...formatted_vitals_result, ...formatted_vital_v500_result, ...formatted_vital_aims_result].sort(
    (a, b) => a.time - b.time
  );
  return result;
}

module.exports = {
  getVitalsRaw,
};
