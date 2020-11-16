/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 16:48:10
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-15 22:51:59
 */

const { getVesselCathData, getVesselLinesData } = require("../../database_access/vessel/vessel");

const { getPersonFromMrn } = require("../person/get-person-info");
const moment = require("moment");

const getVessel = async (binds) => {
  const cathData = await getVesselCathData(binds);
  const person_ids = await getPersonFromMrn(binds);
  const person_id = person_ids[0].PERSON_ID;
  const linesData = await getVesselLinesData({ person_id });

  return getVesselFromData(cathData, linesData);
};

const getVesselFromData = (cathData, linesData) => {
  const cathResults = cathData.map((item) => {
    const time = item.AUTOTIME_ET;
    const vessel = item.ENTRSITE;
    const catheter_size = item.SHETSZ || item.VESSDETL;
    const inserted_by = "CATH";
    return {
      time,
      vessel,
      catheter_size,
      inserted_by,
      _source: "CATH_ACCESS",
    };
  });

  const linesResults = linesData
    .filter((item) => item.LOCATION)
    .filter(
      (item) =>
        item.EVENT_CD_SUBTYPE === "CVL" ||
        item.EVENT_CD_SUBTYPE === "PICC" ||
        item.EVENT_CD_SUBTYPE === "ARTERIAL LINE"
    )
    // .filter((item) => !item.DIAM.includes("Other:"))
    // .filter((item) => !item.VESSEL.includes("Other:"))
    .map((item) => {
      const time = item.INSERT_DTM;
      const vessel = getLinesVessel(item.VESSEL, item.LOCATION, item.EVENT_CD_SUBTYPE);
      const catheter_size = item.DIAM.replace("Other: ", "");
      const duration_minutes = moment(item.REMOVE_DTM).diff(moment(item.INSERT_DTM), "minutes");
      const duration = Math.round(duration_minutes / (3600 * 24 * 60)) || "<1 day";
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
  console.log("linesResults.length :>> ", linesResults.length);

  return [...cathResults, ...linesResults].sort((a, b) => moment(a.time) - moment(b.time));
};

const getLinesVessel = (vessel, location, event_cd_subtype) => {
  // (Right)(Femoral)(Arterial line) = RFA
  // Also, remove the ‘Other:  ‘ from any VESSEL entries.

  let result_location;
  let result_type;
  const result_vessel = vessel
    ? vessel
        .replace("Other: ", "")
        .split(" ")
        .map((item) => item[0].toUpperCase())
        .join("")
    : null;

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

  return `${result_location || "()"}${result_vessel}${result_type}`;
};

module.exports = {
  getVessel,
  getVesselFromData,
};
