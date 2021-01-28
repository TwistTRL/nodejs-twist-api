/*
 * @Author: Peng Zeng 
 * @Date: 2020-12-10 18:52:12 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2021-01-28 11:44:24
 */


const database = require("../../services/database");

// select * from drug_infusions where person_id = XX and where end_utc is within 8 hours of sysdate.  
// If there is more than 1 row for a given drug name then choose the most recent end_utc, and send drug, 
// infusion_rate and infusion_rate_units.  You should then join this to the medication_categorization table as you do for infusions on the main page


// see db_relations/drug-category-relations
const SQL_GET_INFUSIONS_8HOURS =`
SELECT 
  DRUG, END_UNIX, INFUSION_RATE, INFUSION_RATE_UNITS, RXCUI  
FROM DRUG_INFUSIONS 
WHERE PERSON_ID = :person_id
  AND END_UNIX > :cutoff_unix 
ORDER BY END_UNIX DESC
`;


async function getInfusionsSqlExecutor(conn, binds) {
  const result = await conn.execute(SQL_GET_INFUSIONS_8HOURS, binds).then(ret => ret.rows);
  return result;
}

const getCensusInfusionsData = database.withConnection(getInfusionsSqlExecutor);

module.exports = {
  getCensusInfusionsData,
};