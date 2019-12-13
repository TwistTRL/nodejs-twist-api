const database = require("../services/database");
const {isJsonString} = require("../utils/isJson");
const {getVitalsQuery} = require("../db_apis/get-vitals-all");
const getHrBinned = require("../db_apis/get_hr_binned_v2");
const getHrCalc = require("../db_apis/get_hr_calc");
const {InputInvalidError} = require("../utils/errors");  

const testHr = database.withConnection(async function(conn,query){
    if (!isJsonString(query)) {
        console.warn("not json");
        throw new InputInvalidError('Input not in json');  
    }

    if (query.vital_type != "hr"){
        throw new InputInvalidError('"vital_type" only for "hr".');
    }

    let string1 = JSON.stringify(await getVitalsQuery(query));
    var string2;
    let binds = {
        person_id:query.person_id
    };

    if (query.data_type == "binned") {
        switch (query.data_resolution) {
            case "1D":
                string2 = JSON.stringify(await getHrBinned.getHr1Dv2(binds));
                break;
            case "12H":
                string2 = JSON.stringify(await getHrBinned.getHr12Hv2(binds));
                break;

            case "5H":
                string2 = JSON.stringify(await getHrBinned.getHr5Hv2(binds));
                break;

            case "5M":
                string2 = JSON.stringify(await getHrBinned.getHr5Mv2(binds));  
                break;

            default:
                throw new InputInvalidError('"data_resolution" not valid. Should be one of "1D", "12H", "5H", "5M".');  
        }    
    } else if (query.data_type == "calc") {
        switch (query.data_resolution) {
            case "1D":
                string2 = JSON.stringify(await getHrCalc.getHrCalc1D(binds));
                break;
            case "12H":
                string2 = JSON.stringify(await getHrCalc.getHrCalc12H(binds));
                break;

            case "5H":
                string2 = JSON.stringify(await getHrCalc.getHrCalc5H(binds));
                break;

            case "5M":
                string2 = JSON.stringify(await getHrCalc.getHrCalc5M(binds));  
                break;

            default:
                throw new InputInvalidError('"data_resolution" not valid. Should be one of "1D", "12H", "5H", "5M".');  
        }    
    } else {
        throw new InputInvalidError('"data_type" not valid. Should be one of "binned", "calc".');  
    }  

    let sameCharNum = findSameCharNum(string1, string2);
    var result1;
    if (string1.length == string2.length && string2.length == sameCharNum) {
        result1 = "Test success.\n";
    } else {
        result1 = "Test failed.\n";
    }

    var result2;
    if (query.data_type == "binned") {
        result2 = (string1.length + ": 'POST /vitals' get characters length.\n" +  
    +  string2.length + ": 'GET /person/:person_id/vitals/hr/binnedv2' get characters length.\n" + 
    +  sameCharNum + ": same characters number.");
    } else{
        result2 = (string1.length + ": 'POST /vitals' get characters length.\n" +  
    +  string2.length + ": 'GET /person/:person_id/vitals/hr/calc' get characters length.\n" + 
    +  sameCharNum + ": same characters number.");
    }

    return result1 + result2;
});


function findSameCharNum(string1,string2){
    var compareNum = 0;
    var countdown = 0;
    var check = Math.min(string1.length, string2.length);
    for( var i=0; i<check; i++) {
        if( string1.charAt(i) == string2.charAt(i)) {
            compareNum++;
            if (countdown > 0) {
                countdown -= 1;
            }
        } else {
            console.log("different at " + i + " : " + string1.charAt(i) + " and " + string2.charAt(i))
            countdown = 20;
        }
    }

    return compareNum;
}

module.exports = {
    testHr
};

