/*
 * @Author: Peng Zeng 
 * @Date: 2020-07-29 09:03:39 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-07-29 10:02:09
 */

// codes.xlsm
const PATH = require("path").join(__dirname, "./codes721.xlsm");

const Service = require("egg").Service;
const XLSX = require("xlsx");

const workbook = XLSX.readFile(PATH);
const NATIVE_DISEASE_JSON = XLSX.utils.sheet_to_json(workbook.Sheets["Native disease"], {
  defval: null,
});
// console.log('NATIVE_DISEASE_JSON :>> ', NATIVE_DISEASE_JSON);

const getSubcat = (string_subcat) => {
  if (!string_subcat) {
    return null;
  }

  // string_subcat = `VSD position[Subaortic:DORV - VSD position - Subaortic;Subpulmonary:DORV - VSD position - Subpulmonary;Uncommitted:DORV - VSD position - Uncommitted;Doubly committed:DORV - VSD position - Doubly committed;IVS:DORV - IVS]`
  const subcat_obj = {};
  const arr1 = string_subcat
    .split("]")
    .map((x) => x.trim())
    .filter(Boolean);
  arr1.forEach((element) => {
    // current element = `VSD position[Subaortic:DORV - VSD position - Subaortic;Subpulmonary:DORV - VSD position - Subpulmonary;Uncommitted:DORV - VSD position - Uncommitted;Doubly committed:DORV - VSD position - Doubly committed;IVS:DORV - IVS`
    const arr2 = element
      .split("[")
      .map((x) => x.trim())
      .filter(Boolean);
    // arr2[0] = `VSD position`
    subcat_obj[arr2[0]] = {};
    if (!arr2[1]) {
      console.log("arr1 :>> ", arr1);
      console.log("arr2 :>> ", arr2);
    }

    const arr3 = arr2[1]
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean);
    arr3.forEach((item) => {
      // the first item is `Subaortic:DORV - VSD position - Subaortic;Subpulmonary`
      const arr4 = item
        .split(":")
        .map((x) => x.trim())
        .filter(Boolean);
      // arr4[0] = `Subaortic`
      // arr4[1] = `DORV - VSD position - Subaortic;Subpulmonary`
      if (arr4.length !== 2) {
        console.log("arr4 length wrong :>> ", arr4);
      }
      subcat_obj[arr2[0]][arr4[0]] = arr4[1];
      // after the first item, subcat_obj = {"VSD position" : {"Subaortic" : "DORV - VSD position - Subaortic;Subpulmonary"}}
    });
  });
  return subcat_obj;
};

const getCovariateDisplay = (string_covariate_display) => {
  if (!string_covariate_display) {
    return null;
  }
  //VSD,AS:Aortic valve - AS
  return string_covariate_display.split(",").map((x) => x.trim().split(":")[0]);
};

// ---------------- sheet: Native disease
const HEADERS = Object.keys(NATIVE_DISEASE_JSON[0]);
// console.log("HEADERS :>> ", HEADERS);

const DISEASE_TO_COVARIATE_DICT = {};
const COVARIATE_TO_DISPLAY_DICT = {};
const DISEASE_TO_SUBCAT_DICT = {};
NATIVE_DISEASE_JSON.forEach((row) => {
  const covariate = row["Mandatory covariate"]
    ? row["Mandatory covariate"].split(",").map((x) => x.trim())
    : null;

  DISEASE_TO_COVARIATE_DICT[row["Native disease"]] = covariate;
  if (row["Mandatory covariate (Phenotype display)"]) {
    row["Mandatory covariate (Phenotype display)"]
      .replace(/–/g, "-")
      .split(",")
      .forEach((element) => {
        let curCovariateDisplay = element.trim().split(":");
        let abb = curCovariateDisplay[0];
        if (curCovariateDisplay.length === 1) {
          if (!(abb in COVARIATE_TO_DISPLAY_DICT)) {
            COVARIATE_TO_DISPLAY_DICT[abb] = abb;
          }
        }
        if (curCovariateDisplay.length === 2) {
          let originCovariate = curCovariateDisplay[1];
          if (!(originCovariate in COVARIATE_TO_DISPLAY_DICT)) {
            COVARIATE_TO_DISPLAY_DICT[originCovariate] = abb;
          }
        }
      });
  }

  const subcat = row.Subcategory ? getSubcat(row.Subcategory) : null;
  DISEASE_TO_SUBCAT_DICT[row["Native disease"]] = subcat;
});

