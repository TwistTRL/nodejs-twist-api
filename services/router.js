const express = require('express');
const router = new express.Router();
var database = require("../services/database");

const baseQuery =
 `SELECT *
  FROM RSS
  WHERE person_ID = :person_ID
 `;

router.get('/person/:person_ID/RSS', async function(req, res, next) {
  let binds = {person_ID: req.params.person_ID};
  let result = await database.simpleExecute(baseQuery, binds);
  res.send(result.rows);
});

module.exports = router;
