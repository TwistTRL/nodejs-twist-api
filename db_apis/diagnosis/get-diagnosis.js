/*
 * @Author: Peng Zeng
 * @Date: 2020-07-27 01:00:04
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-08-04 13:41:02
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
  for (let disease in DISEASE_TO_SUBCAT_DICT) {
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

  return subcat_order;
};

// {
//   DORV: ["DORV", "AVC", "TAPVC"],
//   AVC: ["AVC"],
//   TAPVC: ["TAPVC"],
// };
const getOutputOrder = () => {
  let output_order = {};
  for (let item in DISEASE_TO_COVARIATE_DICT) {
    if (DISEASE_TO_COVARIATE_DICT[item]) {
      output_order[item] = [item, ...DISEASE_TO_COVARIATE_DICT[item]];
    } else {
      output_order[item] = [item];
    }
  }
  return output_order;
};

const getSubcatDisplay = (subcatName, subcatObj) => {
  if (!subcatObj) {
    return null;
  }
  console.log("subcatObj :>> ", subcatObj);
  let ret;
  switch (subcatName) {
    case "HLHS":
      ret = `HLHS (${subcatObj["Mitral valve"]}/${subcatObj["Aortic valve"]})`;
      if (subcatObj.COVARIATE && subcatObj.COVARIATE.includes("Atrial septum - Intact")) {
        ret += " with IAS";
      }
      break;
    case "TOF":
      ret = `TOF/PS`;
      break;

    case "Aorta - IAA":
      ret = `Type ${subcatObj.Type} IAA`;
      break;

    case "Aorta - CoA":
      ret = `CoA`;
      // TODO
      break;

    case "Aorta - Vascular ring":
      ret = `Vascular ring`;
      if (subcatObj["Aorta - Vascular ring"] !== "Unmentioned") {
        ret = subcatObj["Aorta - Vascular ring"];
      }
      break;

    case "Aortic arch abnormal branching":
      ret = `Abnormal aortic arch branching`;
      break;

    case "Aortic commissure abnormality":
    case "Aortic valve - Abnormal cusp":
      if (subcatObj["Commissure"] === "Bi") {
        ret = "BAV";
      } else if (subcatObj["Commissure"] === "Uni") {
        ret = "unicommissural AV";
      } else if (subcatObj["Commissure"] === "Quad") {
        ret = "quadricuspid AV";
      } else {
        ret = "AV";
      }
      break;
    case "Aortic valve - AS - Moderate to severe":
      if (subcatObj["Severity"] === "Moderate") {
        ret = "Moderate AS";
      } else if (subcatObj["Severity"] === "Severe") {
        ret = "Severe AS";
      } else if (subcatObj["Commissure"] === "Unmentioned") {
        ret = "moderate-severe AS";
      }
      break;

    case "Aortic valve - AS - Moderate to severe":
      if (subcatObj["Severity"] === "Moderate") {
        ret = "Moderate AS";
      } else if (subcatObj["Severity"] === "Severe") {
        ret = "Severe AS";
      } else if (subcatObj["Commissure"] === "Unmentioned") {
        ret = "moderate-severe AS";
      }

      break;
    case "Aortic valve - AS":
      if (subcatObj["Commissure"] === "Bi") {
        ret = `BAV and ${subcatObj["Severity"]} AS`;
      } else if (subcatObj["Commissure"] === "Uni") {
        ret = `unicommissural AV`;
      } else if (subcatObj["Commissure"] === "Quad") {
        ret = `quadricuspid AV`;
      }
      break;

    case "Aortic valve - Atresia":
      if (subcatObj["COVARIATE"] && subcatObj["COVARIATE"].includes("VAS")) {
        ret = "AA/VSD";
      } else {
        ret = "AA";
      }
      break;

    case "Aortic valve - Dilated annulus":
      ret = "dilated aortic annulus";
      break;

    case "TOF - PS":
      ret = "TOF - PS";
      break;

    case "Aortic valve - Hypoplastic annulus":
      if (subcatObj["Severity"]) {
        ret = subcatObj["Severity"] + " AV hypoplasia";
      } else {
        ret = "AV hypoplasia";
      }
      break;

    case "Aortic valve - Prolapse":
      ret = "AV prolapse";
      break;

    case "AP window":
      ret = "AP window";
      break;

    case "ASD":
      if (!subcatObj["COVARIATE"]) {
        ret = "ASD";
      } else if (subcatObj["COVARIATE"].includes("ASD - Sinus venosus")) {
        ret = "sinus venosus ASD";
      } else if (subcatObj["COVARIATE"].includes("ASD - Secundum")) {
        ret = "ASD2";
      } else if (subcatObj["COVARIATE"].includes("ASD - Primum")) {
        ret = "ASD1";
      } else if (subcatObj["COVARIATE"].includes("ASD - Multiple")) {
        ret = "multiple ASDs";
      } else if (subcatObj["COVARIATE"].includes("ASD - Common atrium")) {
        ret = "common atrium"; // TODO double check this ome
      } else if (subcatObj["COVARIATE"].includes("ASD - Atypical")) {
        ret = "atypical ASD";
      }
      break;

    case "Atrial septum - Aneurysm of septum primum":
      ret = "aneurysm of septum primum";
      break;

    case "Atrium - Divided RA (Cor triatriatum dexter)":
      ret = "cor triatriatum dexter";
      break;

    case "Cor triatriatum":
      ret = "cor triatriatum dexter";
      break;

    case "Coronary artery - Anomalous branching":
      ret = "anomalous coronary artery branching";
      break;

    case "Coronary artery - Anomalous course - Intramural":
      ret = "intramural coronary artery";
      break;

    case "Coronary artery - Anomalous origin - From aorta - LCA from right":
      ret = "LCA from right facing sinus";
      break;

    case "TOF - PA":
      if (!subcatObj["COVARIATE"]) {
        ret = "TOF/PA";
      } else {
        ret = "TOF/PA/MAPCAs";
        // TODO double check this one
        //         select distinct covariate from diagnosis where anatomy = 'TOF - PA';
        //          --if no covariate --> TOF/PA
        //          ---If APC--> TOF/PA/MAPCAs
      }
      break;

    case "Coronary artery - Anomalous origin - From aorta - Others":
      ret = "anomalous origin of the coronary artery from aorta";
      break;

    case "Coronary artery - Anomalous origin - From aorta - RCA from left":
      ret = "RCA from left facing sinus";
      break;

    case "Coronary artery - Anomalous origin - From PA":
      if (!subcatObj["SUBCAT_VALUE" === "ARCAPA"]) {
        ret = "ARCAPA";
      } else {
        ret = "ALCAPA";
      }
      break;

    case "Coronary artery - Coronary fistula":
      if (subcatObj["SUBCAT_VALUE"] === "Coronary-cameral") {
        ret = "coronary-cameral fistula";
      } else if (subcatObj["SUBCAT_VALUE"] === "Arterio-venous") {
        ret = "arteriovenous coronary fistula";
      } else if (subcatObj["SUBCAT_VALUE"] === "To PA") {
        ret = "coronary-PA fistula";
      } else {
        ret = "coronary artery fistula";
      }
      break;

    case "Coronary artery - Anomalous origin - From PA":
      if (!subcatObj["SUBCAT_VALUE"] === "ARCAPA") {
        ret = "ARCAPA";
      } else {
        ret = "ALCAPA";
      }
      break;

    case "Coronary artery - Anomalous origin - From PA":
      if (!subcatObj["SUBCAT_VALUE"] === "ARCAPA") {
        ret = "ARCAPA";
      } else {
        ret = "ALCAPA";
      }
      break;

    case "DCRV":
      ret = "DCRV";
      break;

    case "DILV":
      ret = "DILV";
      break;

    case "DOLV":
      if (subcatObj["VSD position"] && subcatObj["VSD position"] !== "Unmentioned") {
        ret = `DOLV with ${subcatObj["VSD position"]} VSD`;
      } else {
        ret = "DOLV";
      }
      break;

    case "Double outlet atrium":
      if (subcatObj["SUBCAT_VALUE"] === "DORA") {
        ret = "double outlet right atrium";
      } else if (subcatObj["SUBCAT_VALUE"] === "DOLA") {
        ret = "double outlet left atrium";
      } else {
        ret = "double outlet"; // TODO check
        //         select * from diagnosis where anatomy = 'Double outlet atrium';
        // -- If subcat value = DORA --> double outlet right atrium
        // --If subcat value = DOLA --> double outlet left atrium
      }
      break;

    case "Hemitruncus":
      if (subcatObj["SUBCAT_VALUE"]) {
        ret = `hemitruncus with ${subcatObj["SUBCAT_VALUE"]} origin from truncus arteriosus`;
      } else {
        ret = "hemitruncus origin from truncus arteriosus";
      }
      break;

    case "TOF - Absent pulmonary valve syndrome":
      ret = "TOF/APV";
      break;
      
    default:
      console.log(`Error on subcat name.`);
  }
  return ret;
};

async function diagnosisQuerySQLExecutor(conn, binds) {
  console.log("~~SQL_GET_DIAGNOSIS: ", SQL_GET_DIAGNOSIS);
  let rawRecord = await conn.execute(SQL_GET_DIAGNOSIS, binds);
  if (!rawRecord.rows[0]) {
    return "Error: no ANATOMY";
  }
  const curAnatomy = rawRecord.rows[0].ANATOMY;
  console.log("curAnatomy :>> ", curAnatomy);
  // let arr = rawRecord.rows.filter((item) => item.SUBCAT_ANAT);
  let arr = rawRecord.rows;

  let diagDict = {};
  arr.forEach((element) => {
    let curCOVARIATE = [];
    if (element.SUBCAT_ANAT) {
      if (element.SUBCAT_ANAT in diagDict) {
        diagDict[element.SUBCAT_ANAT][element.SUBCAT_NAME] = element.SUBCAT_VALUE;
      } else {
        diagDict[element.SUBCAT_ANAT] = {};
        diagDict[element.SUBCAT_ANAT][element.SUBCAT_NAME] = element.SUBCAT_VALUE;
      }
    } else if (element.COVARIATE) {
      curCOVARIATE.push(element.COVARIATE);
      if (diagDict[element.ANATOMY]) {
        diagDict[element.ANATOMY].COVARIATE = curCOVARIATE;
      } else {
        diagDict[element.ANATOMY] = {};
        diagDict[element.ANATOMY].COVARIATE = curCOVARIATE;
      }
    }
  });

  console.log("diagDict :>> ", diagDict);
  const DIAGNOSIS_OUTPUT_ORDER = getOutputOrder();
  const DIAGNOSIS_SUBCAT_ORDER = getSubcatOrder();
  const curOutputOrder = DIAGNOSIS_OUTPUT_ORDER[curAnatomy];
  //curOutputOrder = ["DORV", "AVC", "TAPVC"]
  // console.log("curOutputOrder :>> ", curOutputOrder);

  if (!["DORV", "AVC", "TAPVC"].includes(curAnatomy)) {
    return curOutputOrder
      .map((x) => getSubcatDisplay(x, diagDict[x]))
      .filter(Boolean)
      .join("/") || curAnatomy;
  }

  let ret = [];
  curOutputOrder.forEach((anat) => {
    if (anat in diagDict) {
      let eachAnat = [];
      DIAGNOSIS_SUBCAT_ORDER[anat].forEach((item) => {
        let curItemDisp;
        if (item === "SELF") {
          curItemDisp = anat;
        } else {
          if (
            DIAGNOSIS_RULES_DICT[anat] &&
            DIAGNOSIS_RULES_DICT[anat][item] &&
            diagDict[anat][item] in DIAGNOSIS_RULES_DICT[anat][item]
          ) {
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
}

const getDiagnosis = database.withConnection(async function (conn, binds) {
  let result = await diagnosisQuerySQLExecutor(conn, binds);
  return result;
});

module.exports = {
  getDiagnosis,
  diagnosisQuerySQLExecutor,
};
