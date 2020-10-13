/*
 * @Author: Peng Zeng
 * @Date: 2020-09-30 07:24:59
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-30 07:46:53
 */

const database = require("../../services/database");

const GET_PATIENTS_CACHE_SQL = `
SELECT
  PERSON_ID,
  MRN,
  UPDT_UNIX
FROM API_CACHE_PATIENTS
`;

const getPatientsCache = database.withConnection(
    async (conn) => await conn.execute(GET_PATIENTS_CACHE_SQL).then((ret) => ret.rows)
);

module.exports = {
    getPatientsCache,
};
