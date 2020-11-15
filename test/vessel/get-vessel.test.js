const chai = require("chai");
const assert = chai.assert;
const moment = require("moment");

const { getVesselFromData } = require("../../db_apis/vessel/get-vessel");
const now = moment();
const TEST_CATH_DATA = [
  [
    {
      AUTOTIME: now,
      ENTRSITE: "abc",
      SHETSZ: "cde",
      VESSDETL: "",
    },
  ],
];
const TEST_LINES_DATA = [];
const VESSEL_RESULT = [
  [
    {
      time: now,
      vessel: "abc",
      catheter_size: "cde",
      inserted_by: "CATH",
      _source: "CATH_ACCESS",
    },
  ],
];
describe("Get Vessel", () => {
  it("return list of users", () => {
    assert.equal(
      getVesselFromData(TEST_CATH_DATA[0], TEST_LINES_DATA[0]),
      VESSEL_RESULT[0]
    );
  });
});
