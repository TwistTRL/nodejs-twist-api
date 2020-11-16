/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 16:48:10
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-16 16:08:15
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

  // shoule has LOCATION, VESSEL for each record
  // and LOCATION has "Right" or "Left" in it
  // and EVENT_CD_SUBTYPE is "CVL" or "PICC" or "ARTERIAL LINE"
  const linesResults = linesData
    .filter((item) => item.LOCATION)
    .filter((item) => item.VESSEL)
    .filter(
      (item) =>
        item.EVENT_CD_SUBTYPE === "CVL" ||
        item.EVENT_CD_SUBTYPE === "PICC" ||
        item.EVENT_CD_SUBTYPE === "ARTERIAL LINE"
    )
    .filter((item) => item.LOCATION.includes("Right") || item.LOCATION.includes("Left"))
    .filter((item) => !(item.LOCATION.includes("Right") && item.LOCATION.includes("Left")))
    .map((item) => {
      const time = item.INSERT_DTM;
      const vessel = getLinesVessel(item.VESSEL, item.LOCATION, item.EVENT_CD_SUBTYPE);
      const catheter_size = item.DIAM && item.DIAM.replace("Other: ", "");
      const duration_minutes = moment(item.REMOVE_DTM).diff(moment(item.INSERT_DTM), "minutes");
      const duration_days = Math.round(duration_minutes / (24 * 60))
      const duration = duration_days ? `${duration_days} days` : "<1 day";
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
  const result_vessel =
    vessel
      .replace("Other: ", "")
      .split(" ")
      .map((item) => item[0].toUpperCase())
      .join("");
  if (location.includes("Right")) {
    result_location = "R";
  } else if (location.includes("Left")) {
    result_location = "L";
  }

  if (event_cd_subtype ==="ARTERIAL LINE") {
    result_type = "A";
  } else if (
    event_cd_subtype === "PICC" ||
    event_cd_subtype === "CVL"
  ) {
    result_type = "V";
  }

  return `${result_location}${result_vessel}${result_type}`;
};

module.exports = {
  getVessel,
  getVesselFromData,
};
