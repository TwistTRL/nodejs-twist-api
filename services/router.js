/*
 * @Author: Mingyu/Peng
 * @Date:
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-17 11:50:02
 */
const sleep = require("util").promisify(setTimeout);
const express = require("express");
const path = require("path");
const router = new express.Router();
const jwt = require("jsonwebtoken");

// redis
const { getApiFromRedis } = require("../config/redis-config");

const { getDiagnosis, testDiagnosis } = require("../db_apis/phenotyping/get-diagnosis");
const {
  diagnosisGetMRN,
  diagnosisGetAnatomy,
  diagnosisGetCodes,
  diagnosisGetProcedure,
} = require("../db_apis/phenotyping/get-diagnosis-steps");

const { getAdtCensus } = require("../db_apis/cross_tables/get-adt-census");
const { getCensus } = require("../db_apis/cross_tables/get-census");
const { getRadiology } = require("../db_apis/get-radiology");
const { getInitialFetch } = require("../db_apis/db_basic_tables/get-init-fetch");
const { getRelationalQuery } = require("../db_apis/get-relational-query");
const { getVitalsQuery } = require("../db_apis/get-vitals-all");
const { getVitalsQueryV2 } = require("../db_apis/get-vitals-all-v2");
const { getTemperature } = require("../db_apis/get-temperature");

const { getLabsQuery } = require("../db_apis/get-labs-all");
const { getRespiratorySupportVariable } = require("../db_apis/get_respiratory_support_variables");
const { getHeartRate } = require("../db_apis/get_heart_rate");
const { getPerson, getPersonFromMRN } = require("../db_apis/get_person");
const { getWeight, getWeightCalc } = require("../db_apis/get-weight");
const { getPersonel } = require("../db_apis/get_personel");
const { getBed } = require("../db_apis/get_bed");
const { getBedSurvey } = require("../db_apis/get_bed_survey");
const { getHr12H, getHr5H, getHr1D, getHr5M } = require("../db_apis/get_hr_binned");
const { getHr12Hv2, getHr5Hv2, getHr1Dv2, getHr5Mv2 } = require("../db_apis/get_hr_binned_v2");
const { getHrCalc12H, getHrCalc5H, getHrCalc1D, getHrCalc5M } = require("../db_apis/get_hr_calc");
const { getRawHr } = require("../db_apis/get_raw_hr");
const { getLab, getLabV2, getABG } = require("../db_apis/get_labs");
const { getDrugInfusions, getOrangeDrug, getDrugIntermittent } = require("../db_apis/get_drug");

const { getMed } = require("../db_apis/get-med");

const { getInOutTooltipQueryV2 } = require("../db_apis/get-in-out-tooltip-v2");
const { getInOutTooltipQueryV1 } = require("../db_apis/get-in-out-tooltip-v1"); // Deprecated

const { getInOutQuery } = require("../db_apis/get-in-out");

const { getInOutQueryV2 } = require("../db_apis/get-in-out-v2");
const { getMacroNutrients } = require("../db_apis/get-macro-nutrients");
const { getECMO } = require("../db_apis/get-ecmo");
const { getTpnNutrients } = require("../db_apis/get-tpn-nutrition-calc");
const { getDiluNutrients } = require("../db_apis/get-diluent-nutrition-calc");
const { getNutriFatProCho } = require("../db_apis/get-nutrition-fat-pro-cho");
const { getFormula } = require("../db_apis/get-formula");
const { getNutriVolume } = require("../db_apis/get-nutrition-volume");
const { getNutriCalories } = require("../db_apis/get-nutrition-calories");
const { getNutriGIR } = require("../db_apis/get-nutrition-GIR");

const { getMicbio } = require("../db_apis/get-microbiology");

const { getTemp } = require("../db_apis/get-temp");

const { testHr } = require("../test/test-vitals");
const { testLabs } = require("../test/test-labs");

const { testDrugInfusions } = require("../test/test_drug_overlap");

const { testDrugInfusionsTime } = require("../test/test_drug_time");

const { getPersonnelForPatient } = require("../db_apis/cross_tables/get_personnel_for_patient");

const { getNUTime } = require("../db_apis/cross_tables/get_room_time");

const test_crash = require("../test/test-crash");
const { testAbnormalMRN } = require("../test/test_abnormal_mrn");

const settingsFluid = require("../db_relation/in-out-db-relation");

const settingsMed = require("../db_relation/drug-category-relation");
const settingsMicBio = require("../db_relation/microbiology-db-relation");
const settingsRadio = require("../db_relation/radiology-db-relation");

const { getAccessToken, getPDFUrl } = require("../cerner_apis/get-FHIR-api");

// >>------------------------------------------------------------------------>>
// apidoc folder is a static files folder
// user express.static to display this index.html
router.use("/", express.static(__dirname + "/../docs/apidoc"));
router.use("/apidoc2", express.static(__dirname + "/../docs/apidoc2"));
router.use("/files", express.static(__dirname + "/../docs/files"));
// <<------------------------------------------------------------------------<<

// >>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>>
// middleware for authentication
const accessTokenSecret = process.env.TWIST_API_TOKEN_SECRET || "youraccesstokensecret";
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // since the authorization header has a value in the format of Bearer [JWT_TOKEN]
    const token = authHeader.split(" ")[1];

    // verify the token with JWT
    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// ~~~~ use as:
// app.get('/something', authenticateJWT, (req, res) => {
/** for checking role
   *     const { role } = req.user;
      if (role !== 'admin') {
          return res.sendStatus(403);
      }
  */
//   res.json(something);
// });
// <<~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~<<

// ``````````````````````````````````````````````
//         api start
// ``````````````````````````````````````````````

/**
 * @api {get} /phenotyping/test Phenotyping Test
 * @apiVersion 0.0.1
 * @apiName get-phenotyping-test
 * @apiDescription These diagnosis are not listed in xlsx file
 * @apiGroup Phenotyping
 *
 *
 */

router.get("/phenotyping/test", async (req, res) => {
    res.send(await testDiagnosis());
});

/**
 * @api {get} /phenotyping/:person_id Phenotyping Diagnosis
 * @apiVersion 0.0.1
 * @apiName get-phenotyping-diagnosis
 * @apiDescription get_patients_based_on_original_anatomy

    input: person_id
    
    output: get a list of patients mrn with earliest date. 
    
  these patients have the same `dominant_proc` with the input patient's `codes` of `native_disease`(`anatomy`)

 * @apiGroup Phenotyping
 * @apiParam {Number} person_id Patient person id
 * @apiSuccessExample Success-Response:
 *{
    "Biventricular Aortic valve-AS- Moderate to severe 1": [
        {
            "mrn": "123",
            "time": "1992-03-06T04:00:00.000Z"
        },
    ],
  }

 */

router.get("/phenotyping/:person_id", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id is: " + person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  getApiFromRedis(res, getDiagnosis, person_id, "interface-phenotyping-diagnosis");
});

/**
 * @api {get} /phenotyping/mrn/:person_id 2.MRN
 * @apiVersion 0.0.1
 * @apiName get-phenotyping-diagnosis-mrn
 * @apiDescription step 2

    input: person_id
    
    output: mrn of this patient. 
    
 * @apiGroup Phenotyping
 * @apiParam {Number} person_id Patient person id
 * @apiSuccessExample Success-Response:
 *[
    "100000"
  ]

 */

router.get("/phenotyping/mrn/:person_id", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id is: " + person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  getApiFromRedis(res, diagnosisGetMRN, person_id, "interface-phenotyping-diagnosis-mrn");
});

/**
 * @api {get} /phenotyping/anatomy/:mrn 3.Anatomy
 * @apiVersion 0.0.1
 * @apiName get-phenotyping-diagnosis-anatomy
 * @apiDescription step 3

    input: mrn
    
    output: anatomy of this patient. 
    
 * @apiGroup Phenotyping
 * @apiParam {String} mrn Patient MRN
 * @apiSuccessExample Success-Response:
 *[
    {
        "MRN": "10000000",
        "ANATOMY": "Aortic valve - AS - Moderate to severe",
        "SUBCAT_ANAT": "Aortic valve - AS - Moderate to severe",
        "SUBCAT_NAME": "Commissure",
        "SUBCAT_VALUE": "Unmentioned",
        "COVARIATE": null
    },
  ]

 */

router.get("/phenotyping/anatomy/:mrn", async (req, res) => {
  const mrn = req.params.mrn;
  console.log("mrn is: " + mrn);
  getApiFromRedis(res, diagnosisGetAnatomy, mrn, "interface-phenotyping-diagnosis-anatomy");
});


/**
 * @api {get} /phenotyping/codes/:anatomy/:prior_group 4.Codes
 * @apiVersion 0.0.1
 * @apiName get-phenotyping-diagnosis-codes
 * @apiDescription step 4

    input: `anatomy`, `prior_group`
    
    output: codes for next group.
    
 * @apiGroup Phenotyping
 * @apiParam {String} anatomy `native_disease`
 * @apiParam {String} prior_group `prior_group` in `groups`
 * @apiSuccessExample Success-Response:
 *{
    "TOF repair 1": [
        ["VSD closure",
         "RVOT reconstruction"],
        ["DORV repair"],
        ["VSD closure",
         "Pulmonary valvuloplasty"],
        ["TOF repair"]
    ],
    "Palliative TOF 1": [
        ["Unifocalization pulmonary artery and collaterals"],
        ["Main pulmonary arterial banding"],
        ["PDA enlargement"],
        ["Systemic-to-pulmonary artery shunt"]
    ]
  }
 */

router.get("/phenotyping/codes/:anatomy/:prior_group", async (req, res) => {
  const anatomy = req.params.anatomy;
  const prior_group = req.params.prior_group || "";
  console.log("anatomy is: " + anatomy);
  console.log("prior_group is: " + prior_group);
  if (!anatomy) {
    res.send({});
    return;
  }
  getApiFromRedis(res, diagnosisGetCodes, {anatomy, prior_group}, "interface-phenotyping-diagnosis-codes");
});

