var express = require('express');
var router = express.Router();
var database = require("../services/database");

const baseQuery =
 `SELECT RST, RSS
  FROM RSS
  WHERE person_ID = :person_ID
 `;

/* GET RSS variables. */
router.get('/:person_ID', async function(req, res, next) {
  let connection;
  let binds = {person_ID: req.params.person_ID};
  
  let result = await database.simpleExecute(baseQuery, binds);
  res.send(result.rows);
});

module.exports = router;
