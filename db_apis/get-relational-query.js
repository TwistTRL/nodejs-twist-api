const database = require("../services/database");
const sqlBuilder = require("../services/relational-query-sql-builder");

async function relationalQuerySQLExecutor(conn,query){
  let ret = {};
  let querySQL = "";
  try {
    querySQL =  sqlBuilder.buildSQL(query);
  } catch (e) {
    console.log(new Date());
    console.log(e);
    return e.toString();
  }
  for (let [entity,[sql,binds]] of Object.entries(querySQL)) {
    console.log("\nEntity:\n", entity);
    console.log("SQL:\n", sql);
    console.log("binds:\n", binds);

    let t = Date.now();
    let res = await conn.execute(sql,binds).then( res=>res.rows );
    ret[entity] = res;
  }
  return ret;
}

const getRelationalQuery = database.withConnection(async function(conn,query){
  let relationalTables = await relationalQuerySQLExecutor(conn,query);
  return relationalTables;
});

module.exports = {
  getRelationalQuery
};
