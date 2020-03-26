/*
 * @Author: Peng 
 * @Date: 2020-02-12 12:04:55 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-03-26 12:40:59
 */

const database = require("../services/database");
var timeLable = 0;
const SQL_GET_WEIGHT_PART1 = `
SELECT
  DT_UNIX,
  WEIGHT
FROM WEIGHTS
WHERE PERSON_ID = `
const SQL_GET_WEIGHT_PART2 = ` 
ORDER BY DT_UNIX`

const SQL_GET_WEIGHT_CALC_PART1 = `
SELECT
  DT_UNIX,
  WEIGHT_CALC
FROM WEIGHTS_CALCS
WHERE PERSON_ID = `

async function weightQuerySQLExecutor(conn, person_id) {
  let timestampLable = timeLable++;
  let SQL_GET_WEIGHT = SQL_GET_WEIGHT_PART1 + person_id + SQL_GET_WEIGHT_PART2;
  console.log("~~SQL for get weight: ", SQL_GET_WEIGHT);
  console.time('getWeight-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_WEIGHT);
  console.timeEnd('getWeight-sql' + timestampLable);
  return rawRecord.rows;
}

async function weightCalcQuerySQLExecutor(conn, person_id) {
  let timestampLable = timeLable++;
  let SQL_GET_WEIGHT_CALC = SQL_GET_WEIGHT_CALC_PART1 + person_id + SQL_GET_WEIGHT_PART2;
  console.log("~~SQL for get weight: ", SQL_GET_WEIGHT_CALC);
  console.time('getWeightCalc-sql' + timestampLable);
  let rawRecord = await conn.execute(SQL_GET_WEIGHT_CALC);
  console.timeEnd('getWeightCalc-sql' + timestampLable);

  console.log('rawRecord.rows :', rawRecord.rows);

  let ret = [];
  rawRecord.rows.forEach(element => {
    if (element["WEIGHT_CALC"]) {
      ret.push(element);
    }
  });
  return ret;
}

function getWeightOnTime(timestamp, weightArray) {
  let timeArr = weightArray.map(item => item.DT_UNIX);
  let index = getBinarySearchNearest(timestamp, timeArr);
  let roundWeight = Math.round((weightArray[index].WEIGHT + Number.EPSILON) * 1000) / 1000;
  return roundWeight;
}

function getBinarySearchNearest(num, arr) {
  console.log('num :', num);
  if(!arr || !arr.length){
    return null;
  }

  if(arr.length == 1) {
    return 0;
  }

  let mid = Math.floor((arr.length - 1) / 2);
  if (arr[mid] == num){
    return mid;
  } else if (arr[mid] > num) {
    return getBinarySearchNearest(num, arr.slice(0, mid+1));
  } else {
    return getBinarySearchNearest(num, arr.slice(mid+1)) + mid+1;
  }
}

const getWeight = database.withConnection(weightQuerySQLExecutor);
const getWeightCalc = database.withConnection(weightCalcQuerySQLExecutor);

module.exports = {
  getWeight,
  getWeightCalc
};

