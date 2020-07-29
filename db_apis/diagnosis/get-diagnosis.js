/*
 * @Author: Peng Zeng
 * @Date: 2020-07-27 01:00:04
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-07-28 23:09:56
 */

const database = require("../../services/database");
var timeLable = 0;

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

const DIAGNOSIS_RULES_ORDER = {
  TAPVC: ["Type", "PVO", "SELF"],
  AVC: ["Ventricle balance", "Ventricle dominance", "Type"],
  DORV: ["VSD position"],
};

const DIAGNOSIS_OUTPUT_ORDER = {
  DORV: ["DORV", "AVC", "TAPVC"],
  AVC: ["AVC"],
  TAPVC: ["TAPVC"],
};

async function diagnosisQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL_GET_DIAGNOSIS: ", SQL_GET_DIAGNOSIS);
  let rawRecord = await conn.execute(SQL_GET_DIAGNOSIS, binds);
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
  const curOutputOrder = DIAGNOSIS_OUTPUT_ORDER[curAnatomy];
  //curOutputOrder = ["DORV", "AVC", "TAPVC"]
  console.log("curOutputOrder :>> ", curOutputOrder);

  let ret = [];
  curOutputOrder.forEach((anat) => {
    if (anat in diagDict) {
      let eachAnat = [];
      DIAGNOSIS_RULES_ORDER[anat].forEach((item) => {
        let curItemDisp;
        if (item === "SELF") {
          curItemDisp = anat;
        } else {
          let alias = DIAGNOSIS_RULES_DICT[anat][item];
          if (alias && diagDict[anat][item] in alias) {
            curItemDisp = alias[diagDict[anat][item]];
          } else {
            curItemDisp = diagDict[anat][item];
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