router.get("/phenotyping/codes/:anatomy", async (req, res) => {
  const anatomy = req.params.anatomy;
  const prior_group = "";
  console.log("anatomy is: " + anatomy);
  console.log("prior_group is: " + prior_group);
  if (!anatomy) {
    res.send({});
    return;
  }
  getApiFromRedis(res, diagnosisGetCodes, {anatomy, prior_group}, "interface-phenotyping-diagnosis-codes");
});

/**
 * @api {get} /phenotyping/procedure/:codes 5.Procedure
 * @apiVersion 0.0.1
 * @apiName get-phenotyping-diagnosis-procedure
 * @apiDescription step 5

    input: list of list codes
    
    output: matched MRNs count and arrays of id/date of matched procedure.
    
 * @apiGroup Phenotyping
 * @apiParam {String} codes disease - group - codes
 * @apiSuccessExample Success-Response:
  {
    "mrn_count": 1544,
    "mrn_proc": [
        {
            "mrn": "10001",
            "time": [
                680500800,
                "1992-03-06T04:00:00.000Z"
            ],
            "proc": [
                "Aortic valvuloplasty"
            ],
            "id": 22664
        },
    ]
  }
 *

 */

router.get("/phenotyping/procedure/:codes", async (req, res) => {
  const codes =  JSON.parse(req.params.codes);
  console.log("codes is: " + codes);
  getApiFromRedis(res, diagnosisGetProcedure, codes, "interface-phenotyping-diagnosis-procedure");
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * @api {get} /census/:timestamp Census data
 * @apiVersion 0.0.1
 * @apiName get-census
 * @apiGroup Census
 * @apiParam {Number} timestamp Unix Timestamp in seconds.
 */

router.get("/census/:timestamp", async (req, res) => {
  const timestamp = parseInt(Math.floor(req.params.timestamp / 60) * 60) || parseInt(Math.floor(Date.now() / 1000 / 60) * 60);
  console.log("timestamp is: " + timestamp);
  getApiFromRedis(res, getAdtCensus, timestamp, "interface-adt-census");
});

router.get("/census", async (req, res) => {
  const timestamp = parseInt(parseInt(Math.floor(Date.now() / 1000 / 60) * 60));
  console.log("timestamp is: " + timestamp);
  getApiFromRedis(res, getAdtCensus, timestamp, "interface-adt-census");
});


/**
 * @api {get} /censusv0/:timestamp Census data old
 * @apiVersion 0.0.1
 * @apiName get-census-old
 * @apiGroup Census
 * @apiParam {Number} timestamp Unix Timestamp in seconds.
 *
 *
 */

router.get("/censusv0/:timestamp", async (req, res) => {
  const timestamp = parseInt(Math.floor(req.params.timestamp / 60) * 60) || parseInt(Math.floor(Date.now() / 1000 / 60) * 60);
  console.log("timestamp is: " + timestamp);
  getApiFromRedis(res, getCensus, timestamp, "interface-census");
});

router.get("/censusv0", async (req, res) => {
  const timestamp = parseInt(parseInt(Math.floor(Date.now() / 1000 / 60) * 60));
  console.log("timestamp is: " + timestamp);
  getApiFromRedis(res, getCensus, timestamp, "interface-census");
});


/**
 * @api {get} /person/:person_id/radiology Radiology image
 * @apiVersion 0.0.1
 * @apiName get-radiology
 * @apiGroup Person
 * @apiParam {Number} person_id Patient ID.
 * @apiSuccessExample Success-Response:
      [
        {
            "order_id": 2100000,
            "catalog_cd": 220000,
            "display": "XR-Chest 1 View",
            "accession_number": 230000,
            "reason_for_exam": "admission",
            "order_physician_id": 120000,
            "dt_unix": 1500000000,
            "location": [
                "Chest"
            ],
            "study_type": [
                "XR"
            ],
            "token": "TOKEN@#$%^"
        },
      ]
 *
 */

router.get("/person/:person_id/radiology", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id is: " + person_id);
  getApiFromRedis(res, getRadiology, person_id, "interface-radiology");
});

/**
 * @api {get} /mrn/:mrn/init Initial data for patient
 * @apiVersion 0.0.1
 * @apiName initial-patient
 * @apiGroup MRN
 * @apiParam {Number} mrn patient mrn.
 *
 * @apiSuccessExample Success-Response:
 *     
      {
            // data saved into redis cache
            "inoutSize": 1000,
            "nutriFpcSize": 200,
            "nutriVolumeSize": 300,
            "nutriCaloriesSize": 400            
      }
 *
 */

router.get("/mrn/:mrn/init", async (req, res) => {
  const mrn = req.params.mrn;
  console.log("mrn is: " + mrn);
  res.send(await getInitialFetch(mrn));
});

/**
 * @api {get} /mrn/:mrn Person ID From MRN
 * @apiVersion 0.0.1
 * @apiName Get Patient Person ID From MRN
 * @apiGroup MRN

 * @apiParam {Number} mrn Patient MRN.
 * @apiSuccess {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
      {
        "PERSON_ID": person_id        
      }
 *
 */

router.get("/mrn/:mrn", async (req, res) => {
  const mrn = req.params.mrn;
  console.log("mrn is: " + mrn);
  res.send(await getPersonFromMRN(mrn));
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
          "person_id": EXAMPLE_PERSON_ID,
          "lab_names": ["SvO2", "PaCO2"]
        }
 * @apiSuccess {String} labName Name of this lab, such as "SvO2".
 * @apiSuccess {Number} timestamp UNIX Timestamp seconds of the lab.
 * @apiSuccess {Number} labValue Value of this lab.
 * @apiSuccessExample Success-Response:
 *      
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
router.post("/labs", async (req, res) => {
  const query = req.body;
  try {
    const toSend = await getLabsQuery(query);
    res.send(toSend);
    return;
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
 * @apiName get-patient-labs-v2
 * @apiGroup Person
 * @apiParam {Number} person_id patient unique ID.
 *
 * @apiSuccess {Number} timestamp UNIX Timestamp seconds of the lab.
 * @apiSuccess {String} labName Name of this lab, such as "SvO2".
 * @apiSuccess {Number} labValue Value of this lab.
 * @apiSuccessExample Success-Response:
 *     
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

router.get("/person/:person_id/labsv2", async (req, res) => {
  const person_id = parseInt(req.params.person_id);

  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }

  console.log("getting labsV2 for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getLabV2(binds));
});

/**
 * @api {get} /person/:person_id/abg Labs ABG for Patient
 * @apiVersion 0.0.1
 * @apiName Get Patient ABG Labs V2
 * @apiGroup Person
 * @apiParam {Number} person_id patient unique ID.
 *
 * @apiSuccess {Number} timestamp UNIX Timestamp seconds of the lab.
 * @apiSuccess {String} labName Name of this lab, such as "SvO2".
 * @apiSuccess {Number} labValue Value of this lab.
 * @apiSuccessExample Success-Response:
     
          [
            {
                "time": timestamp,
                "pH" : labValue,
                "PaCO2" : labValue,
                "PaO2" : labValue,
                "HCO3" : labValue,
                "SaO2" : labValue
              },
              ...
          ]
 *
 */

router.get("/person/:person_id/abg", async (req, res) => {
  const person_id = parseInt(req.params.person_id);

  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }

  console.log("getting abg for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getABG(binds));
});

/**
 * @api {get} /person/:person_id/vitals/hr/binnedv2/:data_resolution Binned Heart Rate V2
 * @apiVersion 0.0.2
 * @apiName Get Person Hr Binned PersonnelV2
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
 *      
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

router.get("/person/:person_id/vitals/hr/binnedv2/12H", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_12H for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHr12Hv2(binds));
});

router.get("/person/:person_id/vitals/hr/binnedv2/5H", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_5H for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHr5Hv2(binds));
});

router.get("/person/:person_id/vitals/hr/binnedv2/1D", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_1D for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHr1Dv2(binds));
});

router.get("/person/:person_id/vitals/hr/binnedv2/5M", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_5M for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHr5Mv2(binds));
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
 *      
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

router.get("/person/:person_id/vitals/hr/calc/12H", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_12H for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHrCalc12H(binds));
});

router.get("/person/:person_id/vitals/hr/calc/5H", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_5H for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHrCalc5H(binds));
});

router.get("/person/:person_id/vitals/hr/calc/1D", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_1D for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHrCalc1D(binds));
});

router.get("/person/:person_id/vitals/hr/calc/5M", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_5M for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHrCalc5M(binds));
});

/**
 * @api {get} /person/:person_id/drug/intermittent Drug Intermittent
 * @apiVersion 0.0.1
 * @apiName Get Person Drug Intermittent
 * @apiGroup Person
 * @apiDescription Current Drug Intermittent names:
 *
 * "epinephrine", "calcium acetate", "hydrocortisone", "albumin human"
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} drug Drug name.
 * @apiSuccess {Number} admin_dosage Dose of this drug.
 * @apiSuccess {Number} timestamp timestamp of this drug.
 * @apiSuccessExample Success-Response:
 *      
      [
        {
          "name": drug,
          "dose": admin_dosage,
          "start": timestamp
        },
        ...
      ]
 *
 */
router.get("/person/:person_id/drug/intermittent", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting drug intermittent for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getDrugIntermittent(binds));
});

/**
 * @api {get} /person/:person_id/drug/infusions Drug Infusions
 * @apiVersion 0.0.1
 * @apiName Get Person Drug Infusions
 * @apiGroup Person
 * @apiDescription Current Drug Infusions names:
 *
 * "DOPamine", "EPINEPHrine", "milrinone", "vasopressin", "norepinephrine"
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} drug name of this drug.
 * @apiSuccess {Number} infusion_rate Value of this drug.
 * @apiSuccess {Number} from_timestamp start timestamp of this drug.
 * @apiSuccess {Number} to_timestamp end timestamp of this drug.
 * @apiSuccess {String} unit_string unit string this drug.

 * @apiSuccessExample Success-Response:
 *      
      [
        {
          "name": drug,
          "dose": infusion_rate,
          "start": from_timestamp,
          "end": to_timestamp,
          "unit": unit_string
        },
        ...
      ]
 *
 */
router.get("/person/:person_id/drug/infusions", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting drug infusions for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getDrugInfusions(binds));
});

/**
 * @api {get} /person/:person_id/drug/paralytics Drug Paralytics
 * @apiVersion 0.0.1
 * @apiName Get Person Paralytics Drug Information
 * @apiGroup Person
 * @apiDescription Current Paralytics Drug names:
 *
[  "cisatracurium",
  "vecuronium",
  "pancuronium",
  "rocuronium",
  "atracurium" ];

  Different paralytics drugs at the same (continuous) time will be combined.

 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {Number} from_timestamp start timestamp of paralytics drugs.
 * @apiSuccess {Number} to_timestamp end timestamp of paralytics drugs.

 * @apiSuccessExample Success-Response:
 *      
      [
        {
          "start": from_timestamp,
          "end": to_timestamp
        },
        ...
      ]
 *
 */
router.get("/person/:person_id/drug/paralytics", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting paralytics drug infusions for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getOrangeDrug(binds));
});

