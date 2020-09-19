/*
 * @Author: Peng
 * @Date: 2020-04-13 17:23:49
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-09-18 16:44:02
 */

const isEmpty = require("lodash.isempty");
const database = require("../services/database");
const { ODSTD_TO_SOURCE_DICT, MNEMONIC_TO_TYPE_DICT } = require("../db_relation/microbiology-db-relation");

var timeLable = 0;
const SQL_GET_MICROBIOLOGY = `
SELECT 
    ORDER_ID,
    OD_ST_D,
    ORDER_MNEMONIC,
    COLLECT_DTUNIX,
    CULTURE_START_DTUNIX,
    TASK_LOG_ID,
    TASK_DTUNIX ,
    POSITIVE_IND,
    STATUS,
    SPECIES_DESC,
    DISPLAY_LOG,
    DISPLAY_ORDER
FROM MIC_CULT_RES
WHERE PERSON_ID = :person_id
ORDER BY ORDER_ID, TASK_LOG_ID, TASK_DTUNIX
`;

const SQL_GET_MICROBIOLOGY_SENS = `
SELECT 
    ORDER_ID,
    PANEL_MEDICATION ,
    BACT,
    MIC_INTERP, 
    MIC_DILUTON,
    KB
FROM MIC_SENS
WHERE PERSON_ID = :person_id
ORDER BY ORDER_ID`;

async function micbioQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for Microbiology all time: ", SQL_GET_MICROBIOLOGY);
  console.time("getMicbio-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_MICROBIOLOGY, binds);
  console.timeEnd("getMicbio-sql" + timestampLable);
  return rawRecord.rows;
}

async function micbioSensQuerySQLExecutor(conn, binds) {
  let timestampLable = timeLable++;
  console.log("~~SQL for Microbiology all time: ", SQL_GET_MICROBIOLOGY_SENS);
  console.time("getMicbioSens-sql" + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_MICROBIOLOGY_SENS, binds);
  console.timeEnd("getMicbioSens-sql" + timestampLable);
  return rawRecord.rows;
}