// console.log("DISEASE_TO_COVARIATE_DICT :>> ", DISEASE_TO_COVARIATE_DICT);
// console.log("DISEASE_TO_SUBCAT_DICT :>> ", DISEASE_TO_SUBCAT_DICT);
// console.log("COVARIATE_TO_DISPLAY_DICT :>> ", COVARIATE_TO_DISPLAY_DICT);

const DISEASE_TO_PATIENT_SELECTION = {};
for (const disease in DISEASE_TO_COVARIATE_DICT) {
  // self
  let self_covariate_item;
  let other_covariates;
  if (DISEASE_TO_SUBCAT_DICT[disease]) {
    self_covariate_item = [];
    const self_subcategory_header = Object.keys(DISEASE_TO_SUBCAT_DICT[disease]);
    for (const subcategory_header of self_subcategory_header) {
      const subcategory_item = [
        ...Object.keys(DISEASE_TO_SUBCAT_DICT[disease][subcategory_header]),
        "Unknown",
      ];
      const subcategory_item_long_name = subcategory_item.map(
        (x) => DISEASE_TO_SUBCAT_DICT[disease][subcategory_header][x]
      );

      self_covariate_item.push({
        subcategory_header,
        subcategory_item,
        // subcategory_item_long_name,
      });
    }
  } else {
    // console.log("no subcat for :>> ", item);
  }

  // others in covariate
  if (DISEASE_TO_COVARIATE_DICT[disease]) {
    other_covariates = DISEASE_TO_COVARIATE_DICT[disease].map((item) => {
      // covariate to covariate display
      let covariate_header = item;
      if (item in COVARIATE_TO_DISPLAY_DICT) {
        covariate_header = COVARIATE_TO_DISPLAY_DICT[item];
      }

      const cur_covariate = { covariate_header };
      if (DISEASE_TO_SUBCAT_DICT[item]) {
        cur_covariate.covariate_item = [];
        const other_subcategory_header = Object.keys(DISEASE_TO_SUBCAT_DICT[item]);
        for (const subcategory_header of other_subcategory_header) {
          const subcategory_item = [
            ...Object.keys(DISEASE_TO_SUBCAT_DICT[item][subcategory_header]),
            "Unknown",
          ];
          const subcategory_item_long_name = subcategory_item.map(
            (x) => DISEASE_TO_SUBCAT_DICT[item][subcategory_header][x]
          );

          cur_covariate.covariate_item.push({
            subcategory_header,
            subcategory_item,
            // subcategory_item_long_name,
          });
        }
      } else {
        // console.log("no subcat for :>> ", item);
      }

      return cur_covariate;
    });
  }

  if (other_covariates) {
    DISEASE_TO_PATIENT_SELECTION[disease] = [
      { covariate_header: disease, covariate_item: self_covariate_item },
      ...other_covariates,
    ];
  } else {
    DISEASE_TO_PATIENT_SELECTION[disease] = [
      { covariate_header: disease, covariate_item: self_covariate_item },
    ];
  }
}


// DISEASE_TO_PATIENT_SELECTION["DORV"][0]["covariate_item"] :>>  [
//   {
//     subcategory_header: 'VSD position',
//     subcategory_item: [
//       'Subaortic',
//       'Subpulmonary',
//       'Uncommitted',
//       'Doubly committed',
//       'IVS'
//     ],
//     subcategory_item_long_name: [
//       'DORV - VSD position - Subaortic',
//       'DORV - VSD position - Subpulmonary',
//       'DORV - VSD position - Uncommitted',
//       'DORV - VSD position - Doubly committed',
//       'DORV - IVS'
//     ]
//   }
// ]

const DISEASE_TO_COVARIATE_DISPLAY_DICT = {};

for (let key in DISEASE_TO_COVARIATE_DICT) {
    if (DISEASE_TO_COVARIATE_DICT[key]) {
        DISEASE_TO_COVARIATE_DISPLAY_DICT[key] = DISEASE_TO_COVARIATE_DICT[key].map(x=>COVARIATE_TO_DISPLAY_DICT[x])
    } else {
        DISEASE_TO_COVARIATE_DISPLAY_DICT[key] = null;
    }
}
console.log('DISEASE_TO_COVARIATE_DISPLAY_DICT :>> ', DISEASE_TO_COVARIATE_DISPLAY_DICT);

module.exports = {
  DISEASE_TO_COVARIATE_DICT,
  DISEASE_TO_SUBCAT_DICT,
  DISEASE_TO_PATIENT_SELECTION,
  COVARIATE_TO_DISPLAY_DICT,
};