/**
 * @api {get} /person/:person_id/med Medication
 * @apiVersion 0.0.1
 * @apiName get-person-medication
 * @apiGroup Person
 * @apiDescription
 * 
 * based on RXCUI, see /api/files/#x2
 * 
 * In the respond, the "cat_structure": [] is the `MEDICATION_CATEGORY_STRUCTURE` of (#Settings:get-med-setting).
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} drug name of this drug.
 * @apiSuccess {Number} infusion_rate Value of this drug.
 * @apiSuccess {Number} from_timestamp start timestamp of this drug.
 * @apiSuccess {Number} to_timestamp end timestamp of this drug.
 * @apiSuccess {String} unit_string unit string this drug.

 * @apiSuccessExample Success-Response:
 *      
      {
        "COAG": [
            {
                "name": "heparin",
                "dose": 10,
                "start": 1500000000,
                "end": 1520000000,
                "unit": "unit/kg/hr",
                "RXCUI": 111111
            },
            ...
          ]
        ...
      }
 *
 */
router.get("/person/:person_id/med", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting drug infusions for %s ...", person_id);

  getApiFromRedis(res, getMed, { person_id }, "interface-med");
});

/**
 * @api {post} /inout-v2 In-Out V2
 * @apiVersion 0.0.2
 * @apiName in-out-patient-V2
 * @apiGroup Person
 * @apiDescription 
 * Get in-out fluid data based on `person_id`, start time `from`, end time `to`, binned time resolution `resolution`, from table `INTAKE_OUTPUT` and `DRUG_DILUENTS`
 * 
 * Method: 
 * 
 *   ├──part 1: data from `INTAKE_OUTPUT`, value accumulated by `short_label` and records with timestamp during `resolution` time.
 * 
  
 *   └──`from` should be divisible by `resolution`.
 * 
 * Response notes:
 * 
 *   ├──type == `1` ⟹ value is positive (in);
 * 
 *   ├──type == `2` ⟹ value is negative (out);
 * 
 *   ├──type == `0` ⟹ skipped;
 * 
 *   └──value == 0 ⟹ skipped; 
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {Number} [from=0] Start timestamp.
 * @apiParam {Number} [to] End timestamp. Default value: current Unix Time(sec).
 * @apiParam {Number} [resolution=3600] Binned time resolution.
 * @apiParamExample {json} Example of request in-out data
        {
          "person_id": EXAMPLE_PERSON_ID,
          "from":1541030400,
          "to":1542018000,
          "resolution":3600
        }
 * @apiSuccess {Number} value IO value.
 * @apiSuccess {String} cat Name of IO category.
 * @apiSuccess {String} sub_cat Name of IO sub-category.
 * @apiSuccess {String} label Name of IO label.
 * @apiSuccess {String} short_label Name of IO short_label.
 * @apiSuccess {String} color `#` code of color.
 * @apiSuccess {Number} time Unix seconds as the record's start timestamp.
 * @apiSuccess {String} type value of IO_CALCs.

 * @apiSuccessExample Success-Response:
 *    [
        {
          "value": -8,
          "cat": "UOP",
          "sub_cat": "Foley",
          "label": "FOLEY",
          "short_label": "FOL",
          "color": "#e5c124",
          "time": 1541016000,
          "type": "2"
        },
        ...
      ]
 *
 */

