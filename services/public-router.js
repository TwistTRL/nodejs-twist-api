/*
 * @Author: Peng 
 * @Date: 2020-04-22 14:52:01 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-23 00:02:51
 */

const express = require("express");
const router = new express.Router();

const settingsFluid = require("../db_relation/in-out-db-relation");
const settingsMed = require("../db_relation/drug-category-relation");
const settingsMicBio = require("../db_relation/microbiology-db-relation");

/**
 * @api {get} /settings/fluid/:item Fluid Settings
 * @apiVersion 0.0.1
 * @apiName get-fluid-setting
 * @apiGroup Settings
 * @apiDescription some setting of displaying fluid charts
 * 
 * from [inoutcode.xlsx](./files/inoutcode.xlsx)
 * if `item` is empty or not valid, return all settings json
 * @apiParam {String=``,
        `EVENT_CD_DICT`,
        `SL_TO_LABEL`,
        `SL_TO_SUBCAT`,
        `SL_TO_CAT`,
        `SL_TO_CALCS`,
        `SL_ORDER_ARRAY`,
        `SL_COLOR_DICT`,
        `CAT_ARRAY`,
        `CAT_TO_SL`,
        `CAT_COLOR_DICT`,
        `CAT_CAP_TO_LOWER_MAP`,
        `CAT_ORDER_ARRAY`,
        `IN_OUT_CODES_XLSX_PATH`} item for in-out-code

 * @apiSuccessExample Success-Response:
      {
        EVENT_CD_DICT,
        SL_TO_LABEL,
        SL_TO_SUBCAT,
        SL_TO_CAT,
        SL_TO_CALCS,
        SL_ORDER_ARRAY,
        SL_COLOR_DICT,
        CAT_ARRAY,
        CAT_TO_SL,
        CAT_COLOR_DICT,
        CAT_CAP_TO_LOWER_MAP,
        CAT_ORDER_ARRAY,
        IN_OUT_CODES_XLSX_PATH
      }
 
 */
router.get("/settings/fluid/:item", (req, res) => {
    const item = req.params.item;
    if (!req || !(item in settingsFluid)) {
      res.send(settingsFluid);
    } else {
      res.send(settingsFluid[item]);
    }
  });
  
  router.get("/settings/fluid", (req, res) => {
    res.send(settingsFluid);
  });
  
  /**
   * @api {get} /settings/med/:item Med Settings
   * @apiVersion 0.0.1
   * @apiName get-med-setting
   * @apiGroup Settings
   * @apiDescription some setting of displaying med charts
   * 
   *  from [medcat.xlsx](./files/medcat.xlsx)
   * if `item` is empty or not valid, return all settings json
  
   * @apiParam {String=`DRUG_INFUSIONS_LIST`,
          `DRUG_INTERMITTENT_LIST`,
          `ORANGE_DRUG_LIST`,        
          `RXCUI_LIST`,
          `DRUG_LIST`,
          `CAT_LIST`,
          `RXCUI_BY_CAT_ORDER_DICT`,
          `RXCUI_TO_CAT_DICT`,
          `DRUG_BY_CAT_ORDER_DICT`,
          `RXCUI_TO_CAT_TITLE_DICT`,
          `DRUG_TO_CAT_TITLE_DICT`,
          `CAT_TITLE_TO_CAT_DICT`,
          `CAT_TITLE_COLOR_DICT`,
          `MORPHINE_EQUIVALENTS_DICT`,
          `MORPHINE_EQUIVALENTS_ORDER_ARRAY`,
          `MORPHINE_EQUIVALENTS_COLOR_DICT`,
          `MEDICATION_CATEGORY_STRUCTURE`,        
          `MED_CAT_XLSX_PATH`} item default `MEDICATION_CATEGORY_STRUCTURE`.
   * @apiSuccessExample Success-Response:
   *    {
          DRUG_INFUSIONS_LIST,
          DRUG_INTERMITTENT_LIST,
          ORANGE_DRUG_LIST,        
          RXCUI_LIST,
          DRUG_LIST,
          CAT_LIST,
          RXCUI_BY_CAT_ORDER_DICT,
          RXCUI_TO_CAT_DICT,
          DRUG_BY_CAT_ORDER_DICT,
          RXCUI_TO_CAT_TITLE_DICT,
          DRUG_TO_CAT_TITLE_DICT,
          CAT_TITLE_TO_CAT_DICT,
          CAT_TITLE_COLOR_DICT,
          MORPHINE_EQUIVALENTS_DICT,
          MORPHINE_EQUIVALENTS_ORDER_ARRAY,
          MORPHINE_EQUIVALENTS_COLOR_DICT,
          MEDICATION_CATEGORY_STRUCTURE,
          MED_CAT_XLSX_PATH,
        }
   */
  router.get("/settings/med/:item", (req, res) => {
    const item = req.params.item;
    if (!req || !settingsMed[item]) {
      res.send(settingsMed);
    } else {
      res.send(settingsMed[item]);
    }
  });
  
  router.get("/settings/med", (req, res) => {
    res.send(settingsMed.MEDICATION_CATEGORY_STRUCTURE);
  });
  
  /**
   * @api {get} /settings/microbiology/:item Microbiology Settings
   * @apiVersion 0.0.1
   * @apiName get-micbio-setting
   * @apiGroup Settings
   * @apiDescription some setting of displaying Microbiology charts
   * 
   * if `item` is empty or not valid, return all settings json
  
   * @apiParam {String=`SOURCE_TO_ODSTD_DICT`,
          `ODSTD_TO_SOURCE_DICT`,
          `SOURCE_ORDER_ARRAY`,        
          `ODSTD_ORDER_ARRAY`,
          `TYPE_TO_MNEMONIC_DICT`,
          `MNEMONIC_TO_TYPE_DICT`,
          `MICROBIOLOGY_CODES_XLSX_PATH`} item for microbiology section
   * @apiSuccessExample Success-Response:
   *    {
            SOURCE_TO_ODSTD_DICT,
            ODSTD_TO_SOURCE_DICT,
            SOURCE_ORDER_ARRAY,  
            ODSTD_ORDER_ARRAY,
            TYPE_TO_MNEMONIC_DICT,
            MNEMONIC_TO_TYPE_DICT,
            MICROBIOLOGY_CODES_XLSX_PATH,
        }
   */
  router.get("/settings/microbiology/:item", (req, res) => {
    const item = req.params.item;
    if (!req || !settingsMicBio[item]) {
      res.send(settingsMicBio);
    } else {
      res.send(settingsMicBio[item]);
    }
  });
  
  router.get("/settings/microbiology", (req, res) => {
    res.send(settingsMicBio);
  });

  module.exports = router;
