/* eslint-disable camelcase */
/* eslint-disable max-len */
const express = require('express');
const router = new express.Router();
const {getRelationalQuery} = require('../db_apis/get-relational-query');
const {getVitalsQuery} = require('../db_apis/get-vitals-all');
const {getLabsQuery} = require('../db_apis/get-labs-all');
const {getRespiratorySupportVariable} = require('../db_apis/get_respiratory_support_variables');
const {getHeartRate} = require('../db_apis/get_heart_rate');
const {getPerson} = require('../db_apis/get_person');
const {getPersonel} = require('../db_apis/get_personel');
const {getBed} = require('../db_apis/get_bed');
const {getBedSurvey} = require('../db_apis/get_bed_survey');
const {getHr12H, getHr5H, getHr1D, getHr5M} = require('../db_apis/get_hr_binned');
const {getHr12Hv2, getHr5Hv2, getHr1Dv2, getHr5Mv2} = require('../db_apis/get_hr_binned_v2');
const {getHrCalc12H, getHrCalc5H, getHrCalc1D, getHrCalc5M} = require('../db_apis/get_hr_calc');
const {getRawHr} = require('../db_apis/get_raw_hr');
const {getLab, getLabV2} = require('../db_apis/get_labs');
const {getDrugInfusions,getDrugIntermittent} = require('../db_apis/get_drug');

const {testHr} = require('../test/test-vitals');
const {testLabs} = require('../test/test-labs');


// ````````````````````````````````````````````````````
// apidoc folder is a static files folder
// user express.static to display this index.html
// ````````````````````````````````````````````````````
router.use(express.static(__dirname + '/../apidoc'));
router.get('/', function(req, res) {
  try {
        res.type('text/html');
    res.sendFile('/apidoc/index.html');
  }

  catch(e){
    res.send("error");
  }
});


// ``````````````````````````````````````````````
//         api start
// ``````````````````````````````````````````````
/**
 * @api {get} /person/:person_id/labs Labs for Patient
 * @apiVersion 0.0.1
 * @apiName Get Patient Labs
 * @apiGroup Person
 * @apiParam {Number} person_id patient unique ID.
 * @apiSuccess {String} labName Name of this lab, such as "SvO2".
 * @apiSuccess {Number} timestamp UNIX Timestamp seconds of the lab.
 * @apiSuccess {Number} labValue Value of this lab.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       labName: [
 *                    {
 *                       "DT_UNIX": timestamp,
 *                       "VALUE": labValue
 *                    },
 *                    ...
 *                 ],
 *        ...
 *     }
 *
 */
router.get('/person/:person_id/labs', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('/person/ %s /labs ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getLab(binds),
  );
});


/**
 * @api {post} /labs Labs api/labs
 * @apiVersion 0.0.1
 * @apiName Get Labs for patient
 * @apiGroup Person
 * @apiDescription Current available lab category names:
 *
 * 'Albumin', 'Alk Phos', 'BNP', 'HCO3', 'BUN', 'Cr',
 *
 * 'D-dimer', 'Lactate', 'SvO2', 'SaO2', 'PaCO2', 'pH',
 * 'PaO2', 'TnI', 'TnT'
 *
 * @apiParam {Number} person_id patient unique ID.
 * @apiParam {String[]} lab_names Array of lab's category name.
 * @apiParamExample {json} POST json example
        {
          "person_id": 25796315,
          "lab_names": ["SvO2", "PaCO2"]
        }
 * @apiSuccess {String} labName Name of this lab, such as "SvO2".
 * @apiSuccess {Number} timestamp UNIX Timestamp seconds of the lab.
 * @apiSuccess {Number} labValue Value of this lab.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       labName: [
 *                    {
 *                       "DT_UNIX": timestamp,
 *                       "VALUE": labValue
 *                    },
 *                    ...
 *                 ],
 *        ...
 *     }
 *
 */