router.post("/inout-v2", async (req, res) => {
  let query = {
    person_id: req.body.person_id,
    from: req.body.from || 0,
    to: req.body.to || new Date().getTime() / 1000,
    resolution: req.body.resolution || 3600,
  };
  console.log("query = ", query);
  console.time("inout-time");

  if (!Number.isInteger(query.person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  if (query.from > query.to) {
    res.send("start time must >= end time");
    return;
  }
  if (query.resolution <= 0) {
    res.send('"resolution" must be >= 3600');
    return;
  }
  if (query.resolution % 3600 != 0) {
    res.send('"resolution" should be divisible by 3600');
    return;
  }
  if (query.from % query.resolution != 0) {
    res.send('"from" should be divisible by "resolution"');
    return;
  }

  getApiFromRedis(res, getInOutQueryV2, query, "interface-inout");
});

/**
 * @api {post} /inout-tooltip-v2 In-Out Tooltip V2
 * @apiVersion 0.0.1
 * @apiName in-out-tooltip-v2
 * @apiGroup Person
 * @apiDescription 
 * Get in-out fluid data based on `person_id`, start time `from`, end time `from + resolution - 1`, from table `DRUG_DILUENTS`
 * 
 * Method: 
 * 
 * data from `DRUG_DILUENTS`, if drug is 'papavarine' or 'heparin flush', then cat = "Flushes", value accumulated in each binned time box;
 * other drug , then cat = "Infusions", value accumulated in each binned time box;

 * 
 * Input notes: 
 * 
 *   ├──`resolution` should be divisible by 3600 (seconds in one hour).
 * 
 *   ├──`to` is set to `from + resolution - 1`. 
 * 
 *   └──`from` need be validated by front end.
 * 
 * Output notes:
 * 
 *    ├── the output binned start from the timestamp `from`
 *  
 *    ├── for `Flushes` in the same timestamp, combined same `drug` and `diluent` and `location` (`location` for `Flushes` only, current not ready)
 *    
 *    ├── for `Infusions` in the same timestamp, combined same `drug` and `diluent`
 * 
 *    └── if combined, return the most recent `rate`, `unit`, `conc`, `strength_unit`, and `vol_unit`
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {Number} [from=0] Start timestamp.
 * @apiParam {Number} [resolution=3600] Binned time resolution.
 * @apiParamExample {json} Example of request in-out data
        {
          "person_id": EXAMPLE_PERSON_ID,
          "from":1539568800,
          "resolution":3600
        }

 * @apiSuccessExample Success-Response: *    
 * 
    [
        {
            "1500000000": [
                {
                    "name": "Nutrition",
                    "value": 17.4,
                    "unit": "ml",
                    "items": [
                        {
                            "name": "TPN",
                            "value": 17,
                            "unit": "ml",
                            "items": [
                                {
                                    "name": "Dextrose PN",
                                    "value": 165,
                                    "unit": "g/L"
                                },
                                // ...                            
                            ]
                        },
                        {
                            "name": "Lipids",
                            "value": 0.4,
                            "unit": "ml"
                        }
                    ]
                }
            ]
        },
        {
            "1500000000": [
                {
                    "name": "UOP",
                    "value": -10,
                    "unit": "ml",
                    "items": [
                        {
                            "name": "UOP",
                            "value": -10,
                            "unit": "ml",
                            "sub_cat": "Void",
                            "label": "UOP"
                        }
                    ]
                }
            ]
        }
    ]

 *
 */

router.post("/inout-tooltip-v2", async (req, res) => {
  let new_query = {
    person_id: req.body.person_id,
    from: req.body.from || 0,
    to: req.body.from + req.body.resolution - 1,
    resolution: req.body.resolution || 3600,
  };
  console.log("query = ", new_query);
  console.time("inout-tooltip-time");

  if (!Number.isInteger(new_query.person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  if (new_query.from > new_query.to) {
    res.send("start time must > end time");
    return;
  }
  if (new_query.resolution <= 0 || new_query.resolution % 3600 != 0) {
    res.send('"resolution" must be 3600 * n (n ∈ N)');
    return;
  }
  if (new_query.from % 3600 != 0) {
    res.send('"start" time must be divisible by 3600');
    return;
  }

  getApiFromRedis(res, getInOutTooltipQueryV2, new_query, "interface-inout-tooltip");
});

/**
 * @api {post} /vitalsv2 V2 Binned vitals
 * @apiVersion 0.0.2
 * @apiName get-binned-vitals
 * @apiGroup Vitals
 * @apiDescription 
 * 
 * From STAGING_VITALS_BIN_XX, combined two sources for `mbp`, `sbp`, and `dbp`:
 * 
 * 1. `mbp`: `MBP1` first, if no data then check `NBPM`
 * 
 * 2. `sbp`: `SBP1` first, if no data then check `NBPS`
 * 
 * 3. `dbp`: `DBP1` first, if no data then check `NBPD`
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {String="binned"} data_type Type of data.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiParamExample {json} POST json example
        {
          "person_id": EXAMPLE_PERSON_ID,
          "vital_type": "mbp",
          "data_type": "binned",
          "data_resolution": "1D"
        }

  * @apiSuccess {String} bin_id BIN_ID in Table 'DEF_VITALS_LMT' in DWTST-Schema.
  * @apiSuccess {String} vital_type_string Vital type name such as "SBP1".
  * @apiSuccess {Number} lmt_st LMT_ST in Table 'DEF_VITALS_LMT' in DWTST-Schema.
  * @apiSuccess {Number} lmt_end LMT_END in Table 'DEF_VITALS_LMT' in DWTST-Schema.
  * @apiSuccess {Number} value Value number of this BIN_ID lab during from and to timestamps.
  * @apiSuccess {Number} from_timestamp UNIX timestamp seconds for start time.
  * @apiSuccess {Number} to_timestamp UNIX timestamp seconds for end time.
  * @apiSuccess {Number} average_timestamp UNIX timestamp seconds for average of start and end time.
  * @apiSuccessExample Success-Response:
  *      
  *     [
            {
              bin_id : [lmt_st, lmt_end],
              ...
            },
            {
              bin_id: value,
              ...
              "name": vital_type_string,
              "from" : from_timestamp,
              "to" : to_timestamp,
              "time" : average_timestamp
            }
        ]

  *
  */

/**
 * @api {post} /vitalsv2 V2 Calc vitals
 * @apiVersion 0.0.2
 * @apiName get-calc-vitals
 * @apiGroup Vitals
 * @apiDescription 
 * 
 * From STAGING_VITALS_CALC_XX, combined two sources for `mbp`, `sbp`, and `dbp`:
 * 
 * 1. `mbp`: `MBP1` first, if no data then check `NBPM`
 * 
 * 2. `sbp`: `SBP1` first, if no data then check `NBPS`
 * 
 * 3. `dbp`: `DBP1` first, if no data then check `NBPD`
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {String="calc"} data_type Type of data.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiParamExample {json} POST json example
        {
          "person_id": EXAMPLE_PERSON_ID,
          "vital_type": "sbp",
          "data_type": "calc",
          "data_resolution": "1D"
        }

 * @apiSuccess {Number} perc0 Value of this percentile.
 * @apiSuccess {String} name Vital type name.
 * @apiSuccess {Number} mean Mean Value of this timestamp.
 * @apiSuccess {Number} time UNIX timestamp seconds of average start and end time.
 * @apiSuccessExample Success-Response:
 *      
 *    [
        {
            "perc0": 38,
            "perc1": 43,
            "perc5": 45,
            "perc25": 48,
            "perc50": 54,
            "perc75": 64,
            "perc95": 71,
            "perc99": 73,
            "perc100": 74,
            "mean": 55.99,
            "time": 1500000000,
            "name": "SBP1"
        },
        ...
      ]
 *
 */

/**
 * @api {post} /vitalsv2 V2 Raw Vitals
 * @apiVersion 0.0.2
 * @apiName get-raw-vitals
 * @apiGroup Vitals
 * @apiDescription 
 * 
 * From VITALS, get vitals raw data
 * 
 * data get from table `VITALS`
 * 
 * null value vital records are skiped.
 * 
 * start timestamp >= 946684800 ( i.e. year 2000)
 * 
 * end timestamp <= new Date().getTime() / 1000 (i.e. current time)
 *
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {Number} from Start timestamp.
 * @apiParam {Number} to End timestamp.
 * @apiParamExample {json} Example of request vitals raw data
        {
          "person_id": EXAMPLE_PERSON_ID,
          "vital_type": "mbp",
          "from":1542014000,
          "to":1542018000
        }
 * @apiSuccess {String} vital_type_string Vital type name such as "SBP1".
 * @apiSuccess {Number} value Vitals raw data.
 * @apiSuccess {Number} timestamp time in Unix seconds.
 * @apiSuccessExample Success-Response:
 *      
      [
        {
          "name": vital_type_string,
          "value": value,
          "time": timestamp
        },
        ...
      ]
 *
 */

router.post("/vitalsv2", async (req, res) => {
  let query = req.body;
  query.person_id = Number(query.person_id);
  query.from = Number(query.from);
  query.to = Number(query.to);
  try {
    const toSend = await getVitalsQueryV2(query);
    res.send(toSend);
    return;
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});

/**
 * @api {post} /vitals/temperaturev2 V2 temperature
 * @apiVersion 0.0.2
 * @apiName get-vitals-temperature
 * @apiGroup Vitals
 * @apiDescription 
 * 
 * from tables:
 * `STAGING_VITALS_V500_CALC_12H`, `STAGING_VITALS_V500_CALC_1D`, `STAGING_VITALS_V500_CALC_5H`, `STAGING_VITALS_V500_CALC_5M`
 * `STAGING_VITALS_V500_BIN_12H`, `STAGING_VITALS_V500_BIN_1D`, `STAGING_VITALS_V500_BIN_5H`, `STAGING_VITALS_V500_BIN_5M`
 * 
 * 3 kinds of input (`data_type` = `binned`, `calc`, `raw`), see examples. 
 * "data_type"="raw" is redirected to `Vitals - V2 Raw Vitals`

 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="binned", "calc", "raw"} data_type Type of data.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiParamExample {json} POST json example
        {
          "person_id": EXAMPLE_PERSON_ID,
          "data_type": "binned",
          "data_resolution": "1D"
        }

        {
          "person_id": EXAMPLE_PERSON_ID,
          "data_type": "calc",
          "data_resolution": "1D"
        }

        {
          "person_id": EXAMPLE_PERSON_ID,
          "data_type": "raw",
          "from": 1542014000,
          "to": 1542018000
        }
  * @apiSuccessExample Success-Response:
      // for `binned`:
  *     [
            {
              135: [0, 33],
              136: [33, 33.5]
              ...
            },
            {
              135: 0,
              136: 2,
              ...
              "name": "temp",
              "from" : 150000,
              "to" : 1510000,
              "time" : 150500
            }
        ]

      // for `calc`:      
 *    [
        {
            "perc0": 38,
            "perc1": 43,
            "perc5": 45,
            "perc25": 48,
            "perc50": 54,
            "perc75": 64,
            "perc95": 71,
            "perc99": 73,
            "perc100": 74,
            "mean": 55.99,
            "time": 1500000000,
        },
        ...
      ]

      // for `raw`:
      [
          {
              "time": 1500000000,
              "value": "37.2",
              "type": "TEMPERATURE_ESOPH"
          }
      ]
 *
 */

router.post("/vitals/temperaturev2", async (req, res) => {
  let query = req.body;
  query.person_id = Number(query.person_id);
  try {
    const toSend = await getTemperature(query);
    res.send(toSend);
    return;
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
 * @apiDescription getting Hear rate at timestamp. null value records are skipped.
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {Number} from from timestamp in UNIX seconds.
 * @apiParam {Number} to to timestamp in UNIX seconds.
 * @apiSuccess {Number} data_value Heart rate raw data.
 * @apiSuccess {Number} timestamp time in Unix seconds.
 * @apiSuccessExample Success-Response:
 *      
      [
        {
          "value": data_value,
          "time": timestamp
        },
        ...
      ]
 *
 */

router.get("/person/:person_id/vitals/hr/raw", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  const from = parseFloat(req.query.from) || Date.now() / 1000 - 600;
  const to = parseFloat(req.query.to) || Date.now() / 1000;
  console.log("Date.now():", Date.now());
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  console.log("getting raw hr for %s from %d to %d ...", binds.person_id, binds.from_, binds.to_);
  res.send(await getRawHr(binds));
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
            "person_id": EXAMPLE_PERSON_ID,
            "vital_type": "hr",
            "data_type": "binned",
            "data_resolution": "1D"
        }
 * @apiSuccess {Number} str1Length Result from API1.
 * @apiSuccess {Number} str2Length Result from API2.
 * @apiSuccess {Number} sameNumber Count same number of chars of 2 results.
 * @apiSuccessExample Success-Response:
         
        Test success.
        207613: 'POST /vitals' get characters length.
        207613: 'GET /person/:person_id/vitals/hr/calc' get characters length.
        207613: same characters number.
 *
 */

router.post("/test/hr", async (req, res) => {
  const query = req.body;
  try {
    const toSend = await testHr(query);
    res.send(toSend);
    return;
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
 * "lab_names" could be: [ "Albumin", "Alk Phos", "BNP", "HCO3", "BUN", "Cr",
 *  "D-dimer", "Lactate", "SvO2", "SaO2", "PaCO2", "pH", "PaO2", "TnI", "TnT" ]
 *  * 
 * 1. [POST /api/labs] 
 * 
 *    Get Labs for patient
 * 
 * 2. [GET /api/person/:person_id/labs]
 * 
 *    Get Patient Labs
 *  
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String} lab_names Lab category name.
 * @apiParamExample {json} POST json example
        {
            "person_id": EXAMPLE_PERSON_ID,
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

router.post("/test/labs", async (req, res) => {
  const query = req.body;
  try {
    const toSend = await testLabs(query);
    res.send(toSend);
    return;
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});

/**
 * @api {get} /test/drug/infusions/:person_id Test drug infusions overlap
 * @apiVersion 0.0.1
 * @apiName Test drug infusions overlap
 * @apiGroup _Test
 
 * @apiParam {Number} person_id Patient unique ID.

 */
router.get("/test/drug/infusions/:person_id", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("testing drug infusions for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await testDrugInfusions(binds));
});

/**
 * @api {get} /test/drug/infusions/checktime/:person_id Test drug infusions time
 * @apiVersion 0.0.1
 * @apiName Test drug infusions start end time
 * @apiGroup _Test
 * @apiParam {Number} person_id Patient unique ID.
 */
router.get("/test/drug/infusions/checktime/:person_id", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("testing drug infusions time for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await testDrugInfusionsTime(binds));
});

/**
 * @api {put} /test/crash Test Crash
 * @apiVersion 0.0.1
 * @apiName Test Crash
 * @apiDescription 
 * This will crash the API server.
 * 
 * For pm2 (if started from `npm start`) it will restart the API server
 * 
 * For nodemon (if started from `npm run dev`) it will shutdown.

 * @apiGroup _Test
 */
router.put("/test/crash", async (req, res) => {
  test_crash();
  res.send("crash ...");
});

/**
 * @api {put} /test/abnormal-mrn Get Abnormal MRN
 * @apiVersion 0.0.1
 * @apiName Test mrn

 * @apiGroup _Test
 */
router.put("/test/abnormal-mrn", async (req, res) => {
  res.send(await testAbnormalMRN());
});

/**
 * @api {get} /person/:person_id/personnel Personnel For Patient
 * @apiVersion 0.0.1
 * @apiName Get Personnel For Patient
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {Number} personnel_id Personnel unique ID.
 * @apiSuccessExample Success-Response:
      {
        "personnel_id": personnel_id        
      }
 *
 */

router.get("/person/:person_id/personnel", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting doctors information for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getPersonnelForPatient(binds));
});

/**
 * @api {get} /person/:person_id/nurse-unit Nurse Unit For Patient
 * @apiVersion 0.0.3
 * @apiName Get Nurse Unit Time For Patient
 * @apiGroup Person
 * @apiDescription 
 * 
 * Only keep `08 South` or `08 East` for nurse unit name. Others are `other` if other nurse units or `unknow` if empty. 
 * When nurse unit name is `unknow`, room name and bed name are `` (empty). 
 * 
 * add `id` for each record.
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} nurse_unit_Name Nurse Unit name for patient.
 * @apiSuccess {String} room_name Room name for patient.
 * @apiSuccess {String} bed_name Bed name for patient.
 * @apiSuccess {Number} timestamp Timestamp of this room.
 * @apiSuccess {Number} id_number count id for results.

 * @apiSuccessExample Success-Response:
      {
        "name": nurse_unit_Name,
        "room_name": room_name,
        "bed_name": bed_name,
        "start": timestamp,
        "end": timestamp,
        "id": id_number       
      }
 *
 */

router.get("/person/:person_id/nurse-unit", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting nurse unit information for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getNUTime(binds));
});

// ```````````````````````
// api from Lingyu Zhou
//
// ```````````````````````

/**
 * @api {get} /person/:person_id/RSS RSS For Person
 * @apiVersion 0.0.1
 * @apiName Get Person RSS Information
 * @apiGroup _Legacy
 * @apiDescription Legacy API
 * 
 * example timestamp: 1530000000

 * @apiParam {Number} person_id Person ID.
 * @apiParam {Number} from UNIX Timestamp from.
 * @apiParam {Number} to UNIX Timestamp to.

 * @apiSuccessExample Success-Response:
 *    
 * [
    {
        "ID": id_number,
        "PERSON_ID": person_id,
        "TIME": timstamp,
        "AIRWAY_ASSESSMENT": null,
        "APRV_PHIGH": null,
        "APRV_PLOW": null,
        ...
        "RSS": rss_score
    },
    ...
  ]
        
 * 
 *
 */
router.get("/person/:person_id/RSS", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  const from = parseFloat(req.query.from) || 0;
  const to = parseFloat(req.query.to) || Math.ceil(Date.now() / 1000);
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  res.send(await getRespiratorySupportVariable(binds));
});

router.get("/person/:person_id/HR", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  const from = parseFloat(req.query.from) || 0;
  const to = parseFloat(req.query.to) || Date.now();
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  res.send(await getHeartRate(binds));
});

router.get("/HeartRate", async (req, res) => {
  const person_id = parseInt(req.query.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  const from = parseFloat(req.query.from) || 0;
  const to = parseFloat(req.query.to) || Date.now();
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  res.send(await getHeartRate(binds));
});

/**
 * @api {get} /person/:person_id Basic Person Information
 * @apiVersion 0.0.1
 * @apiName Get Person Basic Information
 * @apiGroup Person
 * @apiDescription Legacy API
 * 
 * "0" : basic information.
 * 
 * "NAMES": Current and Alternate names of person.
 * 
 * "MRNS" and "PHONES" are not available now. (null)

 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} name_string Patient first/middle/last name.
 * @apiSuccess {String} sex_string Patient sex.
 * @apiSuccess {Number} person_id Patient unique ID.
 * @apiSuccess {Number} unix_time Unix Second Time.
 * @apiSuccessExample Success-Response:
 *      
            
      {
        "0": {
          "PERSON_ID": person_id,
          "NAME_FIRST": name_string,
          "NAME_MIDDLE": name_string,
          "NAME_LAST": name_string,
          "SEX": sex_string,
          "BIRTH_UNIX_TS": unix_time,
          "DECEASED_UNIX_TS": unix_time
        },
        "NAMES": [
          {
            "NAME_FIRST": name_string,
            "NAME_MIDDLE": name_string,
            "NAME_LAST": name_string,
            "NAME_TYPE": "Current"
          },
          {
            "NAME_FIRST": name_string,
            "NAME_MIDDLE": name_string,
            "NAME_LAST": name_string,
            "NAME_TYPE": "Alternate"
          },
          ...
        ],
        "MRNS": null,
        "PHONES": null
      }
 *
 */

router.get("/person/:person_id", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id. Should be integer.");
    return;
  }
  console.log("router person_id is: " + person_id);

  res.send(await getPerson(person_id));
});

/**
 * @api {get} /person/:person_id/weight Weight
 * @apiVersion 0.0.1
 * @apiName get-weight
 * @apiGroup Person
 * @apiDescription
 * 
 * weight records array sorted by timestamp
 * 
 * FROM WEIGHTS
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {Number} DT_UNIX Unix Second Time.
 * @apiSuccess {Number} WEIGHT Patient weight at this time.
 * @apiSuccessExample Success-Response:
 *      
            
      [
        {
            "DT_UNIX": 1500000000,
            "WEIGHT": 2.22
        },
        ...
      ]
 *
 */

router.get("/person/:person_id/weight", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id. Should be integer.");
    return;
  }
  res.send(await getWeight(person_id));
});

/**
 * @api {get} /person/:person_id/weight-calc Weight-calc
 * @apiVersion 0.0.1
 * @apiName get-weight-calc
 * @apiGroup Person
 * @apiDescription
 * 
 * weight records array sorted by timestamp
 * 
 * FROM WEIGHTS_CALCS
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {Number} DT_UNIX Unix Second Time.
 * @apiSuccess {Number} WEIGHT Patient weight at this time.
 * @apiSuccessExample Success-Response:
 *      
            
      [
        {
            "DT_UNIX": 1500000000,
            "WEIGHT": 2.22
        },
        ...
      ]
 *
 */
router.get("/person/:person_id/weight-calc", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id. Should be integer.");
    return;
  }
  getApiFromRedis(res, getWeightCalc, person_id, "interface-weight");
});

/**
 * @api {get} /personel/:chb_prsnl_id Personnel Information
 * @apiVersion 0.0.1
 * @apiName Get Personnel Information
 * @apiGroup _Legacy
 * @apiDescription Legacy API

 * @apiParam {Number} chb_prsnl_id Personnel ID.

 * @apiSuccessExample Success-Response:
 *    not available
 *
 */
router.get("/personel/:chb_prsnl_id", async (req, res) => {
  const chb_prsnl_id = parseInt(req.params.chb_prsnl_id);
  // const binds = {
  //   chb_prsnl_id,
  // };
  res.send(await getPersonel(chb_prsnl_id));
});

router.get("/survey/bed_space", async (req, res) => {
  const at = parseFloat(req.query.at);
  const binds = {
    at_unix_ts: at,
  };
  res.send(await getBedSurvey(binds));
});

/**
 * @api {get} /bed/:bed_cd Bed Information
 * @apiVersion 0.0.1
 * @apiName Get Bed Information
 * @apiGroup _Legacy
 * @apiDescription Legacy API

 * @apiParam {Number} bed_cd Bed ID.

 * @apiSuccessExample Success-Response:
 *    not available
 *
 */
router.get("/bed/:bed_cd", async (req, res) => {
  const bed_cd = parseFloat(req.params.bed_cd);
  const binds = {
    bed_cd,
  };
  res.send(await getBed(binds));
});

// ~~~~~~~~~~~~~~~~~~~~
// api from Lingyu Zhou
// FHIR like API
// relational-query
// ~~~~~~~~~~~~~~~~~~~~~
router.get("/RespiratorySupportVariable", async (req, res) => {
  const person_id = parseInt(req.query.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id. Should be integer.");
    return;
  }
  const from = parseFloat(req.query.from) || 0;
  const to = parseFloat(req.query.to) || Date.now();
  const binds = {
    person_id,
    from_: from,
    to_: to,
  };
  res.send(await getRespiratorySupportVariable(binds));
});

/**
 * @api {post} /relational-query Relational Query
 * @apiVersion 0.0.1
 * @apiName Relational Query API
 * @apiGroup _Legacy
 * @apiDescription API from Lingyu Zhou.
 * 
 * Query should be a valid JSON, contains "SELECT" field to specify what need to be retrived and "FILTER" field to specify filters
 * 
 *  See example.
 * 
 * @apiParam {json} input JSON for query.

 * @apiParamExample {json} POST json example
  {
    "select": {
        "PATIENT": {
            "NAME_FIRST": null,
            "NAME_LAST": null
        },
        "PATIENT_BED_ASSIGNMENT": {
            "START_UNIX_TS": null,
            "END_UNIX_TS": null
        },
        "BED": {}
    },
    "filter": {
        "op": "AND",
        "filters": [
            {
                "op": "=",
                "variables": [
                    {
                        "entity": "NURSE_UNIT",
                        "attribute": "NAME"
                    },
                    "08 South"
                ]
            },
            {
                "op": "BETWEEN",
                "variables": [
                    1544497302.796,
                    {
                        "entity": "PATIENT_BED_ASSIGNMENT",
                        "attribute": "START_UNIX_TS"
                    },
                    {
                        "entity": "PATIENT_BED_ASSIGNMENT",
                        "attribute": "END_UNIX_TS"
                    }
                ]
            }
        ]
    }
  }


 * @apiSuccessExample Success-Response:
    {
      "PATIENT": [
        {
            "NAME_FIRST": name_string,
            "NAME_LAST": name_string,
            "__ID__": id_number
        },
        ...
      "PATIENT_BED_ASSIGNMENT": [
        {
            "START_UNIX_TS": unix_time,
            "END_UNIX_TS": unix_time,
            "__ID__": id_number,
            "__REF__PATIENT_ENCOUNTER": patient_encounter_number,
            "__REF__BED": bed_number
        },
        ...
      "BED": [
        {
            "__ID__": bed_number
        },
        ...query
    }
 *
 */
router.post("/relational-query", async (req, res) => {
  const query = req.body;
  try {
    const toSend = await getRelationalQuery(query);
    res.send(toSend);
    return;
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(500);
    res.send(e.toString());
  }
});

/**
 * @api {get} /settings/fluid/:item Fluid Settings
 * @apiVersion 0.0.1
 * @apiName get-fluid-setting
 * @apiGroup Settings
 * @apiDescription some setting of displaying fluid charts
 * 
 * from [inoutcode.xlsx](./files/inoutcode.xlsx)
 * if `item` is empty or not valid, return all settings json
 * @apiParam {String=``,
        `EVENT_CD_DICT`,
        `SL_TO_LABEL`,
        `SL_TO_SUBCAT`,
        `SL_TO_CAT`,
        `SL_TO_CALCS`,
        `SL_ORDER_ARRAY`,
        `SL_COLOR_DICT`,
        `CAT_ARRAY`,
        `CAT_TO_SL`,
        `CAT_COLOR_DICT`,
        `CAT_CAP_TO_LOWER_MAP`,
        `CAT_ORDER_ARRAY`,
        `IN_OUT_CODES_XLSX_PATH`} item for in-out-code

 * @apiSuccessExample Success-Response:
      {
        EVENT_CD_DICT,
        SL_TO_LABEL,
        SL_TO_SUBCAT,
        SL_TO_CAT,
        SL_TO_CALCS,
        SL_ORDER_ARRAY,
        SL_COLOR_DICT,
        CAT_ARRAY,
        CAT_TO_SL,
        CAT_COLOR_DICT,
        CAT_CAP_TO_LOWER_MAP,
        CAT_ORDER_ARRAY,
        IN_OUT_CODES_XLSX_PATH
      }
 
 */
router.get("/settings/fluid/:item", (req, res) => {
  const item = req.params.item;
  if (!req || !(item in settingsFluid)) {
    res.send(settingsFluid);
  } else {
    res.send(settingsFluid[item]);
  }
});

router.get("/settings/fluid", (req, res) => {
  res.send(settingsFluid);
});

/**
 * @api {get} /settings/med/:item Med Settings
 * @apiVersion 0.0.1
 * @apiName get-med-setting
 * @apiGroup Settings
 * @apiDescription some setting of displaying med charts
 * 
 *  from [medcat.xlsx](./files/medcat.xlsx)
 * if `item` is empty or not valid, return all settings json

 * @apiParam {String=`DRUG_INFUSIONS_LIST`,
        `DRUG_INTERMITTENT_LIST`,
        `ORANGE_DRUG_LIST`,        
        `RXCUI_LIST`,
        `DRUG_LIST`,
        `CAT_LIST`,
        `RXCUI_BY_CAT_ORDER_DICT`,
        `RXCUI_TO_CAT_DICT`,
        `DRUG_BY_CAT_ORDER_DICT`,
        `RXCUI_TO_CAT_TITLE_DICT`,
        `DRUG_TO_CAT_TITLE_DICT`,
        `CAT_TITLE_TO_CAT_DICT`,
        `CAT_TITLE_COLOR_DICT`,
        `MORPHINE_EQUIVALENTS_DICT`,
        `MORPHINE_EQUIVALENTS_ORDER_ARRAY`,
        `MORPHINE_EQUIVALENTS_COLOR_DICT`,
        `MEDICATION_CATEGORY_STRUCTURE`,        
        `MED_CAT_XLSX_PATH`} item default `MEDICATION_CATEGORY_STRUCTURE`.
 * @apiSuccessExample Success-Response:
 *    {
        DRUG_INFUSIONS_LIST,
        DRUG_INTERMITTENT_LIST,
        ORANGE_DRUG_LIST,        
        RXCUI_LIST,
        DRUG_LIST,
        CAT_LIST,
        RXCUI_BY_CAT_ORDER_DICT,
        RXCUI_TO_CAT_DICT,
        DRUG_BY_CAT_ORDER_DICT,
        RXCUI_TO_CAT_TITLE_DICT,
        DRUG_TO_CAT_TITLE_DICT,
        CAT_TITLE_TO_CAT_DICT,
        CAT_TITLE_COLOR_DICT,
        MORPHINE_EQUIVALENTS_DICT,
        MORPHINE_EQUIVALENTS_ORDER_ARRAY,
        MORPHINE_EQUIVALENTS_COLOR_DICT,
        MEDICATION_CATEGORY_STRUCTURE,
        MED_CAT_XLSX_PATH,
      }
 */
router.get("/settings/med/:item", (req, res) => {
  const item = req.params.item;
  if (!req || !settingsMed[item]) {
    res.send(settingsMed);
  } else {
    res.send(settingsMed[item]);
  }
});

router.get("/settings/med", (req, res) => {
  res.send(settingsMed.MEDICATION_CATEGORY_STRUCTURE);
});

/**
 * @api {get} /settings/microbiology/:item Microbiology Settings
 * @apiVersion 0.0.1
 * @apiName get-micbio-setting
 * @apiGroup Settings
 * @apiDescription some setting of displaying Microbiology charts
 * 
 * if `item` is empty or not valid, return all settings json

 * @apiParam {String=`SOURCE_TO_ODSTD_DICT`,
        `ODSTD_TO_SOURCE_DICT`,
        `SOURCE_ORDER_ARRAY`,        
        `ODSTD_ORDER_ARRAY`,
        `TYPE_TO_MNEMONIC_DICT`,
        `MNEMONIC_TO_TYPE_DICT`,
        `MICROBIOLOGY_CODES_XLSX_PATH`} item for microbiology section
 * @apiSuccessExample Success-Response:
 *    {
          SOURCE_TO_ODSTD_DICT,
          ODSTD_TO_SOURCE_DICT,
          SOURCE_ORDER_ARRAY,  
          ODSTD_ORDER_ARRAY,
          TYPE_TO_MNEMONIC_DICT,
          MNEMONIC_TO_TYPE_DICT,
          MICROBIOLOGY_CODES_XLSX_PATH,
      }
 */
router.get("/settings/microbiology/:item", (req, res) => {
  const item = req.params.item;
  if (!req || !settingsMicBio[item]) {
    res.send(settingsMicBio);
  } else {
    res.send(settingsMicBio[item]);
  }
});

router.get("/settings/microbiology", (req, res) => {
  res.send(settingsMicBio);
});


/**
 * @api {get} /settings/radiology/:item Radiology Settings
 * @apiVersion 0.0.1
 * @apiName get-radio-setting
 * @apiGroup Settings
 * @apiDescription some setting of displaying radiology images
 * 
 * if `item` is empty or not valid, return all settings json

 * @apiParam {String=`CATALOG_CD_DICT`,
        `STUDY_TYPE_DICT`,
        `LOCATION_DICT`,        
        `RADIOLOGY_XLSX_PATH`} item for microbiology section
 * @apiSuccessExample Success-Response:
 *    {
            CATALOG_CD_DICT,
            STUDY_TYPE_DICT,
            LOCATION_DICT,
            RADIOLOGY_XLSX_PATH,
      }
 */
router.get("/settings/radiology/:item", (req, res) => {
  const item = req.params.item;
  if (!req || !settingsRadio[item]) {
    res.send(settingsRadio);
  } else {
    res.send(settingsRadio[item]);
  }
});

router.get("/settings/radiology", (req, res) => {
  res.send(settingsRadio);
});


/**
 * @api {get} /person/:person_id/nutrition/formula Nutrients - formula
 * @apiVersion 0.0.1
 * @apiName nutrients-formula
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 * 
 *  [  
 *    {
        "timestamp": 1500000000,
        "display_line": "Breast Milk (20 cal/oz)",
        "volume": 2,
        "unit": "mL",
        "route": "NG",
        "method": "Continuous"
      },
    ]     
 *
 */

router.get("/person/:person_id/nutrition/formula", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting formula for %s ...", person_id);

  getApiFromRedis(res, getFormula, person_id, "interface-nutri-formula");
});






