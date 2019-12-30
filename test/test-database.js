
const webServer = require('../services/web-server.js');
const app = webServer.app;
const database = require('../services/database.js');

const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;

chai.use(chaiHttp);


describe('application test', function() {
    var date;
    this.timeout(5000);

    before(async function() {
        await database.initialize();
        await webServer.initialize();
    })

    beforeEach(function() {
       date = new Date();
    });

    afterEach(function() {
      console.log("The date for that one was", date);
    });

    after(async function() {
        await webServer.close();
        await database.close();
        console.log("Our applicationa tests done!");
    });

    it('api page', done => {

        chai
            .request(app)
            .get("/api/")
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
      });
    });
      

});