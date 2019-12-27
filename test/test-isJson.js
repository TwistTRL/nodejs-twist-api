var assert = require('assert');
const isValidJson = require("../utils/isJson");


describe('isJson', function () {
    describe('#isJson 2', function () {
        it('should return true when the input is json', function () {
            var good_json = `{
                "person_id": 11111111,
                "vital_type": "hr",
                "data_type": "binned",
                "data_resolution": "1D"
            }`;

            var myobj = JSON.parse(good_json);
            assert.equal(true, isValidJson.validate_vitals_sampled(myobj));

        });
    });
});


describe('isJson', function () {
    describe('#isJson 3', function () {
        it('should return false when the input is not this fomarted json', function () {
            var another_json = `{
                "person_id": 1111111,
                "vital_type": "mbp",
                "from": 1542014000,
                "to": 1542018000
            }`;
            assert.equal(false, isValidJson.validate_vitals_sampled(JSON.parse(another_json)));

        });
    });
});