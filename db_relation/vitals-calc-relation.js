
/**
 * CONFIG HR CALC
 * 
 * PENG 
 * 12/11/19
 * 
 */


function getSingleVitalCALCResult(vitalRecord) {
  return {
    "perc0":vitalRecord.VAL_MIN,
    "perc1":vitalRecord.VAL_PERC1,
    "perc5":vitalRecord.VAL_PERC5,
    "perc25":vitalRecord.VAL_PERC25,
    "perc50":vitalRecord.VAL_PERC50,
    "perc75":vitalRecord.VAL_PERC75,
    "perc95":vitalRecord.VAL_PERC95,
    "perc99":vitalRecord.VAL_PERC99,
    "perc100":vitalRecord.VAL_MAX,
    "mean":vitalRecord.VAL_MEAN,
    "time":(vitalRecord.START_TM*1+vitalRecord.END_TM*1)/2
  };
}


module.exports = {
  getSingleVitalCALCResult
}