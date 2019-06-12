module.exports = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTIONSTRING,
  poolMin: 10,
  poolMax: 10,
  poolIncrement: 0
};
