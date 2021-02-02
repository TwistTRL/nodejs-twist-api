/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-10 18:52:12 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-02-01 19:28:43
 */


const database = require("../../services/database");

// select * from drug_infusions where person_id = XX and where end_utc is within 8 hours of sysdate.  
// If there is more than 1 row for a given drug name then choose the most recent end_utc, and send drug, 
// infusion_rate and infusion_rate_units.  You should then join this to the medication_categorization table as you do for infusions on the main page


// see db_relations/drug-category-relations
const SQL_GET_INFUSIONS =`
SELECT
  PERSON_ID, DRUG, DRUG_INFUSIONS.END_UNIX, INFUSION_RATE, INFUSION_RATE_UNITS, RXCUI 
FROM ADT
JOIN PERSON USING (PERSON_ID)
JOIN SEX_CODE USING (SEX_CD)
JOIN CHB_MRN USING (PERSON_ID)
JOIN DRUG_INFUSIONS USING(PERSON_ID)
WHERE :timestamp BETWEEN ADT.START_UNIX AND ADT.END_UNIX
  AND (DECEASED_UNIX_TS IS NULL OR :timestamp BETWEEN BIRTH_UNIX_TS AND DECEASED_UNIX_TS)
  AND NURSE_UNIT_DISP != 'Emergency Department'
  AND DRUG_INFUSIONS.END_UNIX > :cutoff_timestamp
-- ORDER BY PERSON_ID, DRUG_INFUSIONS.END_UNIX DESC
`;


async function getInfusionsSqlExecutor(conn, binds) {
  const result = await conn.execute(SQL_GET_INFUSIONS, binds).then(ret => ret.rows);
  return result;
}

const getCensusInfusionsData = database.withConnection(getInfusionsSqlExecutor);

module.exports = {
  getCensusInfusionsData,
};