router.post('/labs', async (req, res)=>{
  const query = req.body;
  try {
    const toSend = await getLabsQuery(query);
    res.send(
        toSend,
    );
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});


/**
 * @api {get} /person/:person_id/labsv2 Labs for Patient V2
 * @apiVersion 0.0.2
 * @apiName Get Patient Labs V2
 * @apiGroup Person
 * @apiParam {Number} person_id patient unique ID.
 *
 * @apiSuccess {Number} timestamp UNIX Timestamp seconds of the lab.
 * @apiSuccess {String} labName Name of this lab, such as "SvO2".
 * @apiSuccess {Number} labValue Value of this lab.
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
      {
        "keys":
          [
            labName,
            ...
          ],
        "data":
          [
            {
                "time": timestamp,
                labName : labValue,
                ...
              },
              ...
          ]
      }
 *
 */

router.get('/person/:person_id/labsv2', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting labsV2 for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getLabV2(binds),
  );
});


/**
 * @api {get} /person/:person_id/vitals/hr/binned/:data_resolution Binned Heart Rate
 * @apiVersion 0.0.1
 * @apiName Get Person Hr Binned
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiSuccess {String} range Range of the binned heart rate, for example, "90-100".
 * @apiSuccess {Number} value Value of the binned heart rate.
 * @apiSuccess {Number} from_timestamp UNIX timestamp seconds for start time.
 * @apiSuccess {Number} to_timestamp UNIX timestamp seconds for end time.
 * @apiSuccess {Number} average_timestamp UNIX timestamp seconds for average of start and end time.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
      [
        {
          range: value,
          ...
          "from": from_timestamp,
          "to": to_timestamp,
          "time" : average_timestamp
        }
      ]
 *
 */

router.get('/person/:person_id/vitals/hr/binned/12H', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_12H for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHr12H(binds),
  );
});

router.get('/person/:person_id/vitals/hr/binned/5H', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_5H for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHr5H(binds),
  );
});

router.get('/person/:person_id/vitals/hr/binned/1D', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_1D for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHr1D(binds),
  );
});

router.get('/person/:person_id/vitals/hr/binned/5M', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_5M for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHr5M(binds),
  );
});


/**
 * @api {get} /person/:person_id/vitals/hr/binnedv2/:data_resolution Binned Heart Rate V2
 * @apiVersion 0.0.2
 * @apiName Get Person Hr Binned V2
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiSuccess {String} bin_id BIN_ID in Table 'DEF_VITALS_LMT' in DWTST-Schema.
 * @apiSuccess {Number} lmt_st LMT_ST in Table 'DEF_VITALS_LMT' in DWTST-Schema.
 * @apiSuccess {Number} lmt_end LMT_END in Table 'DEF_VITALS_LMT' in DWTST-Schema.
 * @apiSuccess {Number} value Value number of this BIN_ID lab during from and to timestamps.
 * @apiSuccess {Number} from_timestamp UNIX timestamp seconds for start time.
 * @apiSuccess {Number} to_timestamp UNIX timestamp seconds for end time.
 * @apiSuccess {Number} average_timestamp UNIX timestamp seconds for average of start and end time.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
      [
        {
          bin_id : [lmt_st, lmt_end],
          ...
        },
        {
          bin_id: value,
          ...
          "from" : from_timestamp,
          "to" : to_timestamp,
          "time" : average_timestamp
        }
      ]
 *
 */

router.get('/person/:person_id/vitals/hr/binnedv2/12H', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_12H for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHr12Hv2(binds),
  );
});

router.get('/person/:person_id/vitals/hr/binnedv2/5H', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_5H for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHr5Hv2(binds),
  );
});

router.get('/person/:person_id/vitals/hr/binnedv2/1D', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_1D for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHr1Dv2(binds),
  );
});

router.get('/person/:person_id/vitals/hr/binnedv2/5M', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_5M for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHr5Mv2(binds),
  );
});

/**
 * @api {get} /person/:person_id/vitals/hr/calc/:data_resolution Calc Heart Rate
 * @apiVersion 0.0.1
 * @apiName Get Person Hr Calc
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiSuccess {String} perc Percentile String such as "perc25".
 * @apiSuccess {Number} perc_value Value of this percentile.
 * @apiSuccess {Number} mean_value Value of VAL_MEAN.
 * @apiSuccess {Number} timestamp UNIX timestamp seconds of average start and end time.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
      [
        {
          perc: perc_value,
          ...
          "mean": mean_value,
          "time": timestamp
        },
        ...
      ]
 *
 */


