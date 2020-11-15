/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 16:48:10
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 17:10:06
 */

const {
  getVesselCathData,
  getVesselLinesData,
} = require("../../database_access/vessel/vessel");

const getVessel = async (binds) => {
  const cathData = await getVesselCathData(binds);
  const linesData = await getVesselLinesData(binds);

  return getVesselFromData(cathData, linesData);
}

const getVesselFromData = (cathData, linesData) => {
  const cathResults = cathData.map((item) => {
    const time = item.AUTOTIME;
    const vessel = item.ENTRSITE;
    const catheter_size = item.SHETSZ; //TODO: VESSDETL
    const inserted_by = "CATH";
    return {
      time,
      vessel,
      catheter_size,
      inserted_by,
      _source: "CATH_ACCESS",
    };
  });

  const linesResults = linesData.map((item) => {
    const time = item.INSERT_DTM;
    const vessel = getLinesVessel(
      item.VESSEL,
      item.LOCATION,
      item.EVENT_CD_SUBTYPE
    );
    const catheter_size = item.DIAM;
    const duration_minutes = item.REMOVE_DTM.diff(item.INSERT_DTM, "minutes");
    const duration =
      Math.round(duration_minutes / (3600 * 24 * 60)) || "<1 day";
    const inserted_by = item.INSERT_BY;
    return {
      time,
      vessel,
      catheter_size,
      duration,
      inserted_by,
      _source: "LINES_HD",
    };
  });

  return [...cathResults, ...linesResults].sort((a, b) => moment(a.time) - moment(b.time));
};

const getLinesVessel = (vessel, location, event_cd_subtype) => {
  //   The main vessel name is in VESSEL.  The side (right vs left) is in LOCATION.
  //   Artery versus vein is interpreted from EVENT_CD_SUBTYPE: ARTERIAL line = artery; vein = PICC or CVL).
  //   This can be concatenated for most entries into an abbreviation: (LOCATION)(VESSEL)(ARTERY/VEIN).  For example (Right)(Femoral)(Arterial line) = RFA.
  // (Left)(Internal jugular)(PICC) = RIJV

  // Also, remove the ‘Other:  ‘ from any VESSEL entries.

  // TODO: double check this 
  // if (vessel.includes("Other:")) {
  //   return null;
  // }

  let result_location;
  let result_type;
  const result_vessel = vessel
    .split(" ")
    .map((item) => item[0].toUpperCase())
    .join("");

  if (location.toLowerCase().includes("right")) {
    result_location = "R";
  } else if (location.toLowerCase().includes("left")) {
    result_location = "L";
  }

  if (event_cd_subtype.toLowerCase().includes("arterial line")) {
    result_type = "A";
  } else if (
    event_cd_subtype.toUpperCase().includes("PICC") ||
    event_cd_subtype.toUpperCase().includes("CVL")
  ) {
    result_type = "V";
  }

  return `${result_location}${result_vessel}${result_type}`;
};

module.exports = {
  getVessel,
  getVesselFromData,
};
