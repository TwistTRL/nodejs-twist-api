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
/**
 * @api {get} /person/:person_id/labs Request patient labs information
 * @apiVersion 0.0.1
 * @apiName GetPersonLabs
 * @apiGroup Person
 * @apiParam {Number} person_id patient unique ID.
 * @apiSuccess {String} labName Name of the lab.
 * @apiSuccess {Number} DT_UNIX Timestamp of the lab.
 * @apiSuccess {String} VALUE Value of the lab.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "labName": [
 *                    {
 *                       "firstname": "John",
 *                       "lastname": "Doe"
 *                    }
 *                  ]
 *     }
 * 
 */
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


/**
 * @api {get} /person/:person_id/vitals/hr/binned/12H Request patient heart rate binned 12 hours information
 * @apiVersion 0.0.1
 * @apiName GetPersonHrBinned12H
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} range Range of the heart rate.
 * @apiSuccess {String} from Start timestamp.
 * @apiSuccess {String} to End timestamp.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       [
            {
              "range": VAL,
              "from": START_TM,
              "to": END_TM
            }
          ]
 *     }
 * 
 */

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

/**
 * @api {get} /person/:person_id/vitals/hr/binnedv2/12H Request patient heart rate binned 12 hours information
 * @apiVersion 0.0.2
 * @apiName GetPersonHrBinned12HV2
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {NUMBER} time Timestamp.
 * @apiSuccess {String} SvO2 lab.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
          [  
              {
                  "time": NUMBER,
                  "SvO2": VARCHAR2
                }      
          ]
      }
 * 
 */

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
/**
 * @api {post} /vitals Request vitals information
 * @apiVersion 0.0.2
 * @apiName GetVitals
 * @apiGroup Vitals
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String} vital_type Type of vital: "mbp", "sbp", "dbp", "spo2", "hr".
 * @apiParam {Number} from Start timestamp.
 * @apiParam {Number} to End timestamp.
 * @apiParam {String} data_type Type of data: "binned", "calc".
 * @apiParam {String} data_resolution Resolution of data: "1D","12H", "5H", "5M".

 * @apiSuccess {String} range Range of the heart rate.
 * @apiSuccess {String} from Start timestamp.
 * @apiSuccess {String} to End timestamp.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       [
            {
              "range": VAL,
              "from": START_TM,
              "to": END_TM
            }
          ]
 *     }
 * 
 */



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
