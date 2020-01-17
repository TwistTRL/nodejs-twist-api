
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


const ABG_LIST = [PH, PACO2, PAO2, HCO3, SAO2];



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// add all the category to a dictionary,
// each category is an array  
const categoryDictionary = {};

categoryList.forEach(addToDictionary);

function addToDictionary(item) {
  categoryDictionary[item] = [];
}


/**
 * just create a new dictionary for a timestamp
 * 
 * @param {number} dt_unix from lab record, for example "DT_UNIX":1524725340  
 */
function getSingleTimeRecord(dt_unix) {
  return {"time":dt_unix};
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

function getLabNameFromLabCat(labCatString) {
 
  switch(labCatString) {
    case ALBUMIN:
      return ["Albumin"];

    case ALKPHOS:
      return ["Alkaline Phosphatase"];

    case BNP:
      return ["B-Type Natriuretic Peptide"];
    case HCO3:
      return [
    "Bicarb Act Arterial Cath Lab",
    "Bicarb Actual Venous Cath Lab",
    "Bicarb Arterial",
    "Bicarb Arterial OR",
    "Combined Procainamide and NAPA",
    "Coxsackie A9 Ab"];

    case BUN:
      return ["BUN"];

     
    case CR:
      return ["Creatinine"];
     
    case DDIMER:
      return ["D-dimer"];

    case LACTATE:
      return ["Lactic Acid",
     "Lactic Acid, Whole Blood"];


    case SVO2:
      return ["O2 Sat Venous", "O2 Sat Venous Cardiac", "O2Hgb Venous Co-oximetry", "O2Sat Right Atrium Cardiac",
      "O2Sat Venous Cath Lab","O2Sat Venous Co-oximetry", "O2Sat Venous OR"];

    case SAO2:
      return ["O2Hgb  Arterial Co-oximetry",
    "O2Sat Arterial",
    "O2Sat Arterial Cardiac",
    "O2Sat Arterial Cath Lab",
    "O2Sat Arterial Co-oximetry",
    "O2Sat Arterial OR"];

      

    case PACO2:
      return ["pCO2 Arterial",
    "pCO2 Arterial Cath Lab",
    "pCO2 Arterial Corrected OR",
    "pCO2 Arterial OR",
    "pCO2 Arterial, Temp Corrected"];


    case PH:
      return ["pH Arterial",
    "pH Arterial Cath Lab",
    "pH Arterial Corrected OR",
    "pH Arterial OR",
    "pH Arterial, Temp Corrected",
    "Primary Ciliary Dyskinesia Seq Panel"];


    case PAO2:
      return ["pO2 Arterial",
     "pO2 Arterial Cath Lab",
     "pO2 Arterial Corrected OR",
     "pO2 Arterial OR",
     "pO2 Arterial, Temp Corrected"];

    case TNI:
      return ["Troponin I",
     "Troponin I, Cardiac, TNNI3"];
    
    case TNT:
      return ["Troponin T"];
      
    default:
      return null;
  }
}


module.exports = {
  categoryList,
  getCategory,
  categoryDictionary,
  getSingleTimeRecord,
  getLabNameFromLabCat,
  ABG_LIST
}