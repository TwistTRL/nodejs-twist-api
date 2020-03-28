function splitConnectionString(rawConnectionString){
  let splited = rawConnectionString.split('/')
  let user = splited[0]
  splited = splited[1].split('@')
  let password = splited[0]
  let connectString = splited[1]
  return {user,password,connectString}
}

console.log('process.env.NODE_ENV :', process.env.NODE_ENV);
let {user,password,connectString} = splitConnectionString(process.env.DWTST_DB)

module.exports = {
  user,
  password,
  connectString,
  poolMin: 10,
  poolMax: 10,
  poolIncrement: 0
};
