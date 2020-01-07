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