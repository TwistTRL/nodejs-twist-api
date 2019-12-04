const express = require("express");
const router = new express.Router();
const {getRelationalQuery} = require("../db_apis/get-relational-query");
const {getRespiratorySupportVariable} = require("../db_apis/get_respiratory_support_variables");
const {getHeartRate} = require("../db_apis/get_heart_rate");
const {getPerson} = require("../db_apis/get_person");
const {getPersonel} = require("../db_apis/get_personel");
const {getBed} = require("../db_apis/get_bed");
const {getBedSurvey} = require("../db_apis/get_bed_survey");

const {getLab, getLabV2} = require("../db_apis/get_labs");

router.get("/", function (req, res) {
  res.send("Node.js API on Twist");
});

// legacy
router.get("/person/:person_iddbConfig/RSS", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  let from = parseFloat(req.query.from);
  let to = parseFloat(req.query.to);
  let binds = {
    person_id,
    from_:from,
    to_:to
  };
  res.send(
    await getRespiratorySupportVariable(binds)
  );
});

router.get("/person/:person_id/HR", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  let from = parseFloat(req.query.from);
  let to = parseFloat(req.query.to);
  let binds = {
    person_id,
    from_:from,
    to_:to
  };
  res.send(
    await getHeartRate(binds)
  );
});

//~~~~~~~~~~~~~~~~~~~ new

router.get("/person/:person_id/labs", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting labs for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getLab(binds)
  );
});

router.get("/person/:person_id/labsv2", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting labsV2 for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getLabV2(binds)
  );
});

//~~~~~~~~~~~~~~~~~~~~

// FHIR like API
router.get("/RespiratorySupportVariable", async (req, res, next)=>{
  let person_id = parseFloat(req.query.person_id);
  let from = parseFloat(req.query.from);
  let to = parseFloat(req.query.to);
  let binds = {
    person_id,
    from_:from,
    to_:to
  };
  res.send(
    await getRespiratorySupportVariable(binds)
  );
});

router.get("/HeartRate", async (req,res, next) => {
  let person_id = parseInt(req.query.person_id);
  let from = parseFloat(req.query.from);
  let to = parseFloat(req.query.to);
  let binds = {
    person_id,
    from_:from,
    to_:to
  };
  res.send(
    await getHeartRate(binds)
  );
});

router.get("/Person/:person_id", async (req,res, next) => {
  let person_id = parseInt(req.params.person_id);
  let binds = {
    person_id
  };
  res.send(
    await getPerson(binds)
  );
});

router.get("/Personel/:chb_prsnl_id", async (req,res, next) => {
  let chb_prsnl_id = parseInt(req.params.chb_prsnl_id);
  let binds = {
    chb_prsnl_id
  };
  res.send(
    await getPersonel(chb_prsnl_id)
  );
});

router.get("/survey/bed_space", async (req,res, next) => {
  let at = parseFloat(req.query.at);
  let binds = {
    at_unix_ts:at
  };
  res.send(
    await getBedSurvey(binds)
  );
});

router.get("/Bed/:bed_cd", async (req,res, next) => {
  let bed_cd = parseFloat(req.params.bed_cd);
  let binds = {
    bed_cd
  };
  res.send(
    await getBed(binds)
  );
});

router.post("/relational-query", async (req,res, next) => {
  let query = req.body;
  try{
    let toSend = await getRelationalQuery(query);
    res.send(
      toSend
    );
  }
  catch(e){
    console.log(new Date());
    console.log(e);
    res.status(500);
    res.send(e.toString());
  }
});

module.exports = router;
