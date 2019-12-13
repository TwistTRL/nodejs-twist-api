
/**
 * PENG 
 * 12/11/19
 * 
 */

function isJsonString(str) {
  try {
    JSON.parse(JSON.stringify(str));
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}


module.exports = {
  isJsonString
}