/*
 * @Author: Peng Zeng 
 * @Date: 2020-10-22 20:57:50 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-05 15:05:29
 */

// copy of datase-config.js
// but rawConnectionString in format: user@password@connectString
function splitConnectionString(rawConnectionString) { 
  if (rawConnectionString) {
    let splited = rawConnectionString.split("@");
    let user = splited[0];
    let password = splited[1];
    let connectString = splited[2];
    return { user, password, connectString };
  }
  throw new Error('database prd connection user or password error!')
}

let { user, password, connectString } = splitConnectionString(
  process.env.DWTST_PRD_CONNECTION_STRING
);

module.exports = {
  user,
  password,
  connectString,
  poolMin: 10,
  poolMax: 10,
  poolIncrement: 0,
  poolAlias: "prd_db",
};
