
/**
 * CONFIG HR BINS
 * 
 * PENG 
 * 12/4/19
 * 
 */


function getSingleHrResult(START_TM, END_TM) {
  var binDict = {"0-30":0}; 

  for (var i = 1; i < 27; i++) {
    binDict[(i+2)*10 + "-" + (i+3)*10] = 0;
  }

  binDict["290"] = 0;
  binDict["from"] = START_TM*1;
  binDict["to"] = END_TM*1;
  binDict["time"] = START_TM/2 + END_TM/2;

  return binDict;
}

function getBinString(binID) {
  var binString;
  if (binID < 1 || binID > 29) {
    binString = "INVALID";
  }
  switch (binID) {
    case 1:
      binString =  "0-30";
      break;
    case 27:
      binString = "290";
      break;
    default:
      binString = (binID*1+2)*10 + "-" + (binID*1+3)*10;
      break;      
  }
  return binString;
}


module.exports = {
  getSingleHrResult,
  getBinString
}