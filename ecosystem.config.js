const DEV_PORT = 3100;
const STA_PORT = 3300;
const PROD_PORT = 3333;

module.exports = {
  apps : [
      {
        name: "nodejs-twist-api",
        script: "./index.js",
        watch: false,
        env: {
            "DEV_PORT": DEV_PORT,
            "HTTP_PORT": DEV_PORT,
            "NODE_ENV": "development",
            "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        },
        env_stage: {
          "DEV_PORT": DEV_PORT,
          "HTTP_PORT": STA_PORT,
          "NODE_ENV": "stage",
          "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        },
        env_production: {
            "DEV_PORT": DEV_PORT,
            "HTTP_PORT": PROD_PORT,
            "NODE_ENV": "production",
            "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        }
      }
  ]
}