const _calculateRawRecords = ({ arrMicbio, arrMicbioSens }) => {
  if (!arrMicbio || !arrMicbio.length) {
    console.log("no arrMicbio");
    return {};
  }

  let sensDict = {};
  if (arrMicbioSens) {
    arrMicbioSens.forEach((element) => {
      // let mic_interp = element.MIC_INTERP || undefined;
      // let mic_dil = element.MIC_DILUTON || undefined;
      // let kb = element.KB || undefined;

      let mic_interp = element.MIC_INTERP && element.MIC_INTERP !== " " ? element.MIC_INTERP : undefined;
      let mic_dil = element.MIC_DILUTON && element.MIC_DILUTON !== " " ? element.MIC_DILUTON : undefined;
      let kb = element.KB && element.KB !== " " ? element.KB : undefined;

      if (mic_interp || mic_dil || kb) {
        if (element.ORDER_ID in sensDict) {
          sensDict[element.ORDER_ID].drugSet.add(element.PANEL_MEDICATION);
          if (element.BACT in sensDict[element.ORDER_ID]) {
            if (element.PANEL_MEDICATION in sensDict[element.ORDER_ID][element.BACT]) {
              console.log("error micbio-sens array :", element);
            }
            sensDict[element.ORDER_ID][element.BACT][element.PANEL_MEDICATION] = {
              mic_interp,
              mic_dil,
              kb,
            };
          } else {
            sensDict[element.ORDER_ID][element.BACT] = {};
            sensDict[element.ORDER_ID][element.BACT][element.PANEL_MEDICATION] = {
              mic_interp,
              mic_dil,
              kb,
            };
          }
        } else {
          sensDict[element.ORDER_ID] = {};
          sensDict[element.ORDER_ID].drugSet = new Set([element.PANEL_MEDICATION]);
          sensDict[element.ORDER_ID][element.BACT] = {};
          sensDict[element.ORDER_ID][element.BACT][element.PANEL_MEDICATION] = {
            mic_interp,
            mic_dil,
            kb,
          };
        }
      }
    });
  }

  // sensDict = {
  //   "222122": {
  //     bact1: { drug1: [1, 2, 3], drug2: [3, 4, 5] },
  //     bact2: { drug1: [3, 4, 5] },
  //     drugSet: Set(["drug1", "drug2"]),
  //   },
  // };

  let curOrderId;
  let curTaskId;
  let curResult;
  let curSource;
  let retDict = {};
  let displayOrderDict;

  let curSpeciesDesc;

  for (let record of arrMicbio) {
    let od_st_d = record.OD_ST_D;
    let source = ODSTD_TO_SOURCE_DICT[od_st_d];
    let collect_time = record.COLLECT_DTUNIX;
    let culture_start_time = record.CULTURE_START_DTUNIX;
    let task_log_id = record.TASK_LOG_ID;
    let task_time = record.TASK_DTUNIX;
    let order_mnemonic = record.ORDER_MNEMONIC;
    let mnemonic_type = MNEMONIC_TO_TYPE_DICT[record.ORDER_MNEMONIC];
    let positive_ind = record.POSITIVE_IND;
    let status = record.STATUS;
    let species_desc = getSpeciesString(record.SPECIES_DESC);

    if (record.ORDER_ID !== curOrderId) {
      if (curResult) {
        // changing ORDER_ID, push current result to retDict
        // this mapreduce could be simplified
        if (displayOrderDict) {
          let display_log = Object.keys(displayOrderDict)
            .sort()
            .map((key) => displayOrderDict[key])
            .reduce((acc, cur) => [...acc, ...cur], []);
          curResult.tasks[curResult.tasks.length - 1].display_log = display_log;
          curResult.species_desc = curSpeciesDesc;
        }

        if (curOrderId in sensDict) {
          let y = [...sensDict[curOrderId].drugSet].sort();
          let x = Object.keys(sensDict[curOrderId])
            .filter((item) => item !== "drugSet")
            .sort();
          let data = [];
          for (let bact of x) {
            let drugForBact = [];
            for (let drug of y) {
              // console.log('bact :', bact);
              // console.log('drug :', drug);
              drugForBact.push(sensDict[curOrderId][bact][drug]);
            }
            data.push(drugForBact);
          }
          curResult.sensitivity = { x, y, data };

          // set order's species_desc as sensitivity.x[0]
          let species_desc_from_x = getSpeciesString(x[0]);
          if (curSpeciesDesc !== species_desc_from_x) {
            console.log("curSpeciesDesc :>> ", curSpeciesDesc);
            console.log("species_desc_from_x :>> ", species_desc_from_x);
          }
          curResult.species_desc = species_desc_from_x;
        }

        if (curSource in retDict) {
          retDict[curSource].push(curResult);
        } else {
          retDict[curSource] = [curResult];
        }
      }

      curOrderId = record.ORDER_ID;
      curTaskId = task_log_id;
      curSource = source;
      curResult = {};
      curResult.od_st_d = od_st_d;
      curResult.order_id = curOrderId;
      curResult.collect_time = collect_time;
      curResult.culture_start_time = culture_start_time;
      curResult.end_time = task_time; // could be changed by each task
      curResult.positive_ind = positive_ind; // 0 could be changed by each task
      curResult.tasks = [
        {
          task_log_id,
          task_time,
          order_mnemonic,
          mnemonic_type,
          positive_ind,
          status,
        },
      ];
      curSpeciesDesc = species_desc;

      if (record.DISPLAY_LOG !== "None") {
        displayOrderDict = {};
        displayOrderDict[record.DISPLAY_ORDER] = [record.DISPLAY_LOG];
      }
    } else if (curTaskId !== task_log_id) {
      let display_log = Object.keys(displayOrderDict)
        .sort()
        .map((key) => displayOrderDict[key])
        .reduce((acc, cur) => [...acc, ...cur], []);
      curResult.tasks[curResult.tasks.length - 1].display_log = display_log;

      curTaskId = task_log_id;
      curResult.end_time = task_time;
      if (positive_ind) {
        curResult.positive_ind = positive_ind; // 0 could be changed by each task
      }
      curResult.tasks.push({
        task_log_id,
        task_time,
        order_mnemonic,
        mnemonic_type,
        positive_ind,
        status,
      });

      if (record.DISPLAY_LOG !== "None") {
        displayOrderDict = {};
        displayOrderDict[record.DISPLAY_ORDER] = [record.DISPLAY_LOG];
      }
    } else {
      // curTaskId === task_log_id
      curResult.end_time = task_time;
      if (positive_ind) {
        curResult.positive_ind = positive_ind; // 0 could be changed by each task
      }

      if (record.DISPLAY_LOG !== "None") {
        if (record.DISPLAY_ORDER in displayOrderDict) {
          // since `if records are different only at `EVENT_LOG_SEQ`, keep the last one.`
          // see Microbiology API documentation
          console.log("this task_log_id has multiple display_log with the same display_order :>> ", task_log_id);
          // displayOrderDict[record.DISPLAY_ORDER].push(record.DISPLAY_LOG);
        } else {
          displayOrderDict[record.DISPLAY_ORDER] = [record.DISPLAY_LOG];
        }
      }
    }
  }

  // last one
  if (!isEmpty(curResult)) {
    // changing ORDER_ID, push current result to retDict
    if (displayOrderDict) {
      let display_log = Object.keys(displayOrderDict)
        .sort()
        .map((key) => displayOrderDict[key])
        .reduce((acc, cur) => [...acc, ...cur], []);
      curResult.tasks[curResult.tasks.length - 1].display_log = display_log;
      curResult.species_desc = curSpeciesDesc;
    }

    if (curOrderId in sensDict) {
      let y = [...sensDict[curOrderId].drugSet].sort();
      let x = Object.keys(sensDict[curOrderId])
        .filter((item) => item !== "drugSet")
        .sort();
      let data = [];
      for (let bact of x) {
        let drugForBact = [];
        for (let drug of y) {
          // console.log('bact :', bact);
          // console.log('drug :', drug);
          drugForBact.push(sensDict[curOrderId][bact][drug]);
        }
        data.push(drugForBact);
      }
      curResult.sensitivity = { x, y, data };

      // set order's species_desc as sensitivity.x[0]
      let species_desc_from_x = getSpeciesString(x[0]);
      if (curSpeciesDesc !== species_desc_from_x) {
        console.log("curSpeciesDesc :>> ", curSpeciesDesc);
        console.log("species_desc_from_x :>> ", species_desc_from_x);
      }
      curResult.species_desc = species_desc_from_x;
    }

    if (curSource in retDict) {
      retDict[curSource].push(curResult);
    } else {
      retDict[curSource] = [curResult];
    }
  }
  return retDict;
};

