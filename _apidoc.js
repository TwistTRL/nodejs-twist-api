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