router.get('/person/:person_id/vitals/hr/calc/12H', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_12H for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHrCalc12H(binds),
  );
});

router.get('/person/:person_id/vitals/hr/calc/5H', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_5H for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHrCalc5H(binds),
  );
});

router.get('/person/:person_id/vitals/hr/calc/1D', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_1D for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHrCalc1D(binds),
  );
});

router.get('/person/:person_id/vitals/hr/calc/5M', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting hr_5M for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getHrCalc5M(binds),
  );
});




/**
 * @api {get} /person/:person_id/drug/intermittent Drug Intermittent
 * @apiVersion 0.0.1
 * @apiName Get Person Drug Intermittent
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} name Drug name.
 * @apiSuccess {Number} DOSING_WEIGHT Value of this drug.
 * @apiSuccess {Number} timestamp timestamp of this drug.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
      [
        {
          "name": Drug,
          "dose": DOSING_WEIGHT,
          "start": timestamp
        },
        ...
      ]
 *
 */
router.get('/person/:person_id/drug/intermittent', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting drug intermittent for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getDrugInfusions(binds),
  );
});

/**
 * @api {get} /person/:person_id/drug/infusions Drug Infusions
 * @apiVersion 0.0.1
 * @apiName Get Person Drug Infusions
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} drug name of this drug.
 * @apiSuccess {Number} infusion_rate Value of this drug.
 * @apiSuccess {Number} from_timestamp start timestamp of this drug.
 * @apiSuccess {Number} to_timestamp end timestamp of this drug.

 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
      [
        {
          "name": drug,
          "dose": infusion_rate,
          "start": from_timestamp,
          "end": to_timestamp
        },
        ...
      ]
 *
 */
router.get('/person/:person_id/drug/infusions', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  console.log('getting drug infusions for %s ...', person_id);

  const binds = {
    person_id,
  };
  res.send(
      await getDrugIntermittent(binds),
  );
});





// ~~~~~~~~-----------------------------
/**
 * @api {post} /vitals Binned api/vitals
 * @apiVersion 0.0.2
 * @apiName Get Vitals Binned
 * @apiGroup Vitals
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {String="binned"} data_type Type of data.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiParamExample {json} POST json example
        {
          "person_id": 25796315,
          "vital_type": "mbp",
          "data_type": "binned",
          "data_resolution": "1D"
        }

  * @apiSuccess {String} bin_id BIN_ID in Table 'DEF_VITALS_LMT' in DWTST-Schema.
  * @apiSuccess {Number} lmt_st LMT_ST in Table 'DEF_VITALS_LMT' in DWTST-Schema.
  * @apiSuccess {Number} lmt_end LMT_END in Table 'DEF_VITALS_LMT' in DWTST-Schema.
  * @apiSuccess {Number} value Value number of this BIN_ID lab during from and to timestamps.
  * @apiSuccess {Number} from_timestamp UNIX timestamp seconds for start time.
  * @apiSuccess {Number} to_timestamp UNIX timestamp seconds for end time.
  * @apiSuccess {Number} average_timestamp UNIX timestamp seconds for average of start and end time.
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     [
            {
              bin_id : [lmt_st, lmt_end],
              ...
            },
            {
              bin_id: value,
              ...
              "from" : from_timestamp,
              "to" : to_timestamp,
              "time" : average_timestamp
            }
        ]

  *
  */

/**
 * @api {post} /vitals Calc api/vitals
 * @apiVersion 0.0.2
 * @apiName Get Vitals Calc
 * @apiGroup Vitals
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {String="calc"} data_type Type of data.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiParamExample {json} POST json example
        {
          "person_id": 25796315,
          "vital_type": "mbp",
          "data_type": "calc",
          "data_resolution": "1D"
        }

 * @apiSuccess {String} perc Percentile String such as "perc25".
 * @apiSuccess {Number} perc_value Value of this percentile.
 * @apiSuccess {Number} mean_value Value of VAL_MEAN.
 * @apiSuccess {Number} timestamp UNIX timestamp seconds of average start and end time.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
          {
            perc: perc_value,
            ...
            "mean": mean_value,
            "time": timestamp
          },
          ...
       ]
 *
 */

