const express = require("express");
const router = new express.Router();
const url = require('url');
const qs = require('querystring');
const {getRelationalQuery} = require("../db_apis/get-relational-query");
const {getVitalsQuery} = require("../db_apis/get-vitals-all");


const {getRespiratorySupportVariable} = require("../db_apis/get_respiratory_support_variables");
const {getHeartRate} = require("../db_apis/get_heart_rate");
const {getPerson} = require("../db_apis/get_person");
const {getPersonel} = require("../db_apis/get_personel");
const {getBed} = require("../db_apis/get_bed");
const {getBedSurvey} = require("../db_apis/get_bed_survey");
const {getHr12H, getHr5H, getHr1D, getHr5M} = require("../db_apis/get_hr_binned");
const {getHr12Hv2, getHr5Hv2, getHr1Dv2, getHr5Mv2} = require("../db_apis/get_hr_binned_v2");

const {getHrCalc12H, getHrCalc5H, getHrCalc1D, getHrCalc5M} = require("../db_apis/get_hr_calc");
const {getRawHr} = require("../db_apis/get_raw_hr");


const {getLab, getLabV2} = require("../db_apis/get_labs");

router.get("/", function (req, res) {
  res.send("Node.js API on Twist");
});

// legacy
router.get("/person/:person_id/RSS", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  let from = parseFloat(req.query.from) || 0;
  let to = parseFloat(req.query.to) || Date.now();
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
  let from = parseFloat(req.query.from) || 0;
  let to = parseFloat(req.query.to) || Date.now();
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

//~~
router.get("/person/:person_id/vitals/hr/binned/12H", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_12H for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHr12H(binds)
  );
});

router.get("/person/:person_id/vitals/hr/binned/5H", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_5H for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHr5H(binds)
  );
});

router.get("/person/:person_id/vitals/hr/binned/1D", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_1D for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHr1D(binds)
  );
});

router.get("/person/:person_id/vitals/hr/binnedvar/5M", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_5M for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHr5M(binds)
  );
});


//~~ v2
router.get("/person/:person_id/vitals/hr/binnedv2/12H", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_12H for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHr12Hv2(binds)
  );
});

router.get("/person/:person_id/vitals/hr/binnedv2/5H", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_5H for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHr5Hv2(binds)
  );
});

router.get("/person/:person_id/vitals/hr/binnedv2/1D", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_1D for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHr1Dv2(binds)
  );
});

router.get("/person/:person_id/vitals/hr/binnedv2/5M", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_5M for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHr5Mv2(binds)
  );
});
//~~calc


router.get("/person/:person_id/vitals/hr/calc/12H", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_12H for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHrCalc12H(binds)
  );
});

router.get("/person/:person_id/vitals/hr/calc/5H", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_5H for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHrCalc5H(binds)
  );
});

router.get("/person/:person_id/vitals/hr/calc/1D", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_1D for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHrCalc1D(binds)
  );
});

router.get("/person/:person_id/vitals/hr/calc/5M", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  console.log("getting hr_5M for %s ...",person_id);

  let binds = {
    person_id
  };
  res.send(
    await getHrCalc5M(binds)
  );
});

//~~~~~~~~-----------------------------

router.get("/person/:person_id/vitals/\*", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);


  let originalUrl = req.originalUrl;
  console.log("originalUrl", originalUrl);

  let n = originalUrl.indexOf("/vitals/");
  let newUrl = originalUrl.slice(n+8);
  console.log("newUrl", newUrl);

  let arrayUrl = newUrl.split("/");
  console.log("arrayUrl", arrayUrl);

  switch (arrayUrl[0]) {
    case "mbp":
      break;
    case "sbp":
      break;
    case "dbp":
      break;
    case "spo2":
      break;
    default:
      break;
  }

  return arrayUrl;

  let binds = {
    person_id
  };
  res.send(
    await getHrCalc5M(binds)
  );
});

router.post("/vitals", async (req,res, next) => {
  let query = req.body;
  try{
    let toSend = await getVitalsQuery(query);
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



//~~~~~~~~~~----------------------------

// ~~ raw hr bewteen two timestamp

router.get("/person/:person_id/vitals/hr/raw", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  let from = parseFloat(req.query.from) || Date.now()/1000 - 600;
  let to = parseFloat(req.query.to) || Date.now()/1000;

  console.log("Date.now():", Date.now());


  let binds = {
    person_id,
    from_:from,
    to_:to
  };
  console.log("getting raw hr for %s from %d to %d ...", binds.person_id, binds.from_, binds.to_);

  res.send(
    await getRawHr(binds)
  );
});

//~~~~~~~~~~~~~~~~~~~~

// FHIR like API
router.get("/RespiratorySupportVariable", async (req, res, next)=>{
  let person_id = parseFloat(req.query.person_id);
  let from = parseFloat(req.query.from) || 0;
  let to = parseFloat(req.query.to) || Date.now();
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
  let from = parseFloat(req.query.from) || 0;
  let to = parseFloat(req.query.to) || Date.now();
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