/**
 * @api {get} /person/:person_id/nutrition/fat-pro-cho Nutrients - Fat-Pro-Cho
 * @apiVersion 0.0.1
 * @apiName nutrients-fat-pro-cho
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 * 
 *  [  
 *    {
        "timestamp": 1535176800,
        "pro": {
            "sum": 0.1,
            "tpn": 0.1
        },
        "cho": {
            "sum": 0.2,
            "tpn": 0.1,
            "diluents": 0.1
        },
        "fat": {
            "sum": 0.1,
            "tpnlipid": 0.1
        }
      },
    ]     
 *
 */

router.get("/person/:person_id/nutrition/fat-pro-cho", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting fat-pro-cho for %s ...", person_id);

  getApiFromRedis(res, getNutriFatProCho, { person_id }, "interface-nutri-fpc");
});

/**
 * @api {get} /person/:person_id/nutrition/volume Nutrients-Volume
 * @apiVersion 0.0.1
 * @apiName nutrients-volume
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 *    [
        {
          "timestamp": 1543251600,
          "TPN": 1,
          "LIPIDS": 1,
          "MEDICATIONS": 1,
          "INFUSIONS": 1,
          "FLUSHES": 1,
          "FEEDS": 1,
          "IVF": 1,
          "BLOOD PRODUCT": 1
        },
      ]     
 *
 */

