/*
 * @Author: Peng 
 * @Date: 2020-03-09 18:13:22 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-04-08 10:46:12
 */

function splitConnectionString(rawConnectionString) {
  let splited = rawConnectionString.split("/");
  let client_id = splited[0];
  let client_secret = splited[1];
  let base64data = Buffer.from(client_id + ":" + client_secret).toString("base64");
  return { base64data };
}

// let { base64data } = splitConnectionString(process.env.FHIR_CONNECTION_STRING);
let base64data = "";

module.exports = {
  base64data
};
