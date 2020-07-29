/*
 * @Author: Peng Zeng
 * @Date: 2020-07-27 01:00:04
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-07-29 12:23:22
 */

const database = require("../../services/database");
const {
  DISEASE_TO_COVARIATE_DICT,
  DISEASE_TO_SUBCAT_DICT,
  DISEASE_TO_PATIENT_SELECTION,
  COVARIATE_TO_DISPLAY_DICT,
  DISEASE_TO_COVARIATE_DISPLAY_DICT,
} = require("../phenotyping/codes721");

const SQL_GET_DIAGNOSIS = `
SELECT 
  ANATOMY,
  SUBCAT_ANAT,
  SUBCAT_NAME,
  SUBCAT_VALUE,
  COVARIATE
FROM DIAGNOSIS
WHERE MRN = :mrn`;

const DIAGNOSIS_RULES_DICT = {
  AVC: {
    Type: {
      Complete: "CAVC",
      Transitional: "TrAVC",
      Unclear: "AVC",
    },
    "Ventricle balance": {
      balanced: "balanced",
      Unbalanced: "",
    },
    "Ventricle dominance": {
      "Left dominant": "Ldom",
      "Right dominant": "Rdom",
    },
  },
  DORV: {
    "VSD position": {
      Unmentioned: "DORV",
    },
  },
  TAPVC: {},
};

// TAPVC: ["Type", "PVO", "SELF"],
// AVC: ["Ventricle balance", "Ventricle dominance", "Type"],
// DORV: ["VSD position"],
const getSubcatOrder = () => {
  let subcat_order = {};
  for (disease in DISEASE_TO_SUBCAT_DICT) {
    if (disease === "AVC") {
      // exception 1
      subcat_order[disease] = ["Ventricle balance", "Ventricle dominance", "Type"];
    } else if (DISEASE_TO_SUBCAT_DICT[disease]) {
      subcat_order[disease] = Object.keys(DISEASE_TO_SUBCAT_DICT[disease]);
    }
    // exception 2
    if (disease === "TAPVC") {
      subcat_order[disease] = [...subcat_order[disease], "SELF"];
    }
  }

  console.log("subcat_order :>> ", subcat_order);
  return subcat_order;
};

// {
//   DORV: ["DORV", "AVC", "TAPVC"],
//   AVC: ["AVC"],
//   TAPVC: ["TAPVC"],
// };
const getOutputOrder = () => {
  let output_order = {};
  for (item in DISEASE_TO_COVARIATE_DICT) {
    if (DISEASE_TO_COVARIATE_DICT[item]) {
      output_order[item] = [item, ...DISEASE_TO_COVARIATE_DICT[item]];
    } else {
      output_order[item] = [item];
    }
  }
  console.log("output_order :>> ", output_order);
  return output_order;
};

async function diagnosisQuerySQLExecutor(conn, binds) {
  console.log("~~SQL_GET_DIAGNOSIS: ", SQL_GET_DIAGNOSIS);
  let rawRecord = await conn.execute(SQL_GET_DIAGNOSIS, binds);
  if (!rawRecord.rows[0]) {
    return "Error: no ANATOMY";
  }
  const curAnatomy = rawRecord.rows[0].ANATOMY;
  console.log("curAnatomy :>> ", curAnatomy);
  let arr = rawRecord.rows.filter((item) => item.SUBCAT_ANAT);
  console.log("arr :>> ", arr);

  let diagDict = {};
  arr.forEach((element) => {
    if (element.SUBCAT_ANAT in diagDict) {
      diagDict[element.SUBCAT_ANAT][element.SUBCAT_NAME] = element.SUBCAT_VALUE;
    } else {
      diagDict[element.SUBCAT_ANAT] = {};
      diagDict[element.SUBCAT_ANAT][element.SUBCAT_NAME] = element.SUBCAT_VALUE;
    }
  });
  console.log("diagDict :>> ", diagDict);
  const DIAGNOSIS_OUTPUT_ORDER = getOutputOrder();
  const DIAGNOSIS_SUBCAT_ORDER = getSubcatOrder();
  const curOutputOrder = DIAGNOSIS_OUTPUT_ORDER[curAnatomy];
  //curOutputOrder = ["DORV", "AVC", "TAPVC"]
  console.log("curOutputOrder :>> ", curOutputOrder);

  let ret = [];
  curOutputOrder.forEach((anat) => {
    if (anat in diagDict) {
      let eachAnat = [];
      DIAGNOSIS_SUBCAT_ORDER[anat].forEach((item) => {
        let curItemDisp;
        if (item === "SELF") {
          curItemDisp = anat;
        } else {
          if (DIAGNOSIS_RULES_DICT[anat] && DIAGNOSIS_RULES_DICT[anat][item] && diagDict[anat][item] in DIAGNOSIS_RULES_DICT[anat][item]) {
            curItemDisp = DIAGNOSIS_RULES_DICT[anat][item][diagDict[anat][item]];
          } else {
            curItemDisp = diagDict[anat][item].toLowerCase();
          }
        }
        if (curItemDisp) {
          eachAnat.push(curItemDisp);
        }
      });
      if (eachAnat.length) {
        ret.push(eachAnat.join(" "));
      }
    }
  });
  return ret.join("/");

  // {
  //   "TAPVC": {
  //       "Type": "Mixed",
  //       "PVO": "Obstructed"
  //   },
  //   "AVC": {
  //       "Type": "Complete",
  //       "Ventricle balance": "Unbalanced",
  //       "Ventricle dominance": "Right dominant"
  //   },
  //   "DORV": {
  //       "VSD position": "Unmentioned"
  //   }
  // }
  return ret;
}

const getDiagnosis = database.withConnection(async function (conn, binds) {
  let result = await diagnosisQuerySQLExecutor(conn, binds);
  return result;
});

module.exports = {
  getDiagnosis,
};
