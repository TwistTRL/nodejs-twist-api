/*
 * @Author: Peng 
 * @Date: 2020-01-28 08:16:53 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-01-28 09:05:53
 */


const fetch = require("node-fetch");
const assert = require('assert');
const BASE_TWIST_API_URL = "http://twist:3333/api/";
const url = BASE_TWIST_API_URL + "inout-tooltip";

const DUMMY_REQUEST_BODY = {
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
            body: JSON.stringify(DUMMY_REQUEST_BODY)
        });
        return response.json();
    } catch (error) {
        console.error(error);        
    }
}


describe('fetch in-out-tooltip', function() {
    this.timeout(5000);
    it('test fetched timestamp should equal to set', async () => {
        const result = await getData(url);
        const entries = Object.entries(result);
        // console.log("entries[0][0]: ", entries[0][0]);
        const lv1_keys = Object.keys(result);
        console.log('lv1_keys :', lv1_keys);

        const lv2_keys = lv1_keys.map(key => Object.keys(result[key]));
        console.log('lv2_keys :', lv2_keys);

        // const lv3_keys = lv2_keys.map((key, index) => {
        //     console.log('key :', key);
        //     console.log('index :', index);
        //     const lv3_key = key.map(cat => Object.keys(result[lv1_keys[index]][cat]));
        //     console.log('lv3_key :', lv3_key);
        //     return lv3_key;
        // });

        const lv3_keys = lv2_keys.map((key, index) => key.map(cat => Object.keys(result[lv1_keys[index]][cat])));
        console.log('lv3_keys :', lv3_keys);

        assert.equal(entries[0][0], 1541030400);
    });


});