router.get("/person/:person_id/nutrition/volume", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  const resolution = 3600;
  const from = 0;
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting nutrition volume for %s ...", person_id);

  getApiFromRedis(res, getNutriVolume, { person_id, resolution, from }, "interface-nutri-volume");
});

/**
 * @api {post} /nutrition/volume Nutrients-Volume POST
 * @apiVersion 0.0.1
 * @apiName nutrients-volume-resolution
 * @apiGroup Person
 * @apiParam {Number} person_id patient unique ID.
 * @apiParam {Number} from timestamp get data from.
 * @apiParam {Number} resolution response data timestamp resolution.
 * @apiParamExample {json} POST json example
        {
          "person_id": EXAMPLE_PERSON_ID,
          "from": 1543251600,
          "resolution": 86400
        }
 * @apiSuccessExample Success-Response:
 *    [
        {
          "timestamp": 1543251600,
          "TPN": 1,
          "LIPIDS": 1,
          "MEDICATIONS": 1,
          "INFUSIONS": 1,
          "FLUSHES": 1,
          "FEEDS": 1,
          "IVF": 1,
          "BLOOD PRODUCT": 1
        },
      ]     
 *
 */

router.post("/nutrition/volume", async (req, res) => {
  const person_id = req.body.person_id;
  let resolution = req.body.resolution;
  let from = req.body.from;
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }

  if (from) {
    if (from % 3600) {
      res.send("Invalid from, should be divisible by 3600.");
      return;
    }
    if (!resolution || resolution === 1) {
      resolution = 1;
    } else if (!Number.isInteger(resolution)) {
      res.send("Invalid resolution, should be integer.");
      return;
    } else if (resolution % 3600) {
      res.send("Invalid resolution, should be divisible by 3600.");
      return;
    }
  } else {
    from = 0;
    resolution = 1;
  }

  console.log("getting nutrition volume for %s ...", person_id);
  console.log("resolution :", resolution);
  console.log("input from :", from);

  getApiFromRedis(res, getNutriVolume, { person_id, resolution, from }, "interface-nutri-volume");
});