/**
 * @api {post} /vitals Raw api/vitals
 * @apiVersion 0.0.2
 * @apiName Get Vitals Raw
 * @apiGroup Vitals
 * @apiDescription Request vitals raw data from POST json
 *
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {Number} from Start timestamp.
 * @apiParam {Number} to End timestamp.
 * @apiParamExample {json} Example of request vitals raw data
        {
          "person_id": 25796315,
          "vital_type": "mbp",
          "from":1542014000,
          "to":1542018000
        }
 * @apiSuccess {Number} value Vitals raw data.
 * @apiSuccess {Number} timestamp time in Unix seconds.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
      [
        {
          "value": value,
          "time": timestamp
        },
        ...
      ]
 *
 */

router.post('/vitals', async (req, res) => {
  const query = req.body;
  try {
    const toSend = await getVitalsQuery(query);
    res.send(
        toSend,
    );
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});

// raw hr bewteen two timestamp

/**
 * @api {get} /person/:person_id/vitals/hr/raw?from=:from&to=:to Raw Heart Rate
 * @apiVersion 0.0.1
 * @apiName Get Person Hr Raw
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {Number} from from timestamp in UNIX seconds.
 * @apiParam {Number} to to timestamp in UNIX seconds.
 * @apiSuccess {Number} data_value Heart rate raw data.
 * @apiSuccess {Number} timestamp time in Unix seconds.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
      [
        {
          "value": data_value,
          "time": timestamp
        },
        ...
      ]
 *
 */

router.get('/person/:person_id/vitals/hr/raw', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  const from = parseFloat(req.query.from) || Date.now()/1000 - 600;
  const to = parseFloat(req.query.to) || Date.now()/1000;
  console.log('Date.now():', Date.now());
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  console.log('getting raw hr for %s from %d to %d ...', binds.person_id, binds.from_, binds.to_);
  res.send(
      await getRawHr(binds),
  );
});


// ~~~~~~~~~~~~~~~~~~~
//        test
// ~~~~~~~~~~~~~~~~~~~
/**
 * @api {post} /test/hr Test heart rate
 * @apiVersion 0.0.2
 * @apiName Test heart rate got from 2 APIs
 * @apiGroup _Test
 * @apiDescription Compare current 2 groups apis for getting hear rate data:
 * 
 * 1. [POST http://twist:3333/api/vitals] 
 *    Binned api/vitals for heart rate only
 * 
 * or Calc api/vitals for heart rate only
 * 
 * or Raw api/vitals for heart rate only
 * 
 * 2. [GET http://twist:3333/api/person/:person_id/vitals/hr/binnedv2/:data_resolution]
 * 
 *    Binned Heart Rate V2 
 * 
 * or [GET http://twist:3333/api/person/:person_id/vitals/hr/calc/:data_resolution]
 * 
 *    Calc Heart Rate
 * 
 * or [GET http://twist:3333/api/person/:person_id/vitals/hr/raw?from=:from&to=:to]
 * 
 *    Raw Heart Rate
 *  
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="hr"} vital_type Type of vital.
 * @apiParam {String="binned, calc"} data_type Type of data.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiParamExample {json} POST json example
        {
            "person_id": 25796315,
            "vital_type": "hr",
            "data_type": "binned",
            "data_resolution": "1D"
        }
 * @apiSuccess {Number} str1Length Result from API1.
 * @apiSuccess {Number} str2Length Result from API2.
 * @apiSuccess {Number} sameNumber Count same number of chars of 2 results.
 * @apiSuccessExample Success-Response:
        HTTP/1.1 200 OK
        Test success.
        207613: 'POST /vitals' get characters length.
        207613: 'GET /person/:person_id/vitals/hr/calc' get characters length.
        207613: same characters number.
 *
 */

