/*
 * @Author: Peng Zeng 
 * @Date: 2020-11-18 21:11:17 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-19 15:32:10
 */

const database = require("../../services/database");

const GET_PARENT_INFO_SQL = `
SELECT DISTINCT
  PERSON_RELTN_TYPE_NAME AS RELATIONSHIP_TYPE,
  PERSON_RELTN_NAME AS RELATIONSHIP,
  NAME_FULL_FORMATTED AS NAME,
  PHONE_NUM AS PHONE_NUM,
  STREET_ADDR AS STREET_ADDR,
  CITY AS CITY,
  STATE AS STATE,
  ZIPCODE AS ZIPCODE
FROM PARENT_PATIENT
WHERE PERSON_ID = :person_id 
`;

async function getParentInfoSqlExecutor(conn, binds) {
  let result = await conn.execute(GET_PARENT_INFO_SQL, binds).then((ret) => ret.rows);
  return result;
}

const getParentInfoData = database.withConnection(getParentInfoSqlExecutor);

module.exports = {
  getParentInfoData,
};
