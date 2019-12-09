
/**
 * CONFIG HR CALC
 * 
 * PENG 
 * 12/5/19
 * 
 */


function getSingleHrCALCResult(hrRecord) {
  return {
    "perc0":hrRecord.VAL_MIN,
    "perc1":hrRecord.VAL_PERC1,
    "perc5":hrRecord.VAL_PERC5,
    "perc25":hrRecord.VAL_PERC25,
    "perc50":hrRecord.VAL_PERC50,
    "perc75":hrRecord.VAL_PERC75,
    "perc95":hrRecord.VAL_PERC95,
    "perc99":hrRecord.VAL_PERC99,
    "perc100":hrRecord.VAL_MAX,
    "mean":hrRecord.VAL_MEAN,
    "time":(hrRecord.START_TM*1+hrRecord.END_TM*1)/2
  };
}


module.exports = {
  getSingleHrCALCResult
}