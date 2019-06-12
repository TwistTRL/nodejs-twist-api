const express = require('express');
const router = new express.Router();
const RSSRouter = require("../routes/RSS");

router.use('/person/:person_ID/RSS', RSSRouter);

module.exports = router;