router.post('/test/hr', async (req, res) => {
  const query = req.body;
  try {
    const toSend = await testHr(query);
    res.send(
        toSend,
    );
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});


/**
 * @api {post} /test/labs Test labs
 * @apiVersion 0.0.2
 * @apiName Test labs got from 2 APIs
 * @apiGroup _Test
 * @apiDescription Compare current 2 groups apis for getting labs data:
 * 
 * Only compare requested labs names in the POST json.
 * 
 * "lab_names" could be: [ "Albumin", "Alk Phos", "BNP", "HCO3", "BUN", "Cr", "D-dimer", "Lactate", "SvO2", "SaO2", "PaCO2", "pH", "PaO2", "TnI", "TnT" ]
 *  * 
 * 1. [POST http://twist:3300/api/labs] 
 * 
 *    Get Labs for patient
 * 
 * 2. [GET http://twist:3300/api/person/:person_id/labs]
 * 
 *    Get Patient Labs
 *  
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String} lab_names Lab category name.
 * @apiParamExample {json} POST json example
        {
            "person_id": 25796315,
            "lab_names": 
                [
                    "SvO2",
                    "PaCO2"
                ]
        }
 * @apiSuccess {Number} str1Length Result from API1.
 * @apiSuccess {Number} str2Length Result from API2.
 * @apiSuccess {Number} sameNumber Count same number of chars of 2 results.
 * @apiSuccessExample Success-Response:
        ✔✔✔ Test success.
        ✔ SvO2
        ✔ PaCO2
 *
 */
router.post('/test/labs', async (req, res) => {
  const query = req.body;
  try {
    const toSend = await testLabs(query);
    res.send(
        toSend,
    );
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});


// ```````````````````````
// api from Lingyu Zhou
// 
// ```````````````````````
router.get('/person/:person_id/RSS', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  const from = parseFloat(req.query.from) || 0;
  const to = parseFloat(req.query.to) || Date.now();
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  res.send(
      await getRespiratorySupportVariable(binds),
  );
});

router.get('/person/:person_id/HR', async (req, res)=>{
  const person_id = parseFloat(req.params.person_id);
  const from = parseFloat(req.query.from) || 0;
  const to = parseFloat(req.query.to) || Date.now();
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  res.send(
      await getHeartRate(binds),
  );
});

router.get('/HeartRate', async (req, res) => {
  const person_id = parseInt(req.query.person_id);
  const from = parseFloat(req.query.from) || 0;
  const to = parseFloat(req.query.to) || Date.now();
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  res.send(
      await getHeartRate(binds),
  );
});

router.get('/Person/:person_id', async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  const binds = {
    person_id,
  };
  res.send(
      await getPerson(binds),
  );
});

router.get('/Personel/:chb_prsnl_id', async (req, res) => {
  const chb_prsnl_id = parseInt(req.params.chb_prsnl_id);
  // const binds = {
  //   chb_prsnl_id,
  // };
  res.send(
      await getPersonel(chb_prsnl_id),
  );
});

router.get('/survey/bed_space', async (req, res) => {
  const at = parseFloat(req.query.at);
  const binds = {
    at_unix_ts: at,
  };
  res.send(
      await getBedSurvey(binds),
  );
});

router.get('/Bed/:bed_cd', async (req, res) => {
  const bed_cd = parseFloat(req.params.bed_cd);
  const binds = {
    bed_cd,
  };
  res.send(
      await getBed(binds),
  );
});

// ~~~~~~~~~~~~~~~~~~~~
// api from Lingyu Zhou
// FHIR like API
// relational-query
// ~~~~~~~~~~~~~~~~~~~~~
router.get('/RespiratorySupportVariable', async (req, res)=>{
  const person_id = parseFloat(req.query.person_id);
  const from = parseFloat(req.query.from) || 0;
  const to = parseFloat(req.query.to) || Date.now();
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  res.send(
      await getRespiratorySupportVariable(binds),
  );
});

router.post('/relational-query', async (req, res) => {
  const query = req.body;
  try {
    const toSend = await getRelationalQuery(query);
    res.send(
        toSend,
    );
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(500);
    res.send(e.toString());
  }
});

// ~~~~~~~~~~
// api end
// ~~~~~~~~~~


module.exports = router;

