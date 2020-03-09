/*
 * @Author: Peng 
 * @Date: 2020-03-09 18:13:22 
 * @Last Modified by:   Peng 
 * @Last Modified time: 2020-03-09 18:13:22 
 */

function splitConnectionString(rawConnectionString) {
  let splited = rawConnectionString.split("/");
  let secrect = splited[0];
  let token = splited[1];

  let base64data = Buffer.from(secrect + ":" + token).toString("base64");
  console.log("base64data  :", base64data);

  return { base64data };
}

let { base64data } = splitConnectionString(process.env.FHIR_CONNECTION_STRING);

module.exports = {
  base64data
};
