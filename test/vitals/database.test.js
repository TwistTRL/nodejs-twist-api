// const webServer = require("../services/web-server.js");
// const app = webServer.app;
// const database = require("../services/database.js");

// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const { expect } = chai;

// const getVitalsData = require("../../database_access/vitals/vitals");

// chai.use(chaiHttp);

// const input = {
//   person_id: 1111111,
//   vital_type: "mbp",
//   from: 1542014000,
//   to: 1542018000,
// };

// describe("API test", function () {
//   this.timeout(5000);

//   before(async function () {
//     await database.initialize();
//     await webServer.initialize();
//   });

//   after(async function () {
//     await webServer.close();
//     await database.close();
//     console.log("Our applicationa tests done!");
//   });

//   it("api page", () => {
//     expect(getVitalsData(input)).to.eql({});
//   });
// });
