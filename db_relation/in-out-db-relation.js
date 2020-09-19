/*
 * @Author: Peng
 * @Date: 2020-01-21 10:33:57
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-18 21:21:19
 */

const {
  EVENT_CD_DICT,
  SL_TO_LABEL,
  SL_TO_SUBCAT,
  SL_TO_CAT,
  SL_TO_CALCS,
  CAT_ARRAY,
  SL_ARRAY,
  CAT_TO_SL,
  CAT_CAP_TO_LOWER_MAP,
  IVF_TO_DEXTROSE,
  IN_OUT_CODES_XLSX_PATH,
} = require("twist-xlsx");

const CAT_ORDER_ARRAY = [
  "DRAIN",
  "UOP",
  "STOOL",
  "BLOOD PRODUCT",
  "Medications",
  "Nutrition",
  "Infusions",
  "Flushes",
  "TPN",
  "Lipids",
  "EN",
  "IVF",
  "DIALYSIS",
  "ENTERAL",
  "PENROSE",
  "PROCEDURAL",
  "PIGTAIL 1",
  "PIGTAIL 2",
  "PIGTAIL 3",
  "PIGTAIL 4",
  "PIGTAIL 5",
  "OTHER",
  "PLTS",
  "PRBC",
  "OOZING",
];

let SL_ORDER_ARRAY = [];

CAT_ORDER_ARRAY.forEach((cat) => {
  if (CAT_TO_SL[cat]) {
    SL_ORDER_ARRAY = [...SL_ORDER_ARRAY, ...CAT_TO_SL[cat]];
  } else {
    SL_ORDER_ARRAY = [...SL_ORDER_ARRAY, cat];
  }
});

// console.log('SL_ORDER_ARRAY :', SL_ORDER_ARRAY);

const CAT_COLOR_DICT = {
  OOZING: "#7de1f4",
  "BLOOD PRODUCT": "#FF6F00",
  ENTERAL: "#a989d2",
  IVF: "#8dd39e",
  DRAIN: "#EB2822",
  DIALYSIS: "#a9ab28",
  UOP: "#E5C029",
  STOOL: "#B9796F",
  Infusions: "#E492E4",
  Flushes: "#86E3F5",
  TPN: "#a989d2",
  Lipids: "#f48fb1",
  EN: "purple",
  Nutrition: "green",
  Medications: "#00897b",
};

let SL_COLOR_DICT = {};
SL_ARRAY.forEach((element) => {
  if (!element) {
    return;
  }
  SL_COLOR_DICT[element] = CAT_COLOR_DICT[SL_TO_CAT[element]];
});

const SECOND_SL_COLOR_DICT = {
  "25ALB": "#FF6F00",
  "5ALB": "#FF6F00",
  STL: "#B9796F",
  BLDIn: "#EB2822",
  BLDOut: "#EB2822",
  BL1: "#EB2822",
  BL2: "#EB2822",
  BL3: "#EB2822",
  BL4: "#EB2822",
  BL5: "#EB2822",
  BL6: "#EB2822",
  CT1: "#EB2822",
  CT2: "#EB2822",
  CT3: "#EB2822",
  CT4: "#EB2822",
  CT5: "#EB2822",
  CT6: "#EB2822",
  CRYO: "#FF6F00",
  IVF: "#8dd39e",
  CRRT: "#a9ab28",
  EBL: "#a9ab28",
  EMSS: "#a989d2",
  MEDS: "#a989d2",
  "PIGTAIL 1": "#EB2822",
  "PIGTAIL 2": "#EB2822",
  "PIGTAIL 3": "#EB2822",
  "PIGTAIL 4": "#EB2822",
  "G-IN": "#EB2822",
  "G-OUT": "#EB2822",
  GJ: "#EB2822",
  IHD: "#a9ab28",
  VAC: "#EB2822",
  ILEL: "#B9796F",
  FOL: "#E5C029",
  NG: "#a989d2",
  J1: "#EB2822",
  J2: "#EB2822",
  J: "#B9796F",
  JP1: "#EB2822",
  JP2: "#EB2822",
  JP3: "#EB2822",
  JP4: "#EB2822",
  JP5: "#EB2822",
  LD1: "#EB2822",
  LD2: "#EB2822",
  LD3: "#EB2822",
  LD4: "#EB2822",
  MIX: "#B9796F",
  MF1: "#B9796F",
  MF2: "#B9796F",
  MF: "#B9796F",
  ND: "#EB2822",
  NEP: "#E5C029",
  NJ: "#EB2822",
  OG: "#EB2822",
  PRBC: "#FF6F00",
  PLTS: "#FF6F00",
  UOP: "#E5C029",
  OSTIn: "#EB2822",
  OSTOut: "#EB2822",
  OTH: "#EB2822",
  OTHIn: "#EB2822",
  GT: "#EB2822",
  PEN: "#EB2822",
  PCD: "#EB2822",
  PD: "#a9ab28",
  PDIn: "#a9ab28",
  PIG1: "#EB2822",
  PIG2: "#EB2822",
  PIG3: "#EB2822",
  PIG4: "#EB2822",
  PIG5: "#EB2822",
  PIG6: "#EB2822",
  PIG1In: "#EB2822",
  PIG2In: "#EB2822",
  PIG3In: "#EB2822",
  PIG4In: "#EB2822",
  PIG5In: "#EB2822",
  PIG6In: "#EB2822",
  PRIn: "#a989d2",
  PR: "#a989d2",
  SD: "#EB2822",
  SP: "#E5C029",
  TT: "#EB2822",
  UF: "#a9ab28",
  URET: "#E5C029",
  UROS: "#E5C029",
  WB: "#FF6F00",
  WND: "#7de1f4",
  Drips: "#E492E4",
  Infusions: "#E492E4",
  Flushes: "#86E3F5",
  TPN: "#a989d2",
  Lipids: "#f48fb1",
  EN: "purple",
  Nutrition: "green",
  Medications: "#00897b",
};

SL_COLOR_DICT = {...SECOND_SL_COLOR_DICT, ...SL_COLOR_DICT};

module.exports = {
  EVENT_CD_DICT,
  SL_TO_LABEL,
  SL_TO_SUBCAT,
  SL_TO_CAT,
  SL_TO_CALCS,
  SL_ORDER_ARRAY,
  SL_COLOR_DICT,
  SL_ARRAY,
  CAT_ARRAY,
  CAT_TO_SL,
  CAT_COLOR_DICT,
  CAT_CAP_TO_LOWER_MAP,
  CAT_ORDER_ARRAY,
  IVF_TO_DEXTROSE,
  IN_OUT_CODES_XLSX_PATH,
};
