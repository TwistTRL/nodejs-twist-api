module.exports = {
  apps : [
      {
        name: "nodejs-twist-api",
        cwd: "/home/nodejs/api/nodejs-twist-api",
        script: "./index.js",
        watch: false,
        env: {
            "HTTP_PORT": process.env.HTTP_PORT,
            "NODE_ENV": "development",
            "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        },
        env_stage: {
          "HTTP_PORT": process.env.HTTP_PORT,
          "NODE_ENV": "stage",
          "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        },
        env_production: {
            "HTTP_PORT": process.env.HTTP_PORT,
            "NODE_ENV": "production",
            "DWTST_DB":process.env.DWTST_CONNECTION_STRING
        }
      }
  ]
}