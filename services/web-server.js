const express = require('express');
const webServerConfig = require('../config/web-server-config.js');
const rootRouter = require('./router');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs')
const path = require("path");
var httpServer;

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();

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
      } else{
        next();
      }
    });

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
