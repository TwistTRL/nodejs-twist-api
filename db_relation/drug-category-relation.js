/*
 * @Author: Peng 
 * @Date: 2019-12-27 12:54:04 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-12 12:49:25
 */


 //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// define the category based on drug string
// will updating for more
// Table: DRUG_INFUSIONS

const DRUG_INFUSIONS_LIST = ["DOPamine", "EPINEPHrine", "milrinone", "vasopressin", "norepinephrine"];
const DRUG_INTERMITTENT_LIST = [
  "epinephrine",
  "calcium chloride",
  "calcium gluconate",
  "calcium gluconate (calcium GLUCONATE dose (PIV))",
  "hydrocortisone",
  "albumin human",
  "albumin human (albumin human 5% intravenous solution)",
  "albumin human (albumin human 25% intravenous solution)"
];


const ORANGE_DRUG_LIST = [
  "cisatracurium",
  "vecuronium",
  "pancuronium",
  "rocuronium",
  "atracurium"
];

const {
  RXCUI_LIST,
  DRUG_LIST,
  CAT_LIST,
  RXCUI_BY_CAT_ORDER_DICT,
  RXCUI_TO_CAT_DICT,
  DRUG_BY_CAT_ORDER_DICT,
  MEDICATION_CATEGORY_STRUCTURE,

  MED_CAT_XLSX_PATH,
} = require("twist-xlsx");

/**
 * 
 * defination of these drugs:
 * 
 * Peng 1/2/20
 * 

`epinephrine` is :
epinephrine


<!-- epinephrine OR preparation
epinephrine topical
epinephrine-lidocaine
epinephrine-lidocaine (lidocaine (buffered) 1% with EPInephrine 1:200,000 inj)
epinephrine/lidocaine/tetracaine topical
epinephrine/lidocaine/tetracaine topical (LET) -->



`calcium` is :
calcium chloride
calcium gluconate
calcium gluconate (calcium GLUCONATE dose (PIV))

<!-- calcium acetate
calcium carbonate
calcium carbonate-magnesium hydroxide
calcium citrate
calcium glubionate
calcium phosphate/placebo
calcium-vitamin D
calcium-vitamin D (Citracal + D) -->



`hydrocortisone` is :
hydrocortisone

<!-- hydrocortisone topical
hydrocortisone topical (Anusol HC)
hydrocortisone topical (hydrocortisone 1% topical cream)
hydrocortisone topical (hydrocortisone 1% topical ointment)
hydrocortisone topical (hydrocortisone 2.5% topical ointment)
hydrocortisone-lidocaine topical w psyll
hydrocortisone/neomycin/poly B ophth
hydrocortisone/neomycin/polymyxin B otic -->

`albumin 5%` is:
albumin human
albumin human (albumin human 5% intravenous solution)

`albumin 25%` is :
albumin human (albumin human 25% intravenous solution)

 */


module.exports = {
  DRUG_INFUSIONS_LIST,
  DRUG_INTERMITTENT_LIST,
  ORANGE_DRUG_LIST,
  
  RXCUI_LIST,
  DRUG_LIST,
  CAT_LIST,
  RXCUI_BY_CAT_ORDER_DICT,
  RXCUI_TO_CAT_DICT,
  DRUG_BY_CAT_ORDER_DICT,
  MEDICATION_CATEGORY_STRUCTURE,
  MED_CAT_XLSX_PATH,
}