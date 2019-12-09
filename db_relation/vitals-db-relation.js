
/**
 * VITALS DATABASE RELATIONS
 * 
 * PENG 
 * 12/6/19
 * 
 */

/**
 * 
 * @param {*} dictResult 
 * { '1': [ 0, 30 ],
  '2': [ 30, 40 ],
  '3': [ 40, 50 ],
  '4': [ 50, 60 ],
  '5': [ 60, 70 ],
  '6': [ 70, 80 ],
  '7': [ 80, 90 ],
  '8': [ 90, 100 ],
  '9': [ 100, 110 ],
  '10': [ 110, 120 ],
  '11': [ 120, 130 ],
  '12': [ 130, 140 ],
  '13': [ 140, 150 ],
  '14': [ 150, 160 ],
  '15': [ 160, 170 ],
  '16': [ 170, 180 ],
  '17': [ 180, 190 ],
  '18': [ 190, 200 ],
  '19': [ 200, 210 ],
  '20': [ 210, 220 ],
  '21': [ 220, 230 ],
  '22': [ 230, 240 ],
  '23': [ 240, 250 ],
  '24': [ 250, 260 ],
  '25': [ 260, 270 ],
  '26': [ 270, 280 ],
  '27': [ 280, 290 ],
  '28': [ 290, null ] }

 * 
 * @param {*} START_TM 
 * @param {*} END_TM 
 */
function getSingleResult(dictResult, START_TM, END_TM) {
  let binDict = {};
  for (var key in dictResult) {
    binDict[key] = 0;
  }

  binDict["from"] = START_TM*1;
  binDict["to"] = END_TM*1;
  binDict["time"] = START_TM/2 + END_TM/2;

  return binDict;
}


function getSingleRawResult() {
  return {"value":null, "time":null};
}

module.exports = {
  getSingleResult,
  getSingleRawResult
}