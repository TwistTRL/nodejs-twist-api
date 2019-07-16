const express = require('express');
const router = new express.Router();
const RSSRouter = require("../routes/RSS");

router.use('/person/:personID/RSS', RSSRouter);

module.exports = router;
