/*
 * @Author: Peng
 * @Date: 2019-12-27 12:54:04
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-26 06:52:02
 */

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// define the category based on drug string
// will updating for more
// Table: DRUG_INFUSIONS
const database = require("../services/database");

const DRUG_INFUSIONS_LIST = [
  "DOPamine",
  "EPINEPHrine",
  "milrinone",
  "vasopressin",
  "norepinephrine"
];
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

const ORANGE_DRUG_LIST = ["cisatracurium", "vecuronium", "pancuronium", "rocuronium", "atracurium"];

const {
  RXCUI_LIST,
  DRUG_LIST,
  CAT_LIST,
  RXCUI_BY_CAT_ORDER_DICT,
  RXCUI_TO_CAT_DICT,
  DRUG_BY_CAT_ORDER_DICT,
  DRUG_TO_CAT_DICT,
  MEDICATION_CATEGORY_STRUCTURE,
  RXCUI_TO_CAT_TITLE_DICT,
  DRUG_TO_CAT_TITLE_DICT,
  CAT_TITLE_TO_CAT_DICT,
  MORPHINE_EQUIVALENTS_DICT,
  MORPHINE_EQUIVALENTS_ORDER_ARRAY,
  MED_CAT_XLSX_PATH
} = require("twist-xlsx");

// right now color_array hard coded for both class color and drug color 
const color_array = [
  "#B33300",
  "#CC80CC",
  "#66664D",
  "#991AFF",
  "#E666FF",
  "#4DB3FF",
  "#1AB399",
  "#E666B3",
  "#33991A",
  "#CC9999",
  "#B3B31A",
  "#00E680",
  "#4D8066",
  "#809980",
  "#E6FF80",
  "#1AFF33",
  "#999933",
  "#FF3380",
  "#CCCC00",
  "#66E64D",
  "#4D80CC",
  "#9900B3",
  "#E64D66",
  "#4DB380",
  "#FF4D4D",
  "#99E6E6",
  "#6666FF"
];

var MORPHINE_EQUIVALENTS_COLOR_DICT = {};
for (let i = 0; i < MORPHINE_EQUIVALENTS_ORDER_ARRAY.length; i++) {
  MORPHINE_EQUIVALENTS_COLOR_DICT[MORPHINE_EQUIVALENTS_ORDER_ARRAY[i]] =
    color_array[i % color_array.length];
}

var CAT_TITLE_COLOR_DICT = {};
let index = 0;
for (let catTitle in CAT_TITLE_TO_CAT_DICT) {
  CAT_TITLE_COLOR_DICT[catTitle] = color_array[index % color_array.length];
  index ++;
}

MEDICATION_CATEGORY_STRUCTURE.forEach(catObj => {
  catObj.children.forEach(drugObj => {
    let drugColor = "#AED6F1";
    if (drugObj.name in DRUG_TO_CAT_TITLE_DICT) {
      DRUG_TO_CAT_TITLE_DICT[drugObj.name].forEach(catTitle => {
        if (CAT_TITLE_TO_CAT_DICT[catTitle] === catObj.name) {
          drugColor = CAT_TITLE_COLOR_DICT[catTitle];
          drugObj.drugClass = catTitle;
        }
      });  
    }        
    drugObj.classColor = drugColor;    
  });
});

// console.log('MEDICATION_CATEGORY_STRUCTURE :', MEDICATION_CATEGORY_STRUCTURE);

const FLUID_SETTINGS = {
  RXCUI_LIST,
  DRUG_LIST,
  CAT_LIST,
  RXCUI_BY_CAT_ORDER_DICT,
  RXCUI_TO_CAT_DICT,
  DRUG_BY_CAT_ORDER_DICT,
  DRUG_TO_CAT_DICT,
  MEDICATION_CATEGORY_STRUCTURE,
  RXCUI_TO_CAT_TITLE_DICT,
  DRUG_TO_CAT_TITLE_DICT,
  CAT_TITLE_TO_CAT_DICT,
  CAT_TITLE_COLOR_DICT,
  MORPHINE_EQUIVALENTS_DICT,
  MORPHINE_EQUIVALENTS_ORDER_ARRAY,
  MORPHINE_EQUIVALENTS_COLOR_DICT,
  MED_CAT_XLSX_PATH
};

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
  DRUG_TO_CAT_DICT,
  MEDICATION_CATEGORY_STRUCTURE,
  RXCUI_TO_CAT_TITLE_DICT,
  DRUG_TO_CAT_TITLE_DICT,
  CAT_TITLE_TO_CAT_DICT,
  CAT_TITLE_COLOR_DICT,
  MORPHINE_EQUIVALENTS_DICT,
  MORPHINE_EQUIVALENTS_ORDER_ARRAY,
  MORPHINE_EQUIVALENTS_COLOR_DICT,
  MED_CAT_XLSX_PATH,
  FLUID_SETTINGS,
};
