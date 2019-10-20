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

const getHeartRateSqlExecutor = async function(conn,binds,opts){
  let hr = await conn.execute(GET_HEART_RATE_SQL,binds,opts);
  return hr.rows;
}

const getHeartRate = async function(person_id,from,to) {
  let binds = {
    person_id,
    from_:from,
    to_:to
  };
  let opts = {};
  let hr = await database.simpleExecute(getHeartRateSqlExecutor,binds,opts);
  return hr;
}

module.exports.getHeartRate = getHeartRate;