const getSpeciesString = (string) => {
  if (!string) {
    return undefined;
  }

  let ret = string.split(" ").filter(Boolean);
  if (!ret || ret.length === 0) {
    return undefined;
  }
  if (ret.length === 1) {
    return ret[0].slice(0, 4);
  } else {
    try {
      return ret[0][0].toUpperCase() + ". " + ret[1].slice(0, 4);
    } catch (error) {
      console.log("error :", error);
    }
    return undefined;
  }
};

const getMicbio = database.withConnection(async function (conn, binds) {
  let arrMicbio = await micbioQuerySQLExecutor(conn, binds);
  let arrMicbioSens = await micbioSensQuerySQLExecutor(conn, binds);
  let result = _calculateRawRecords({ arrMicbio, arrMicbioSens });
  return result;
});

/**
 *    
 {
    "Nares": // source name based on OD_ST_D
      [
        {
            "od_st_d": "Nares", // mouse over
            "order_id": 1111,
            "collect_time": 150000,
            "culture_start_time": 151000,
            "end_time": 152000, // the latest task_time
            "positive_ind": 1, // 1 if any task's positive_ind is 1 
            "tasks": [
                {
                    "task_log_id": 33333,
                    "task_time": 152000,
                    "order_mnemonic": "PreOp Cul", // mouse over
                    "mnemonic_type": "Bacterium", //"Bacterium": oval, "viral": square, others: hexagon 
                    "positive_ind": 1, //0: green, 1: red 
                    "status": "Prelim", // "Prelim" or "Gram": light. "Final" or "Amend" : dark
                    "species_desc": "E.cloa", // write with icon if (species_desc) 
                    "display_log": ["log1", "log2"], //sorted display_log
                },
                // ... other tasks in this order
            ],
            "sensitivity": {
              "x": ["bact1", "bact2"],
              "y": ["drug1", "drug2"],
              "data": [[[1,2,3], null], [[1,3,null],[null, null, 3]]],
            }
        },
        // ... other orders in this source
      ]
  }
  
  
 */

module.exports = {
  getMicbio,
};
