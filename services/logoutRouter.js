
const express = require("express");
const path = require("path");
const router = new express.Router();

router.use("/", express.static(__dirname + "/logout.html"));

// router.get("/settings/med", (req, res) => {
//     res.send(settingsMed.MEDICATION_CATEGORY_STRUCTURE);
//   });




module.exports = router;
