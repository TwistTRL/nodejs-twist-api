const express = require('express');
const timeout = require('connect-timeout')
const webServerConfig = require('../config/web-server-config.js');
const rootRouter = require('./router');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs')
const path = require("path");
var httpServer;

const app = express();

function initialize() {
  return new Promise((resolve, reject) => {

    // log only 4xx and 5xx responses to console
    app.use(morgan('dev', {
      skip: function (req, res) { return res.statusCode < 400 }
    }))
    // log all requests to access.log
    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
    app.use(morgan('common', { stream: accessLogStream }));

    app.use(function(req, res, next) {
      //verify Ip Logic
      console.log("remoteAddress = ", req.connection.remoteAddress);
      // console.log("remoteAddress = ", req.connection);

      if (!webServerConfig.ipWhiteList.includes(req.connection.remoteAddress)) {
        res.send("IP ADDRESS NOT ALLOWED.");
        console.log("ip address not allowed...")
      } else{
        next();
      }
    });

    // Middleware
    app.use(cors());
    app.use(timeout('30s'));
    app.use(express.json());
    // note the use of haltOnTimedout after every middleware;
    // it will stop the request flow on a timeout
    app.use(haltOnTimedout);

    // Mount the router at /api so all its routes start with /api
    app.use('/api', rootRouter);
    app.use(haltOnTimedout);

    function haltOnTimedout (req, res, next) {
      if (!req.timedout) {
        next();
      } else {
        res.send("Timeout. > 30s");
      }
    }

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

module.exports.initialize = initialize;
module.exports.close = close;
module.exports.app = app;
