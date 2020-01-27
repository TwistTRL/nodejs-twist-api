const fetch = require("node-fetch");
var assert = require('assert');



const url = "http://twist:3333/api/inout-tooltip";

const requestBody = {
    person_id:25796315,
    from:1541030400,
    to:1541040400,
    resolution:3600,
};

const getData = async url => {
    try {
        const response = await fetch(url, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Accept-Charset": "utf-8"
            },
            body: JSON.stringify(requestBody)
        });
        const json = await response.json();
        console.log('json :', json);
    } catch (error) {
        console.error(error);        
    }
}






describe('fetch test', function() {
    this.timeout(5000);
    it('fetch in-out-tooltip', () => {
        const entries = Object.entries(getData(url));
        console.log("entries: ", entries);

        assert.equal(true, true);
    });


});