/**
 * @api {get} /person/:person_id/nutrition/gir Nutr-GIR
 * @apiVersion 0.0.1
 * @apiName nutrients-gir
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 *    [
        {
            "timestamp": 15000000,
            "gir": 8.8,
            "tpn": 0.66,
            "ivf": 0.55,
            "diluents": 0.33
        },
        ...
      ]     
 *
 */

router.get("/person/:person_id/nutrition/gir", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting nutrition GIR for %s ...", person_id);

  getApiFromRedis(res, getNutriGIR, { person_id }, "interface-nutri-gir");
});

/**
 * @api {get} /person/:person_id/nutrition/calories Nutr-Calories
 * @apiVersion 0.0.1
 * @apiName nutrients-calories
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 *    [
        {
          "timestamp": 1543251600,
          "TPN": 1,
          "LIPIDS": 1,
          "INFUSIONS": 1,
          "FLUSHES": 1,
          "FEEDS": 1
        },
      ]     
 *
 */

router.get("/person/:person_id/nutrition/calories", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  const resolution = 3600;
  const from = 0;
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting nutrition calories for %s ...", person_id);

  getApiFromRedis(
    res,
    getNutriCalories,
    { person_id, resolution, from },
    "interface-nutri-calories"
  );
});

/**
 * @api {post} /nutrition/calories Nutr-Calories POST
 * @apiVersion 0.0.1
 * @apiName nutrients-calories-resolution
 * @apiGroup Person
 * @apiParam {Number} person_id patient unique ID.
 * @apiParam {Number} from timestamp get data from.
 * @apiParam {Number} resolution response data timestamp resolution.
 * @apiParamExample {json} POST json example
        {
          "person_id": EXAMPLE_PERSON_ID,
          "from": 1543251600,
          "resolution": 86400
        }
 * @apiSuccessExample Success-Response:
 *    [
        {
          "timestamp": 1543251600,
          "TPN": 1,
          "LIPIDS": 1,
          "INFUSIONS": 1,
          "FLUSHES": 1,
          "FEEDS": 1
        },
      ]     
 *
 */

router.post("/nutrition/calories", async (req, res) => {
  const person_id = req.body.person_id;
  let resolution = req.body.resolution;
  let from = req.body.from;
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  if (from) {
    if (from % 3600) {
      res.send("Invalid from, should be divisible by 3600.");
      return;
    }
    if (!resolution || resolution === 1) {
      resolution = 1;
    } else if (!Number.isInteger(resolution)) {
      res.send("Invalid resolution, should be integer.");
      return;
    } else if (resolution % 3600) {
      res.send("Invalid resolution, should be divisible by 3600.");
      return;
    }
  } else {
    from = 0;
    resolution = 1;
  }

  console.log("getting nutrition calories for %s ...", person_id);
  console.log("resolution :", resolution);
  console.log("input from :", from);

  getApiFromRedis(
    res,
    getNutriCalories,
    { person_id, resolution, from },
    "interface-nutri-calories"
  );
});

/**
 * @api {get} /person/:person_id/microbiology Microbiology
 * @apiVersion 0.0.1
 * @apiName Microbiology
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 *   
  {
    "Nares": // source name based on OD_ST_D
      [
        {
            "od_st_d": "Nares", // mouse over
            "order_id": 1111,
            "collect_time": 150000,
            "culture_start_time": 151000,
            "end_time": 152000, // the latest task_time
            "tasks": [
                {
                    "task_log_id": 33333,
                    "task_time": 152000,
                    "order_mnemonic": "PreOp Cul", // mouse over
                    "mnemonic_type": "Bacterium", //"Bacterium": oval, "viral": square, others: hexagon 
                    "positive_ind": 0, //0: green, 1: red 
                    "status": "Prelim", // "Prelim" or "Gram": light. "Final" or "Amend" : dark
                    "species_desc": "E.cloa", // write with icon if (species_desc) 
                    "display_log": ["log1", "log2"], //sorted display_log

                },
                // ... other tasks in this order
            ],
            "sensitivity": {
              "x": ["bact1"],   // x is row direction
              "y": ["drug1", "drug2"],  // y is column direction
              "data": [     // [row[col]], item could be `mic_interp`, `mic_dil` and `kb`
                [
                  {
                      "mic_interp": "S",
                      "mic_dil": "Deduced"
                  },
                  {
                      "mic_interp": "S",
                      "mic_dil": "Deduced"
                  },
                ],],
            },
        },
        // ... other orders in this source
      ]
  }
     
 *
 */

router.get("/person/:person_id/microbiology", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting microbiology for %s ...", person_id);
  getApiFromRedis(res, getMicbio, { person_id }, "microbiology");
});

/**
 * @api {get} /person/:person_id/ecmo ECMO Score
 * @apiVersion 0.0.1
 * @apiName ECMO-score-for-patient
 * @apiGroup Person
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 *  [
      {
          "VALID_FROM_DT_TM": 1530000000,
          "ECMO_FLOW": ".6",
          "ECMO_FLOW_NORM": 100,
          "LVAD_FILLING": null,
          "LVAD_EJECTION": null,
          "LVAD_RATE": null,
          "LVAD_VOLUME": null,
          "RVAD_RATE": null,
          "VAD_CI": null,
          "VAD_CO": null,
          "WEIGHT": 3,
          "ECMO_VAD_SCORE": 100
      },
    ]
 *
 */

router.get("/person/:person_id/ecmo", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting ECMO Score for %s ...", person_id);
  const binds = {
    person_id,
  };
  res.send(await getECMO(binds));
});

// ~~~~~~~~~~
// db api end
// ~~~~~~~~~~

// ~~~~~~~~~~~
// cerner api
// ~~~~~~~~~~

/**
 * @api {get} /FHIR/token get access token
 * @apiVersion 0.0.1
 * @apiName get-access-token
 * @apiGroup FHIR
 * @apiDescription get access token OAUTH2
 * 

 * @apiSuccessExample Success-Response:
 *    {
        "access_token": "abcdefg_",
        "scope": "system/Patient.read system/Encounter.read system/DocumentReference.read",
        "token_type": "Bearer",
        "expires_in": 570
      }
 */
router.get("/FHIR/token", async (req, res) => {
  // getAccessToken().then(val => res.send(val));
  res.send(await getAccessToken());
});

/**
 * @api {get} /FHIR/notes/:mrn check mrn FHIR
 * @apiVersion 0.0.1
 * @apiName get-mrn-fhir
 * @apiGroup FHIR
 * @apiDescription get mrn FHIR
 * @apiParam {Number} mrn Patient MRN.

 * @apiSuccessExample Success-Response:
 *    {

      }
 */
router.get("/FHIR/notes/:mrn", async (req, res) => {
  const mrn = parseInt(req.params.mrn);
  console.log("mrn is: " + mrn);
  let result = await getPDFUrl(mrn);
  res.send(result);
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~ Deprecated API ~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * @api {get} /person/:person_id/labs Labs for Patient
 * @apiVersion 0.0.1
 * @apiName Get Patient Labs
 * @apiDeprecated use now (#Person:get-patient-labs-v2).
 * @apiGroup _Deprecated
 * @apiParam {Number} person_id patient unique ID.
 * @apiSuccess {String} labName Name of this lab, such as "SvO2".
 * @apiSuccess {Number} timestamp UNIX Timestamp seconds of the lab.
 * @apiSuccess {Number} labValue Value of this lab.
 * @apiSuccessExample Success-Response:
 *
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
router.get("/person/:person_id/labs", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }

  console.log("/person/ %s /labs ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getLab(binds));
});

/**
 * @api {post} /inout-tooltip In-Out Tooltip for Patient
 * @apiVersion 0.0.3
 * @apiName Get in-out tooltip for patient
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Person:in-out-tooltip-v2).
 * @apiDescription 
 * Get in-out fluid data based on `person_id`, start time `from`, end time `to`, binned time resolution `resolution`,
 * from table `DRUG_DILUENTS` and `INTAKE_OUTPUT`
 * 
 * Method: 
 * 
 * Input notes: 
 * 
 *   ├──`resolution` should be divisible by 3600 (seconds in one hour).
 * 
 *   └──`from` and `to` should be divisible by `resolution`.
 * 
 * Output notes:
 *   
 *   output array [{},{}] has two item, in-data-object and out-data-object.
 * 
 *   in-data-object keys: timestamp
 *   
 *   in-data-object[timestamp] keys: cat
 * 
 *   in-data-object[timestamp][cat] keys: `acc_value` and ((cat is `Infusions` or `Flushes`)? `drugs` : short_label)
 * 
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {Number} [from=0] Start timestamp.
 * @apiParam {Number} [to] End timestamp. Default value: current Unix Time(sec).
 * @apiParam {Number} [resolution=3600] Binned time resolution.
 * @apiParamExample {json} Example of request in-out data
        {
          "person_id": EXAMPLE_PERSON_ID,
          "from":0,
          "to":1541037600,
          "resolution":3600
        }

 * @apiSuccessExample Success-Response:
 *
 [
    {
      "1541030400": {
          "Infusions": {
              "acc_value": 0.02,
              "drugs": [
                  {
                      "value": 0.02,
                      "drug": "alprostadil",
                      "diluent": "Dextrose 10% in Water",
                      "rate": 0.27,
                      "unit": "mL/hr",
                      "conc": 5,
                      "strength_unit": "mcg",
                      "vol_unit": "mL",
                      "location": "not ready"
                  }
              ]
          }
      },
      ...
    },
    {
      "1538686800": {
            "UOP": {
                "acc_value": -15,
                "short_labels": [
                    {
                        "value": -15,
                        "sub_cat": "Void",
                        "label": "UOP",
                        "short_label": "UOP"
                    }
                ]
            }
      },
      ...
    }
  ]
 *
 */

router.post("/inout-tooltip", async (req, res) => {
  const query = req.body;
  const person_id = query.person_id;
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }

  try {
    const toSend = await getInOutTooltipQueryV1(query);
    console.log("finished timestamp :", new Date().getTime());
    res.send(toSend);
    return;
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});

/**
 * @api {post} /inout In-Out for Patient
 * @apiVersion 0.0.2
 * @apiName Get in-out for patient
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Person:in-out-patient-V2).
 * @apiDescription 
 * Get in-out fluid data based on `person_id`, start time `from`, end time `to`, binned time resolution `resolution`, from table `INTAKE_OUTPUT` and `DRUG_DILUENTS`
 * 
 * Method: 
 * 
 *   ├──part 1: data from `INTAKE_OUTPUT`, value accumulated by `short_label` and records with timestamp during `resolution` time.
 * 
 *   ├──part 2: data from `DRUG_DILUENTS`, if drug is 'papavarine' or 'heparin flush', then cat = "Flushes", value accumulated in each binned time box;
 * other drug , then cat = "Infusions", value accumulated in each binned time box;
 * 
 *   └──final response: mixed part1 and part2, sorted by time.
 * 
 * Input notes: 
 * 
 *   ├──`resolution` should be divisible by 3600 (seconds in one hour).
 * 
 *   └──`from` should be divisible by `resolution`.
 * 
 * Response notes:
 * 
 *   ├──type == `1` ⟹ value is positive (in);
 * 
 *   ├──type == `2` ⟹ value is negative (out);
 * 
 *   ├──type == `0` ⟹ skipped;
 * 
 *   └──value == 0 ⟹ skipped; 
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {Number} [from=0] Start timestamp.
 * @apiParam {Number} [to] End timestamp. Default value: current Unix Time(sec).
 * @apiParam {Number} [resolution=3600] Binned time resolution.
 * @apiParamExample {json} Example of request in-out data
        {
          "person_id": EXAMPLE_PERSON_ID,
          "from":1541030400,
          "to":1542018000,
          "resolution":3600
        }
 * @apiSuccess {Number} value IO value.
 * @apiSuccess {String} cat Name of IO category.
 * @apiSuccess {String} sub_cat Name of IO sub-category.
 * @apiSuccess {String} label Name of IO label.
 * @apiSuccess {String} short_label Name of IO short_label.
 * @apiSuccess {String} color `#` code of color.
 * @apiSuccess {Number} time Unix seconds as the record's start timestamp.
 * @apiSuccess {String} type value of IO_CALCs.

 * @apiSuccessExample Success-Response:
 *    [
        {
          "value": -8,
          "cat": "UOP",
          "sub_cat": "Foley",
          "label": "FOLEY",
          "short_label": "FOL",
          "color": "#e5c124",
          "time": 1541016000,
          "type": "2"
        },
        ...
      ]
 *
 */

router.post("/inout", async (req, res) => {
  const query = req.body;
  const person_id = query.person_id;
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }

  try {
    const toSend = await getInOutQuery(query);
    res.send(toSend);
  } catch (e) {
    console.log(new Date());
    console.log(e);
    // res.status(400);
    res.send(e.toString());
  }
});

/**
 * @api {get} /person/:person_id/nutrition/diluents Nutrients - Diluents
 * @apiVersion 0.0.1
 * @apiName diluents-nutrients-for-patient
 * @apiGroup _Deprecated
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 *    [
        {
           "start": 1520000000,
            "end": 1530000000,
            "rate": 0.1,
            "unit": "g/hr"
        },
        ...
      ]
     
 *
 */

router.get("/person/:person_id/nutrition/diluents", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting Diluents nutrients for %s ...", person_id);
  const binds = {
    person_id,
  };
  res.send(await getDiluNutrients(binds));
});

