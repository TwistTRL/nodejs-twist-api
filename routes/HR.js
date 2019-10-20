const express = require("express");
const database = require("../services/database");

const baseQuery_full =
`
SELECT
  PERSON_ID,
  VALUE,
  UNIX_TS
FROM ZLY_HR_EKG
WHERE PERSON_ID = :personID
  AND UNIX_TS > :from_
  AND UNIX_TS <= :to_
ORDER BY UNIX_TS
`

const baseQuery_from_only = 
`
SELECT
  PERSON_ID,
  VALUE,
  UNIX_TS
FROM ZLY_HR_EKG
WHERE PERSON_ID = :personID
  AND UNIX_TS > :from_
ORDER BY UNIX_TS
`

const baseQuery_to_only =
`
SELECT
  PERSON_ID,
  VALUE,
  UNIX_TS
FROM ZLY_HR_EKG
WHERE PERSON_ID = :personID
  AND UNIX_TS <= :to_
ORDER BY UNIX_TS
`

const baseQuery =
`
SELECT
  PERSON_ID,
  VALUE,
  UNIX_TS
FROM ZLY_HR_EKG
WHERE PERSON_ID = :personID
ORDER BY UNIX_TS
`

const handler = async function(req, res, next) {
  let personID = parseFloat(req.params.personID);
  let from_ = parseFloat(req.query.from);
  let to_ = parseFloat(req.query.to);
  let binds = null;
  let query = null;
  let result = null;
  if ( isNaN(to_) && isNaN(from_) ) {
    query = baseQuery;
    binds = {personID};
    console.log(1,query,binds);
  }
  else if ( !isNaN(to_) && isNaN(from_) ) {
    query = baseQuery_to_only;
    binds = {personID,to_};
    console.log(2,query,binds);
  }
  else if ( isNaN(to_) && !isNaN(from_) ) {
    query = baseQuery_from_only;
    binds = {personID,from_};
    console.log(3,query,binds);
  }
  else {
    query = baseQuery_full;
    binds = {personID,from_,to_};
    console.log(4,query,binds);
  }
  result = await database.simpleExecute(query, binds);
  res.send(result.rows);
}

module.exports = handler;
