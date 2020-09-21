/*
 * @Author: Peng Zeng
 * @Date: 2020-08-27 10:54:55
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-20 21:14:37
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

async function diagnosisQuerySQLExecutor(conn, binds) {
  console.log("~~SQL_GET_DIAGNOSIS: ", SQL_GET_DIAGNOSIS);
  let rawRecord = await conn.execute(SQL_GET_DIAGNOSIS, binds);
  if (!rawRecord.rows[0] || !rawRecord.rows[0].ANATOMY) {
    return "no anatomy";
  }
  const curAnatomy = rawRecord.rows[0].ANATOMY;
  console.log("curAnatomy :>> ", curAnatomy);
  let arr = rawRecord.rows;

  let diagnosisDict = {};
    arr.forEach((element) => {
      if (element.SUBCAT_ANAT) {
        if (element.SUBCAT_ANAT in diagnosisDict) {
          diagnosisDict[element.SUBCAT_ANAT][element.SUBCAT_NAME] = element.SUBCAT_VALUE;
        } else {
          diagnosisDict[element.SUBCAT_ANAT] = {};
          diagnosisDict[element.SUBCAT_ANAT][element.SUBCAT_NAME] = element.SUBCAT_VALUE;
        }
      } else if (element.COVARIATE) {
        if (diagnosisDict[curAnatomy]) {
          if (diagnosisDict[curAnatomy].COVARIATE) {
            diagnosisDict[curAnatomy].COVARIATE.push(element.COVARIATE);
          } else {
            diagnosisDict[curAnatomy].COVARIATE = [element.COVARIATE];
          }
        } else {
          diagnosisDict[curAnatomy] = {};
          diagnosisDict[curAnatomy].COVARIATE = [element.COVARIATE];
        }
      }
    });

    console.log("diagnosisDict :>> ", diagnosisDict);
    const DIAGNOSIS_OUTPUT_ORDER = getOutputOrder(DISEASE_TO_COVARIATE_DICT);
    const DIAGNOSIS_SUBCAT_ORDER = getSubcatOrder(DISEASE_TO_SUBCAT_DICT);
    const curOutputOrder = DIAGNOSIS_OUTPUT_ORDER[curAnatomy];
    //curOutputOrder = ["DORV", "AVC", "TAPVC"]
    console.log("curOutputOrder :>> ", curOutputOrder);

    if (!["AVC", "TAPVC"].includes(curAnatomy)) {
      return getSubcatDisplay(curAnatomy, diagnosisDict[curAnatomy], DIAGNOSIS_SUBCAT_ORDER, diagnosisDict)
        .replace(" n/a ", " ")
        .replace(/unmentioned /gi, "");
      // return curOutputOrder
      //   .map((x) => getSubcatDisplay(x, diagnosisDict[x]))
      //   .filter(Boolean)
      //   .join("/")
      //   .replace(" n/a ", " ");
    }

    let ret = [];
    curOutputOrder.forEach((anat) => {
      if (anat in diagnosisDict) {
        ret.push(get_AVC_or_TAPVC(anat, DIAGNOSIS_SUBCAT_ORDER, diagnosisDict));
      }
    });
    ret = ret
      .join("/")
      .replace(" n/a ", " ")
      .replace(/unmentioned /gi, "");
    return ret;
  }

const get_AVC_or_TAPVC = (anat, DIAGNOSIS_SUBCAT_ORDER, diagDict) => {
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
  return eachAnat.join(" ");
};

const DORV_COVARIATE_DICT = {
  "Tricuspid valve - Straddling": "straddling TV",
  "Mitral valve - Straddling": "straddling MV",
  AVC: "CAVC",
  "Mitral valve - Atresia": "MA",
  TAPVC: "TAPVC",
  "Aortic valve - Atresia": "AA",
  VSD: "VSD",
  "Aortic valve - Overriding": "overriding AV",
  "Pulmonary valve - Atresia": "PA",
};

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
const getSubcatOrder = (DISEASE_TO_SUBCAT_DICT) => {
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
const getOutputOrder = (DISEASE_TO_COVARIATE_DICT) => {
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

const getSubcatDisplay = (subcatName, subcatObj, DIAGNOSIS_SUBCAT_ORDER, diagDict) => {
//   console.log("subcatName :>> ", subcatName);
  console.log("subcatObj :>> ", subcatObj);
  let ret;
  switch (subcatName) {
    case "HLHS":
      if (
        !subcatObj ||
        subcatObj["Mitral valve"] === "Unmentioned" ||
        subcatObj["Aortic valve"] === "Unmentioned"
      ) {
        ret = "HLHS";
      } else {
        ret = `HLHS (${subcatObj["Mitral valve"]}/${subcatObj["Aortic valve"]})`;
      }
      if (
        subcatObj &&
        subcatObj.COVARIATE &&
        subcatObj.COVARIATE.includes("Atrial septum - Intact")
      ) {
        ret += " with IAS";
      }
      break;
    case "TOF":
      ret = `TOF/PS`;
      break;

    case "Aorta - IAA":
      if (subcatObj && subcatObj.Type && subcatObj.Type !== "Unmentioned") {
        ret = `Type ${subcatObj.Type} IAA`;
      } else {
        ret = `IAA`;
      }
      break;

    case "Aorta - CoA":
      ret = `CoA`;
      // TODO
      break;

    case "Aorta - Vascular ring":
      ret = `Vascular ring`;
      if (subcatObj && subcatObj["Type"] !== "Unmentioned") {
        ret = `Type ${subcatObj.Type} Vascular ring`;
      }
      break;

    case "Aortic arch abnormal branching":
      ret = `Abnormal aortic arch branching`;
      break;

    case "Aortic commissure abnormality":
    case "Aortic valve - Abnormal cusp":
      if (subcatObj) {
        if (subcatObj["Commissure"] === "Bi") {
          ret = "BAV";
        } else if (subcatObj["Commissure"] === "Uni") {
          ret = "unicommissural AV";
        } else if (subcatObj["Commissure"] === "Quad") {
          ret = "quadricuspid AV";
        } else {
          ret = "AV";
        }
      } else {
        ret = "AV";
      }

      break;
    case "Aortic valve - AS - Moderate to severe":
      ret = "Aortic valve - AS - Moderate to severe";
      if (subcatObj) {
        if (subcatObj["Severity"] === "Moderate") {
          ret = "Moderate AS";
        } else if (subcatObj["Severity"] === "Severe") {
          ret = "Severe AS";
        } else if (subcatObj["Commissure"] === "Unmentioned") {
          ret = "moderate-severe AS";
        }
      }
      break;

    case "Aortic valve - AS - Moderate to severe":
      if (subcatObj) {
        if (subcatObj["Severity"] === "Moderate") {
          ret = "Moderate AS";
        } else if (subcatObj["Severity"] === "Severe") {
          ret = "Severe AS";
        } else if (subcatObj["Commissure"] === "Unmentioned") {
          ret = "moderate-severe AS";
        }
      } else {
        ret = "Aortic valve - AS - Moderate to severe";
      }

      break;
    case "Aortic valve - AS":
      if (subcatObj) {
        if (subcatObj["Commissure"] === "Bi") {
          ret = `BAV and ${subcatObj["Severity"]} AS`;
        } else if (subcatObj["Commissure"] === "Uni") {
          ret = `unicommissural AV`;
        } else if (subcatObj["Commissure"] === "Quad") {
          ret = `quadricuspid AV`;
        } else {
          ret = "AV";
        }
      } else {
        ret = "AV";
      }

      break;

    case "Aortic valve - Atresia":
      if (subcatObj && subcatObj["COVARIATE"] && subcatObj["COVARIATE"].includes("VAS")) {
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
      if (subcatObj && subcatObj["Severity"]) {
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
      if (!subcatObj || !subcatObj["COVARIATE"]) {
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
      } else {
        ret = "ASD";
      }
      break;
    case "ASD - Primum":
      ret = "ASD1";
      break;
    case "ASD - Multiple":
      ret = "multiple ASDs";
      break;
    case "ASD - Common atrium":
      ret = "common atrium";
      break;
    case "ASD - Atypical":
      ret = "atypical ASD";
      break;
    case "ASD - Secundum":
      ret = "ASD2";
      break;
    case "ASD - Sinus venosus":
      ret = "sinus venosus ASD";
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
      if (!subcatObj || !subcatObj["COVARIATE"]) {
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

    case "Coronary artery - Coronary fistula":
      if (subcatObj) {
        if (subcatObj["Type"] === "Coronary-cameral") {
          ret = "coronary-cameral fistula";
        } else if (subcatObj["Type"] === "Arterio-venous") {
          ret = "arteriovenous coronary fistula";
        } else if (subcatObj["Type"] === "To PA") {
          ret = "coronary-PA fistula";
        } else {
          ret = "coronary artery fistula";
        }
      } else {
        ret = "coronary artery fistula";
      }

      break;

    case "Coronary artery - Anomalous origin - From PA":
      if (subcatObj && subcatObj["Type"] === "ARCAPA") {
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

    case "DIRV":
      ret = "DIRV";
      break;

    case "DOLV":
      if (subcatObj && subcatObj["VSD position"] && subcatObj["VSD position"] !== "Unmentioned") {
        ret = `DOLV with ${subcatObj["VSD position"]} VSD`;
      } else {
        ret = "DOLV";
      }
      break;

    case "Double outlet atrium":
      if (subcatObj) {
        if (subcatObj["Subcategory"] === "DORA") {
          ret = "double outlet right atrium";
        } else if (subcatObj["Subcategory"] === "DOLA") {
          ret = "double outlet left atrium";
        } else {
          ret = "double outlet"; // TODO check
          //         select * from diagnosis where anatomy = 'Double outlet atrium';
          // -- If subcat value = DORA --> double outlet right atrium
          // --If subcat value = DOLA --> double outlet left atrium
        }
      } else {
        ret = "double outlet"; // TODO check
      }
      break;

    case "Hemitruncus":
      if (subcatObj && subcatObj["Side"] && subcatObj["Side"] !== "Unmentioned") {
        ret = `hemitruncus with ${subcatObj["Side"]} origin from truncus arteriosus`;
      } else {
        ret = "hemitruncus origin from truncus arteriosus";
      }
      break;

    case "TOF - Absent pulmonary valve syndrome":
      ret = "TOF/APV";
      break;

    case "Left superior vena cava":
      if (subcatObj && subcatObj["Type"] === "To CS") {
        ret = "LSVC to CS";
      } else {
        ret = "LSVC";
      }
      break;
    case "LV-Ao tunnel":
      ret = "LV-Ao tunnel";
      break;
    case "LV-RA shunt":
      ret = "LV-RA shunt";
      break;
    case "Mitral atresia":
      ret = "Mitral atresia";
      break;
    case "Mitral valve - MS":
      ret = "mitral stenosis";
      break;

    case "Mitral valve - Prolapse":
      ret = "MVP";
      break;

    case "TOF - AVC":
      ret = "TOF/CAVC";
      break;

    case "PA sling":
      ret = "PA sling";
      break;

    case "PAPVC":
      ret = "PAPVC";
      break;
    case "PDA":
      ret = "PDA";
      break;

    case "PFO":
      ret = "PFO";
      break;

    case "Pulmonary artery - Branch - Absent":
      ret = "absent branch PA";
      break;
    case "Pulmonary artery - Branch - Hypoplasty":
      ret = "hypoplastic branch PA";
      break;

    case "Pulmonary artery - Branch - Stenosis":
      ret = "branch PA stenosis";
      break;

    case "Pulmonary valve - Dysplasty":
      ret = "dysplastic PV";
      break;

    case "Pulmonary valve - PS":
      ret = "valvar PS";
      break;

    case "Pulmonary vein - Atresia":
      ret = "pulmonary vein atresia";
      break;

    case "PAIVS":
      ret = "PA/IVS";
      break;

    case "Pulmonary vein - Stenosis":
      ret = "PVS";
      break;

    case "Right aortic arch":
      ret = "RAA";
      break;

    case "Shones syndrome":
      ret = "Shone syndrome";
      break;

    case "Single coronary":
      ret = "single coronary";
      break;

    case "Single ventricle":
      ret = "Single ventricle";
      break;

    case "TA":
      if (!subcatObj || subcatObj["Type"] === "Unmentioned") {
        ret = "tricuspid atresia";
      } else {
        ret = `Type ${subcatObj["Type"]} tricuspid atresia`;
      }
      break;

    // see before
    //                       case "TAPVC":
    // break;

    case "Tricuspid valve - Prolapse":
      ret = "TV prolapse";
      break;

    case "Tricuspid valve - TS":
      ret = "TS";
      break;

    // see before
    //                       case "AVC":
    // break;

    case "Tricuspid valve dysplasty other than Ebstein's":
      ret = "TV dysplasia";
      break;

    case "Truncus arteriosus":
      if (subcatObj) {
        ret = `Type ${subcatObj["Type"]} ${subcatObj["VSD"]} truncus arteriosus`;
      } else {
        ret = "truncus arteriosus";
      }
      break;

    case "Ventricular aneurysm":
      ret = "ventricular aneurysm";
      break;

    case "Ventricular diverticulum":
      ret = "ventricular diverticulum";
      break;

    case "Ventricular hypoplasty":
      ret = "ventricular hypoplasia";
      break;

    case "VSD":
      if (subcatObj) {
        ret = `Type ${subcatObj["COVARIATE"]} VSD`;
      } else {
        ret = "VSD";
      }

      break;

    case "ACM":
      ret = "CC-TGA";
      break;

    case "DORV":
      ret = "DORV";
      if (subcatObj && subcatObj["VSD position"] && subcatObj["VSD position"] !== "Unmentioned") {
        ret = `DORV with ${subcatObj["VSD position"].toLowerCase()} VSD`;
      }
      if (subcatObj && subcatObj["COVARIATE"]) {
        subcatObj["COVARIATE"].forEach((element) => {
          if (element === "TAPVC" || element === "AVC") {
            ret += `/${get_AVC_or_TAPVC(element, DIAGNOSIS_SUBCAT_ORDER, diagDict)}`;
          } else {
            ret += `/${DORV_COVARIATE_DICT[element]}`;
          }
        });
      }

      break;

    case "DTGA":
      if (
        subcatObj &&
        subcatObj["Type"] &&
        subcatObj["Type"].includes("VSD") &&
        subcatObj["Type"] !== "Unmentioned"
      ) {
        ret = "dTGA/VSD";
      } else {
        ret = "dTGA/IVS";
      }
      break;

    case "LTGA":
      ret = "L-TGA";
      if (subcatObj) {
        if (Object.keys(subcatObj).includes("VSD")) {
          if (subcatObj["VSD"] !== "Unmentioned") {
            ret += "/VSD";
          }
        } else if (subcatObj["VSD"] !== "Unmentioned") {
          ret += "/IVS";
        }

        if (Object.keys(subcatObj).includes("PS") && subcatObj["PS"] !== "Unmentioned") {
          ret += "/PS";
        }

        if (subcatObj["COVARIATE"] && subcatObj["COVARIATE"].includes("Ebstein's anomaly")) {
          ret += " with Ebsteinoid TV";
        }
      }

      break;

    case "Ebstein's anomaly":
      ret = "Ebstein's anomaly";
      break;

    case "Aorta - CoA - Moderate to severe":
      // Aorta - CoA - Moderate to severe is different
      ret = "";
      let subcat_av = subcatObj["Aortic valve - AS"];
      if (subcat_av) {
        if (subcat_av["Severity"] === "Moderate") {
          ret += "moderate AS/";
        } else if (subcat_av["Severity"] === "Severe") {
          ret += "severe AS/";
        }
        if (subcat_av["Commissure"] === "Bi") {
          ret += `BAV`;
        } else if (subcat_av["Commissure"] === "Uni") {
          ret += `unicommissural AV`;
        } else if (subcat_av["Commissure"] === "Quad") {
          ret += `quadricuspid AV`;
        } else {
          ret += "AV";
        }

        ret += "/";
      }
      // if (subcatObj["Severity"] && subcatObj["Severity"] !== "Unmentioned") {
      //   ret += `${subcatObj["Severity"]} CoA`;
      // } else {
      ret += "CoA";
      // }

      if (subcatObj && subcatObj["COVARIATE"] && subcatObj["COVARIATE"].includes("VSD")) {
        ret += "/VSD";
      }

      break;

    case "Mitral valve - Cleft":
      ret = "cleft MV";
      break;

    case "Mitral valve - Dysplasty":
      ret = "dysplastic MV";
      break;

    case "Mitral valve - Hypoplasty":
      ret = "hypoplastic MV";
      break;

    default:
      console.log(`not in dict: ${subcatName}`);
      ret = subcatName;
  }
  console.log("ret :>> ", ret);

  return ret;
};

const getDiagnosisDisplay = database.withConnection(async function (conn, binds) {
  let result = await diagnosisQuerySQLExecutor(conn, binds);
  return result;
});

module.exports = {
  getDiagnosisDisplay
};
