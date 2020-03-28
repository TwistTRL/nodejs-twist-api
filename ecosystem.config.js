module.exports = {
  apps : [
      {
        name: "nodejs-twist-api",
        script: "./index.js",
        watch: true,
        env: {
            "PORT": 3100,
            "NODE_ENV": "development",
            "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        },
        env_production: {
            "PORT": 3333,
            "NODE_ENV": "production",
            "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        }
      }
  ]
}