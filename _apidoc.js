/**
 * @api {get} /person/:person_id/nurse-unit Nurse Unit For Patient
 * @apiVersion 0.0.1
 * @apiName Get Nurse Unit Time For Patient
 * @apiGroup Person
 * @apiDescription 0.0.1 version
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} Nurse_Unit_Name Nurse Unit name for patient.
 * @apiSuccess {Number} timestamp Timestamp of this room.

 * @apiSuccessExample Success-Response:
      {
        "name": Nurse_Unit_Name,
        "start": timestamp,
        "end": timestamp        
      }
 *
 */


 /**
 * @api {get} /person/:person_id/nurse-unit Nurse Unit For Patient
 * @apiVersion 0.0.2
 * @apiName Get Nurse Unit Time For Patient
 * @apiGroup Person
 * @apiDescription Only keep `8s` or `8e` for nurse unit name. others are `other` if other nurse units or `home` if empty. 
 * 
 * add `id` for each record.
 * @apiParam {Number} person_id Patient unique ID.
 * @apiSuccess {String} Nurse_Unit_Name Nurse Unit name for patient.
 * @apiSuccess {Number} timestamp Timestamp of this room.
 * @apiSuccess {Number} id_number count id for results.
 * @apiSuccessExample Success-Response:
      {
        "name": Nurse_Unit_Name,
        "start": timestamp,
        "end": timestamp,
        "id": id_number       
      }
 *
 */



/**
 * @api {post} /inout-tooltip In-Out Tooltip for Patient
 * @apiVersion 0.0.1
 * @apiName Get in-out tooltip for patient
 * @apiGroup Person
 * @apiDescription 
 * Get in-out fluid data based on `person_id`, start time `from`, end time `to`, binned time resolution `resolution`, from table `DRUG_DILUENTS`
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
 *   └──`from` should be divisible by `resolution`.
 * 
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

 * @apiSuccessExample Success-Response:
 *    {
        "1541023200": {
              "Flushes": {
                  "value": 111,
                  "drug": [
                      "heparin flush"
                  ],
                  "diluent": "Dextrose 5% in Water",
                  "rate": 2,
                  "unit": "mL/hr",
                  "conc": 1,
                  "strength_unit": "unit",
                  "vol_unit": "mL"
              },
              "Infusions": {
                  "value": 222,
                  "drug": [
                      "milrinone",
                      "morphine",
                      "papaverine",
                      "heparin",
                      "dexmedetomidine",
                      "nitroprusside",
                      "midazolam",
                      "niCARdipine"
                  ],
                  "diluent": "Dextrose 10% in Water",
                  "rate": 1.35,
                  "unit": "mL/hr",
                  "conc": 0.1,
                  "strength_unit": "mg",
                  "vol_unit": "mL"
              }
          },
        ...
        }
 *
 */