function splitConnectionString(rawConnectionString) {
  if (rawConnectionString) {
    let splited = rawConnectionString.split("#");
    let user = splited[0];
    splited = splited[1].split("@");
    let password = splited[0];
    let connectString = splited[1];
    return { user, password, connectString };
  }
  throw new Error('database connection user or password error!')
}

let { user, password, connectString } = splitConnectionString(
  process.env.DWTST_DB || process.env.DWTST_CONNECTION_STRING
);

let RADIOLOGY_TOKEN = process.env.RADIOLOGY_TOKEN;

module.exports = {
  user,
  password,
  connectString,
  poolMin: 10,
  poolMax: 10,
  poolIncrement: 0,
  RADIOLOGY_TOKEN,
};
