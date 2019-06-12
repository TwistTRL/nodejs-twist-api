const express = require("express");
const router = new express.Router({mergeParams: true});
const database = require("../services/database");

const baseQuery =
 `SELECT *
  FROM RSS
  WHERE person_ID = :person_ID
 `;

router.get('/',async function(req, res, next) {
  let binds = {person_ID: req.params.person_ID};
  let result = await database.simpleExecute(baseQuery, binds);
  res.send(result.rows);
});

module.exports = router;
