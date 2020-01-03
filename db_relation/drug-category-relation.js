/**
 * CONFIG DRUG CATEGORY
 * 
 * PENG 
 * 12/27/19
 * 
 */

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// define the category based on drug string
// will updating for more

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
  DRUG_INTERMITTENT_LIST
}