/**
 * @api {get} /person/:person_id/nutrition/tpn Nutrients - TPN
 * @apiVersion 0.0.1
 * @apiName TPN-nutrients-for-patient
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Person:nutrients-volume).
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 *  {

      amino_acids: [
        {
           "start": 1520000000,
            "end": 1530000000,
            "value": 0.1,
            "unit": "g/kg"
        },
        ...
      ],
      dextrose: [
        {
          "start": 1520000000,
            "end": 1530000000,
            "value": 0.1,
            "unit": "g/kg"
        },
        ...
      ]
    }
 *
 */

router.get("/person/:person_id/nutrition/tpn", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting TPNnutrients for %s ...", person_id);
  const binds = {
    person_id,
  };
  res.send(await getTpnNutrients(binds));
});

/**
 * @api {get} /person/:person_id/nutrition/macronutrients Nutrients - Macro
 * @apiVersion 0.0.2
 * @apiName macro-nutrients-for-patient
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Person:nutrients-volume).
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccessExample Success-Response:
 *  {
      fat: [
        {
          time: 150000000,
          value: 0.1,
          unit: "g"
        },
        ...
      ],
      protein: [
        {
          time: 150000000,
          value: 0.2,
          unit: "g"
        },
        ...
      ],
      cho: [
        {
          time: 150000000,
          value: 0.15,
          unit: "g"
        },
        ...
      ]
    }
 *
 */

router.get("/person/:person_id/nutrition/macronutrients", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  console.log("person_id :", person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting macronutrients for %s ...", person_id);
  const binds = {
    person_id,
  };
  res.send(await getMacroNutrients(binds));
});

/**
 * @api {get} /person/:person_id/vitals/hr/binned/:data_resolution Binned Heart Rate
 * @apiVersion 0.0.1
 * @apiName Get Person Hr Binned
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Vitals:get-raw-vitals).
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiSuccess {String} range Range of the binned heart rate, for example, "90-100".
 * @apiSuccess {Number} value Value of the binned heart rate.
 * @apiSuccess {Number} from_timestamp UNIX timestamp seconds for start time.
 * @apiSuccess {Number} to_timestamp UNIX timestamp seconds for end time.
 * @apiSuccess {Number} average_timestamp UNIX timestamp seconds for average of start and end time.
 * @apiSuccessExample Success-Response:
 *      
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

router.get("/person/:person_id/vitals/hr/binned/12H", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_12H for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHr12H(binds));
});

router.get("/person/:person_id/vitals/hr/binned/5H", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_5H for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHr5H(binds));
});

router.get("/person/:person_id/vitals/hr/binned/1D", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_1D for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHr1D(binds));
});

router.get("/person/:person_id/vitals/hr/binned/5M", async (req, res) => {
  const person_id = parseInt(req.params.person_id);
  if (!Number.isInteger(person_id)) {
    res.send("Invalid person_id, should be integer.");
    return;
  }
  console.log("getting hr_5M for %s ...", person_id);

  const binds = {
    person_id,
  };
  res.send(await getHr5M(binds));
});

/**
 * @api {post} /vitals/temperature Temperature
 * @apiVersion 0.0.1
 * @apiName get-temperature
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Vitals:get-raw-vitals).
 * @apiDescription 
 * 
 * From table `VITAL_V500`, get temperature data
 * 
 * from column `TEMPERATURE` then `TEMPERATURE_ESOPH` then `TEMPERATURE_SKIN` then table `VITALS`
 * 
 * if all three columns are null value then skiped.
 * 
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {Number} from Start timestamp.
 * @apiParam {Number} to End timestamp.
 * @apiParamExample {json} Example of request vitals raw data
        {
          "person_id": EXAMPLE_PERSON_ID,
          "from":1542014000,
          "to":1542018000
        }
 * @apiSuccess {String="TEMPERATURE", "TEMPERATURE_ESOPH", "TEMPERATURE_SKIN", "VITALS"} type temperature source.
 * @apiSuccess {String} value temperature value String.
 * @apiSuccess {Number} time timestamp in Unix seconds.
 * @apiSuccessExample Success-Response:
 *      
      [
        {
        "time": 1542014000,
        "value": "37.2",
        "type": "TEMPERATURE_ESOPH"
        },
        ...
      ]
 *
 */

router.post("/vitals/temperature", async (req, res) => {
  let query = req.body;
  query.person_id = Number(query.person_id);
  try {
    const toSend = await getTemp(query);
    res.send(toSend);
    return;
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});

// ~~~~~~~~-----------------------------
/**
 * @api {post} /vitals Binned api/vitals
 * @apiVersion 0.0.2
 * @apiName Get Vitals Binned
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Vitals:get-binned-vitals).
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {String="binned"} data_type Type of data.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiParamExample {json} POST json example
        {
          "person_id": EXAMPLE_PERSON_ID,
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
  *      
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
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Vitals:get-calc-vitals).
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {String="calc"} data_type Type of data.
 * @apiParam {String="1D","12H", "5H", "5M"} data_resolution Resolution of data.
 * @apiParamExample {json} POST json example
        {
          "person_id": EXAMPLE_PERSON_ID,
          "vital_type": "mbp",
          "data_type": "calc",
          "data_resolution": "1D"
        }

 * @apiSuccess {String} perc Percentile String such as "perc25".
 * @apiSuccess {Number} perc_value Value of this percentile.
 * @apiSuccess {Number} mean_value Value of VAL_MEAN.
 * @apiSuccess {Number} timestamp UNIX timestamp seconds of average start and end time.
 * @apiSuccessExample Success-Response:
 *      
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
 * @apiGroup _Deprecated
 * @apiDeprecated use now (#Vitals:get-raw-vitals).
 * @apiDescription Request vitals raw data from POST json
 * 
 * from table `VITALS`
 * 
 * null value vital records are skiped.
 *
 * @apiParam {Number} person_id Patient unique ID.
 * @apiParam {String="mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp"} vital_type Type of vital.
 * @apiParam {Number} from Start timestamp.
 * @apiParam {Number} to End timestamp.
 * @apiParamExample {json} Example of request vitals raw data
        {
          "person_id": EXAMPLE_PERSON_ID,
          "vital_type": "mbp",
          "from":1542014000,
          "to":1542018000
        }
 * @apiSuccess {Number} value Vitals raw data.
 * @apiSuccess {Number} timestamp time in Unix seconds.
 * @apiSuccessExample Success-Response:
 *      
      [
        {
          "value": value,
          "time": timestamp
        },
        ...
      ]
 *
 */

router.post("/vitals", async (req, res) => {
  const query = req.body;
  try {
    const toSend = await getVitalsQuery(query);
    res.send(toSend);
    return;
  } catch (e) {
    console.log(new Date());
    console.log(e);
    res.status(400);
    res.send(e.toString());
  }
});

module.exports = router;
