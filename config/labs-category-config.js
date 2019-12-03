
/**
 * CONFIG LABS CATEGORY
 * 
 * PENG 
 * 12/3/19
 * 
 */

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// define the category based on lab string
// will updating for more
const ALBUMIN = "Albumin";
const ALKPHOS = "Alk Phos";
const BNP = "BNP";
const HCO3 = "HCO3";
const BUN = "BUN";
const CR = "Cr";
const DDIMER = "D-dimer";
const LACTATE = "Lactate";
const SVO2 = "SvO2";
const SAO2 = "SaO2";
const PACO2 = "PaCO2";
const PH = "pH";
const PAO2 = "PaO2";
const TNI = "TnI";
const TNT = "TnT";

const categoryList = [ALBUMIN, ALKPHOS, BNP,
  HCO3, BUN, CR, DDIMER, LACTATE, SVO2,
  SAO2, PACO2, PH, PAO2, TNI, TNT];
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// add all the category to a dictionary,
// each category is an array  
var categoryDictionary = {};
categoryList.forEach(addToDictionary);

function addToDictionary(item) {
  categoryDictionary[item] = [];
}


/**
 * check "lab" string and return it's category
 *
 * @param {*} labString
 * @returns
 */
function getCategory(labString){

  var categoryString;
  
  switch(labString) {
    case "Albumin":
      categoryString = ALBUMIN;
      break;
    case "Alkaline Phosphatase":
      categoryString = ALKPHOS;
      break;


    case "B-Type Natriuretic Peptide":
      categoryString = BNP;
      break;
    case "Bicarb Act Arterial Cath Lab":
    case "Bicarb Actual Venous Cath Lab":
    case "Bicarb Arterial":
    case "Bicarb Arterial OR":
    case "Combined Procainamide and NAPA":
    case "Coxsackie A9 Ab":
      categoryString = HCO3;
      break;

    case "BUN":
        categoryString = BUN;
        break;
     
    case "Creatinine":
        categoryString = CR;
        break;
     
    case "D-dimer":
        categoryString = DDIMER;
        break;

    case "Lactic Acid":
    case "Lactic Acid, Whole Blood":
    // case "Lactic Acid, Whole Blood":

        categoryString = LACTATE;
        break;


    case "O2 Sat Venous":
    case "O2 Sat Venous Cardiac":
    case "O2Hgb Venous Co-oximetry":
    case "O2Sat Right Atrium Cardiac":
    case "O2Sat Venous Cath Lab":
    case "O2Sat Venous Co-oximetry":
    case "O2Sat Venous OR":

      categoryString = SVO2;
      break;

    case "O2Hgb  Arterial Co-oximetry":
    case "O2Sat Arterial":
    case "O2Sat Arterial Cardiac":
    case "O2Sat Arterial Cath Lab":
    case "O2Sat Arterial Co-oximetry":
    case "O2Sat Arterial OR":

      categoryString = SAO2;
      break;
      

    case "pCO2 Arterial":
    case "pCO2 Arterial Cath Lab":
    case "pCO2 Arterial Corrected OR":
    case "pCO2 Arterial OR":
    case "pCO2 Arterial, Temp Corrected":

      categoryString = PACO2;
      break;


    case "pH Arterial":
    case "pH Arterial Cath Lab":
    case "pH Arterial Corrected OR":
    case "pH Arterial OR":
    case "pH Arterial, Temp Corrected":
    case "Primary Ciliary Dyskinesia Seq Panel":
        categoryString
      categoryString = PH;
      break;

    case "pO2 Arterial":
    case "pO2 Arterial Cath Lab":
    case "pO2 Arterial Corrected OR":
    case "pO2 Arterial OR":
    case "pO2 Arterial, Temp Corrected":

      categoryString = PAO2;
      break;
      
    case "Troponin I":
    case "Troponin I, Cardiac, TNNI3":
      categoryString = TNI;
      break;
    
    case "Troponin T":
      categoryString = TNT;
      break;
      
    default:
      categoryString = null;
      break;
  }
  return categoryString;
}


module.exports = {
  getCategory,
  categoryDictionary
}