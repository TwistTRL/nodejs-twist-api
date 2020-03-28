module.exports = {
  apps : [
      {
        name: "nodejs-twist-api",
        script: "./index.js",
        watch: false,
        env: {
            "HTTP_PORT": 3100,
            "NODE_ENV": "development",
            "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        },
        env_production: {
            "HTTP_PORT": 3333,
            "NODE_ENV": "production",
            "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        }
      }
  ]
}