#!/usr/bin/env node

const database = require("../services/database");

const GET_HEART_RATE_SQL =
`
SELECT  ROWNUM AS ID,
        PERSON_ID,
        VALUE,
        UNIX_TS AS TIME
FROM ZLY_HR_EKG
WHERE PERSON_ID = :person_id
  AND UNIX_TS BETWEEN :from_ AND :to_
ORDER BY UNIX_TS ASC
`

async function getHeartRateSqlExecutor(conn,binds){
  let hr = await conn.execute(GET_HEART_RATE_SQL,binds);
  return hr.rows;
}

const getHeartRate = database.withConnection(getHeartRateSqlExecutor);

module.exports = {
  getHeartRateSqlExecutor,
  getHeartRate
};
