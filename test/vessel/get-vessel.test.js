const { expect } = require("chai");
const moment = require("moment");

const { getVesselFromData } = require("../../db_apis/vessel/get-vessel");
const now = moment().format();
const TEST_CATH_DATA = [
  [
    {
      AUTOTIME_ET: now,
      ENTRSITE: "abc",
      SHETSZ: "cde",
      VESSDETL: "",
    },
  ],
];
const TEST_LINES_DATA = [[]];
const VESSEL_RESULT = [
  {
    time: now,
    vessel: "abc",
    catheter_size: "cde",
    inserted_by: "CATH",
    _source: "CATH_ACCESS",
  },
];

describe("Get Vessel", () => {
  it("return list of users", () => {
    expect(getVesselFromData(TEST_CATH_DATA[0], TEST_LINES_DATA[0])).to.eql(VESSEL_RESULT);
  });
});
