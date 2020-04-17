/*
 * @Author: Peng
 * @Date: 2020-04-09 21:13:55
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-17 15:07:23
 */

const {
  RXCUI_LIST,
  DRUG_LIST,
  CAT_LIST,
  RXCUI_BY_CAT_ORDER_DICT,
  RXCUI_TO_CAT_DICT,
  DRUG_TO_CAT_DICT,
  MEDICATION_CATEGORY_STRUCTURE,
} = require("../../db_relation/drug-category-relation");

const calculateMed = (rawRecords) => {
  let { arrInfusions, arrIntermittent, arrSuction, arrInfusionsUnits } = rawRecords;

  let suctionArray = [];
  if (arrSuction.length > 0) {
    arrSuction.forEach((element) => {
      let singleResult = {};
      singleResult.name = "suction";
      singleResult.time = new Date(element["DATETIMEUTC"]).getTime() / 1000;
      singleResult.start = new Date(element["DATETIMEUTC"]).getTime() / 1000;
      singleResult.lvl = element.LVL;
      singleResult.comment = element["COMMENT_TXT"];
      singleResult.device = element["SUCTION_DEVICE"];
      singleResult.instillation = element["SUCTION_INSTILLATION"];
      singleResult.medication = element["SUCTION_PRE_MEDICATION"];
      singleResult.oxygenation = element["SUCTION_PRE_OXYGENATION"];
      singleResult.type = element["SUCTION_TYPE"];
      suctionArray.push(singleResult);
    });
  }

  let suctionCatStructure = {
    name: "SUCTION",
    children: [{ name: "suction" }, { name: "child2" }, { name: "child3" }],
  };

  // console.log("arrInfusionsUnits :", arrInfusionsUnits);
  // arrInfusionsUnits: [ { DRUG: 'DOPamine', INFUSION_RATE_UNITS: 'mcg/kg/min' },
  // { DRUG: 'EPINEPHrine', INFUSION_RATE_UNITS: 'mcg/kg/min' },...]

  let unitDict = {};
  arrInfusionsUnits.forEach((element) => {
    let cat = DRUG_TO_CAT_DICT[element.DRUG];
    if (!(cat in unitDict)) {
      unitDict[cat] = {};
    }
    unitDict[cat][element.DRUG] = element.INFUSION_RATE_UNITS;
  });

  // console.log('newCatStructure :', newCatStructure);
  // unitDict : { CV:
  //   { DOPamine: 'mcg/kg/min',
  //     alprostadil: 'mcg/kg/min',
  //     esmolol: 'mcg/kg/min',
  //     fenoldopam: 'mcg/kg/min',
  //     milrinone: 'mcg/kg/min',
  //     niCARdipine: 'mcg/kg/min',
  //     nitroprusside: 'mcg/kg/min',
  //     norepinephrine: 'mcg/kg/min' },
  //  RESP: { EPINEPHrine: 'mcg/kg/min' },...}

  let newCatStructure = [...MEDICATION_CATEGORY_STRUCTURE];
  newCatStructure.forEach((element) => {
    if (element.name in unitDict) {
      element.children.forEach((item) => {
        if (item.name in unitDict[element.name]) {
          item.unit = unitDict[element.name][item.name];
        }
      });
    }
  });

  let catStructureArray = [suctionCatStructure, ...newCatStructure];
  let result_dict = {
    cat_structure: catStructureArray,
    SUCTION: suctionArray,
  };
  CAT_LIST.forEach((cat) => {
    result_dict[cat] = [];
  });

  if (arrInfusions.length > 0) {
    arrInfusions.forEach((element) => {
      let singleResult = {};
      singleResult.name = element.DRUG;
      singleResult.dose = element.INFUSION_RATE;
      singleResult.start = element.START_UNIX;
      singleResult.end = element.END_UNIX;
      singleResult.unit = element.INFUSION_RATE_UNITS;
      singleResult.RXCUI = element.RXCUI;
      let cats = RXCUI_TO_CAT_DICT[element.RXCUI];
      cats.forEach((cat) => {
        result_dict[cat].push(singleResult);
      });
    });
  }

  if (arrIntermittent.length > 0) {
    arrIntermittent.forEach((element) => {
      let singleResult = {};
      singleResult.name = element.DRUG;
      singleResult.dose = element.ADMIN_DOSAGE;
      singleResult.start = element.DT_UNIX;
      singleResult.unit = element.DOSAGE_UNITS;
      singleResult.route = element.ADMIN_ROUTE;
      singleResult.RXCUI = element.RXCUI;
      let cats = RXCUI_TO_CAT_DICT[element.RXCUI];
      if (!cats) {
        console.log("no cat for this RXCUI: ", element);
      } else {
        cats.forEach((cat) => {
          result_dict[cat].push(singleResult);
        });
      }
    });
  }

  CAT_LIST.forEach((cat) => {
    // remove empty cat
    if (result_dict[cat].length == 0) {
      delete result_dict[cat];
    } else {
      // order cat by RXCUI order in this cat
      result_dict[cat].sort(function (a, b) {
        return a.start - b.start;
        // return RXCUI_BY_CAT_ORDER_DICT[cat].indexOf(a.RXCUI) - RXCUI_BY_CAT_ORDER_DICT[cat].indexOf(b.RXCUI);
      });
    }
  });
  return result_dict;
};

/**
 * 

 getOrangeDrug = get paralytics drug for person
 
 */

module.exports = {
  calculateMed,
};
