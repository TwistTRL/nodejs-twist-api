const database = require("../services/database");
const isValidJson = require("../utils/isJson");
const {getLabsQuery} = require("../db_apis/get-labs-all");
const {getLab, getLabV2} = require('../db_apis/get_labs');

const {InputInvalidError} = require("../utils/errors");  

const catPersonId = "person_id";
const catLabNames = "lab_names";

const testLabs = database.withConnection(async function(conn,query){

    if(Object.entries(query).length === 0 && query.constructor === Object) {
        console.error("query empty");
        throw new InputInvalidError('Input not valid, so query is empty.');
      }

      if (!isValidJson.validate_labs(query)) {
        console.warn(query + " : not json");
        throw new InputInvalidError('Input not in valid json');  
    }


    let person_id = query[catPersonId];
    let requestLabs = query[catLabNames];

    if (person_id == null || requestLabs == null) {
        throw new InputInvalidError('Input not valid. Need person_id" and "lab_names".');  
    }
   

    let res1 = await getLabsQuery(query);
    var res2;
    let binds = {
        person_id:query.person_id
    };

    res2 = await getLab(binds);


    var result1 = "";
    let success = true;

    // requestLabs.forEach(function(item) {
    //     let string1 = JSON.stringify(res1[item]);
    //     let string2 = JSON.stringify(res2[item]);
    //     let sameCharNum = findSameCharNum(string1, string2);
    //     if (string1.length == string2.length && string2.length == sameCharNum) {
    //         result1 += " ✔ " + item + "\n";
    //     } else {
    //         let differentNum = Math.min(string1.length, string2.length) - sameCharNum;
    //         result1 += " ✘ " + item + ": (" + string1.length + ", " + string2.length + ") " + "has " + differentNum + "different chars.\n";
    //         success = false;
    //     }       
    // });

    requestLabs.forEach(function(item) {

        let arr1 = res1[item];
        let arr2 = res2[item];

        console.log(item + " size compare : " + arr1.length + ", " + arr2.length);
        for (var i = 0; i < Math.min(arr1.length, arr2.length); i++) {
            if (arr1[i] == arr2[i]) {
                continue;
            }


        }


        let string1 = JSON.stringify(res1[item]);
        let string2 = JSON.stringify(res2[item]);
        let sameCharNum = findSameCharNum(string1, string2);
        if (string1.length == string2.length && string2.length == sameCharNum) {
            result1 += " ✔ " + item + "\n";
        } else {
            let differentNum = Math.min(string1.length, string2.length) - sameCharNum;
            result1 += " ✘ " + item + ": (" + string1.length + ", " + string2.length + ") " + "has " + differentNum + " different chars.\n";
            success = false;
        }       
    });



    if (success) {
        let resultHeader = "✔✔✔ Test success.\n";
        return resultHeader + result1;
    } else {
        let resultHeader = "✘✘✘ Test failed.\n";
        return resultHeader + result1;
    } 


});


function findSameCharNum(string1,string2){
    var allNum = 0;
    var check = Math.min(string1.length, string2.length);
    for( var i=0; i<check; i++) {
        var compareNum = 0;
        if( string1.charAt(i) == string2.charAt(i)) {
            compareNum++;
        }
        allNum += compareNum;
    }
    return allNum;
}

module.exports = {
    testLabs
};

