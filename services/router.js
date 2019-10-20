const express = require("express");
const router = new express.Router();
const {getRespiratorySupportVariable} = require("../db_apis/get_respiratory_support_variables");
const {getHeartRate} = require("../db_apis/get_heart_rate");
const {getPerson} = require("../db_apis/get_person");
const {getPersonel} = require("../db_apis/get_personel");

// legacy
router.get("/person/:person_id/RSS", async (req, res, next)=>{
  let person_id = parseFloat(req.params.person_id);
  let from = parseFloat(req.query.from);
  let to = parseFloat(req.query.to);
  res.send(
    await getRespiratorySupportVariable(person_id,from,to)
  );
});
router.get("/person/:person_id/HR", async (req, res, next)=>{
  let person_id = parseInt(req.query.person_id);
  let from = parseFloat(req.query.from);
  let to = parseFloat(req.query.to);
  res.send(
    await getHeartRate(person_id,from,to)
  );
});

// FHIR like API
router.get("/RespiratorySupportVariable", async (req, res, next)=>{
  let person_id = parseInt(req.query.person_id);
  let from = parseFloat(req.query.from);
  let to = parseFloat(req.query.to);
  res.send(
    await getRespiratorySupportVariable(person_id,from,to)
  );
});

router.get("/HeartRate", async (req,res, next) => {
  let person_id = parseInt(req.query.person_id);
  let from = parseFloat(req.query.from);
  let to = parseFloat(req.query.to);
  res.send(
    await getHeartRate(person_id,from,to)
  );
});

router.get("/Person/:person_id", async (req,res, next) => {
  let person_id = parseInt(req.params.person_id);
  res.send(
    await getPerson(person_id)
  );
});

router.get("/Personel/:personel_id", async (req,res, next) => {
  let personel_id = parseInt(req.params.personel_id);
  res.send(
    await getPersonel(personel_id)
  );
});

router.get("/Bed_Survey/", async (req,res, next) => {
  let at = parseFloat(req.query.at);
  res.send(
    await getBedSurvey(at)
  );
});

router.get("/Personel_Bed_Assignment/", async (req,res, next) => {
  let bed_cd = parseFloat(req.params.bed_cd);
  res.send(
    await getBed(bed_cd)
  );
});

router.get("/Bed/:bed_cd", async (req,res, next) => {
  let bed_cd = parseFloat(req.params.bed_cd);
  res.send(
    await getBed(bed_cd)
  );
});

module.exports = router;
