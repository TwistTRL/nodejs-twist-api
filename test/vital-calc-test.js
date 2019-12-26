const chai = require('chai');

const {getVitalsQuery} = require("../db_apis/get-vitals-all");
const {getHr12Hv2,getHr5Hv2,getHr1Dv2,getHr5Mv2} = require("../db_apis/get_hr_binned_v2");
const getHrCalc = require("../db_apis/get_hr_calc");


var assert = chai.assert;

const query_binned_1 = `
{
    "person_id": 25796315,
    "vital_type": "hr",
    "data_type": "binned",
    "data_resolution": "1D"
}
`

const query_binned_2 = `
{
    "person_id": 25796315,
    "vital_type": "hr",
    "data_type": "binned",
    "data_resolution": "12H"
}
`

const query_cacl_1 = `
{
    "person_id": 25796315,
    "vital_type": "hr",
    "data_type": "calc",
    "data_resolution": "1d"
}
`

const query_cacl_2 = `
{
    "person_id": 25796315,
    "vital_type": "hr",
    "data_type": "calc",
    "data_resolution": "12H"
}
`

// describe('Vitals Query Binned', () => {
//     it('2 binned hr API should get the same results', async () => {
//       let result1 = await getVitalsQuery(query_binned_1);
//       let result2 = await getHr1Dv2(query_binned_1);  
//       assert.equal(result1, result2);
//     });
//   });


// describe('Vitals Query Calc', () => {
// it('2 calc hr API should get the same results', async () => {
//     let result1 = await getVitalsQuery(query_cacl_1);
//     let result2 = await getHrCalc.getHrCalc1D(query_cacl_1);  
//     assert.equal(result1, result2);
// });
// });



