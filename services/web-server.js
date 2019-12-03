const express = require('express');
const webServerConfig = require('../config/web-server-config.js');
const rootRouter = require('./router');
const cors = require('cors');
var httpServer;

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    // Middleware
    app.use(cors());
    app.use(express.json());
    // Mount the router at /api so all its routes start with /api
    app.use('/api', rootRouter);
    httpServer = app.listen(webServerConfig.port)
    
    httpServer.on('listening', () => {
        console.log(`Web server listening on localhost:${webServerConfig.port}`);
        resolve();
      })
    httpServer.on('error', err => {
        reject(err);
      });
  });
}

module.exports.initialize = initialize;

function close() {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports.close = close;
