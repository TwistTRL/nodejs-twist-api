/**
 *  get abnormal mrn
 */

const database = require("../services/database");


const SQL_MUTIPLE_MRN = `
select MRN, person_id from CHB_MRN where mrn in (select MRN from CHB_MRN group by MRN having COUNT(mrn)>1) order by mrn
`

async function getIMultipleMRNSqlExecutor(conn) {

  let mrnRecords = await conn.execute(SQL_MUTIPLE_MRN).then( res=>res.rows );
  var result = [];
  var currentMRN = "";
  var currentPERSONID = 0;
  for (let mrnRecord of mrnRecords) {
    if (mrnRecord.MRN != currentMRN) {
      currentMRN = mrnRecord.MRN;
      currentPERSONID = mrnRecord.PERSON_ID;
      continue;
    }
    if (mrnRecord.PERSON_ID != currentPERSONID) {
      result.push(currentMRN);
    }
  }
  return result;
}

const testAbnormalMRN = database.withConnection(getIMultipleMRNSqlExecutor);


/**
 * 

 
 */


module.exports = {
  testAbnormalMRN
};