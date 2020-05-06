/*
 * @Author: Peng
 * @Date: 2020-04-07 12:57:40
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-06 12:02:06
 */

const SQL_GET_PERSON_ID = (mrn) => `
SELECT
    DISTINCT PERSON_ID
FROM CHB_MRN
WHERE MRN = '${mrn}'`;

// TPN_LIPID
const SQL_GET_TPN_LIPID = ({ person_id, from, to }) => `
SELECT
    DT_UNIX,
    RESULT_VAL
FROM TPN_LIPID
WHERE PERSON_ID = ${person_id}
AND DT_UNIX <= ${to} AND DT_UNIX >= ${from}
ORDER BY DT_UNIX`;

// TPN
const SQL_GET_TPN = ({ person_id, from, to }) => `
SELECT  
    START_UNIX,
    END_UNIX, 
    RESULT_VAL,
    "Dextrose PN",
    "Amino Acid PN",
    "Selenium PN",
    "Potassium PN",
    "Calcium PN",
    "Magnesium PN",
    "Phosphorus PN",
    "Heparin PN",
    "Ranitidine PN",
    "Extra Phytonadione PN",
    "Sodium PN",
    "Vitamin PN",
    "Carnitine PN"
FROM TPN
WHERE PERSON_ID = ${person_id}
AND START_UNIX <= ${to} AND END_UNIX >= ${from}
ORDER BY START_UNIX`;

// EN
const SQL_GET_EN = ({ person_id, from, to }) => `
SELECT  
    START_TIME_UNIX,
    "VOLUME",
    "DISPLAY_LINE",
    UNIT,
    CAL_DEN,
    G_PTN_ROW,
    G_FAT_ROW,
    G_CHO_ROW
FROM EN
WHERE PERSON_ID = ${person_id}
AND START_TIME_UNIX <= ${to}
AND START_TIME_UNIX >= ${from}
ORDER BY START_TIME_UNIX`;

// INTAKE_OUTPUT
const SQL_GET_IN_OUT_EVENT = ({ person_id, from, to }) => `
SELECT  
    DT_UNIX,
    EVENT_CD,
    VALUE
FROM INTAKE_OUTPUT
WHERE PERSON_ID = ${person_id}
AND DT_UNIX <= ${to} AND DT_UNIX >= ${from}
ORDER BY DT_UNIX
`;

// DRUG_DILUENTS
const SQL_GET_DILUENTS = ({ person_id, from, to }) => `
SELECT  
    START_UNIX,
    END_UNIX,
    DRUG,
    DILUENT,
    CONC,
    STRENGTH_UNIT,
    VOL_UNIT,
    INFUSION_RATE,
    INFUSION_RATE_UNITS,
    DOSING_WEIGHT
FROM DRUG_DILUENTS
WHERE PERSON_ID = ${person_id}
AND START_UNIX < ${to}
AND END_UNIX > ${from}
ORDER BY START_UNIX`;

// DRUG_INFUSIONS
const SQL_INFUSIONS = ({ person_id }) => `
SELECT 
    START_UNIX,
    END_UNIX,
    DRUG,
    RXCUI,
    INFUSION_RATE,
    INFUSION_RATE_UNITS
FROM DRUG_INFUSIONS
WHERE PERSON_ID = ${person_id}
ORDER BY START_UNIX, DRUG`;

const SQL_INFUSIONS_UNIT = ({ person_id }) => `
SELECT
    DISTINCT DRUG,
    INFUSION_RATE_UNITS
FROM DRUG_INFUSIONS
WHERE PERSON_ID = ${person_id}
ORDER BY DRUG`;

//DRUG_INTERMITTENT
const SQL_INTERMITTENT = ({ person_id }) => `
SELECT 
    DT_UNIX,
    DRUG,
    RXCUI,
    ADMIN_DOSAGE,
    ADMIN_ROUTE,
    DOSAGE_UNITS,
    INFUSED_VOLUME,
    VOLUME_UNITS
FROM DRUG_INTERMITTENT
WHERE PERSON_ID = ${person_id}
AND RXCUI IS NOT NULL
ORDER BY DT_UNIX, DRUG`;

// SUCTION
const SQL_SUCTION = ({ person_id }) => `
SELECT
    DATETIMEUTC,
    LVL,
    COMMENT_TXT,
    SUCTION_DEVICE,
    SUCTION_INSTILLATION,
    SUCTION_PRE_MEDICATION,
    SUCTION_PRE_OXYGENATION,
    SUCTION_TYPE,
    TRACH_SUCTION_CATHETER_SIZE,
    TRACH_SUCTION_DEPTH
FROM SUCTION
WHERE PERSON_ID = ${person_id}
ORDER BY DATETIMEUTC`;

const SQL_GET_WEIGHT = ({ person_id }) => `
SELECT
    DT_UNIX,
    WEIGHT_CALC
FROM WEIGHTS_CALCS
WHERE PERSON_ID = ${person_id}
ORDER BY DT_UNIX`;

const SQL_GET_EXACT_WEIGHT = ({ person_id }) => `
SELECT
    DT_UNIX,
    WEIGHT
FROM WEIGHTS
WHERE PERSON_ID = ${person_id}
ORDER BY DT_UNIX`;

module.exports = {
  SQL_GET_PERSON_ID,
  SQL_GET_DILUENTS,
  SQL_GET_EN,
  SQL_GET_IN_OUT_EVENT,
  SQL_GET_TPN,
  SQL_GET_TPN_LIPID,

  SQL_INFUSIONS,
  SQL_INFUSIONS_UNIT,
  SQL_INTERMITTENT,
  SQL_SUCTION,
  SQL_GET_WEIGHT,
  SQL_GET_EXACT_WEIGHT,
};
