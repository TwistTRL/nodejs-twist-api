const express = require('express');
const webServerConfig = require('../config/web-server.js');
const rootRouter = require('./router');
var httpServer;

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();

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
