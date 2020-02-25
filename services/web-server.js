/*
 * @Author: Lingyu
 * @Date: unknown
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-25 12:55:36
 */
const express = require("express");
const timeout = require("connect-timeout");
const webServerConfig = require("../config/web-server-config.js");
const rootRouter = require("./router");

const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
var httpServer;

const bodyParser = require("body-parser");

const app = express();
const users = require("../config/users").items;
const ipListPath = path.join(__dirname, "../config/ipList.txt");

const findUser = (name, password) => {
  return users.find(item => {
    return item.name === name && item.password === password;
  });
};

var currentAddress;
var ipWhiteList = webServerConfig.ipWhiteList;

function initialize() {
  return new Promise((resolve, reject) => {
    // log only 4xx and 5xx responses to console
    app.use(
      morgan("dev", {
        skip: function(req, res) {
          return res.statusCode < 400;
        }
      })
    );
    // log all requests to access.log
    var accessLogStream = fs.createWriteStream(
      path.join(__dirname, "access.log"),
      { flags: "a" }
    );
    app.use(morgan("common", { stream: accessLogStream }));

    // Middleware
    app.use(cors());
    app.use(timeout("30s"));
    app.use(express.json());
    // note the use of haltOnTimedout after every middleware;
    // it will stop the request flow on a timeout
    app.use(haltOnTimedout);

    app.use(bodyParser.urlencoded({ extended: false }));

    app.get("/login", function(req, res) {
      console.log("reaching /login");
      res.sendFile(path.join(__dirname, "/login.html"));
    });

    app.post("/logout", function(req, res) {
      console.log("reaching /logout");
      res.sendFile(path.join(__dirname, "/logout.html"));
    });

    app.post("/login", function(req, res, next) {
      console.log("req.body :", req.body);
      var user = findUser(req.body.name, req.body.password);
      if (user) {
        if (currentAddress && !ipWhiteList.includes(currentAddress)) {
          ipWhiteList.push(currentAddress);
          console.log("ipWhiteList updated:", ipWhiteList);
          fs.appendFile(ipListPath, "\n" + currentAddress, function(err) {
            if (err) throw err;
            console.log("Saved currentAddress: ", currentAddress);
            res.redirect("/api");
          });
        } else {
          res.redirect("/api");
        }
      } else {
        res.redirect("/login");
      }
    });

    app.use(function(req, res, next) {
      //verify Ip Logic
      currentAddress = req.connection.remoteAddress;
      console.log("currentAddress :", currentAddress);

      if (!ipWhiteList.includes(req.connection.remoteAddress)) {
        console.log("to login");
        res.redirect("/login");
      }
      next();
    });

    // Mount the router at /api so all its routes start with /api
    app.use("/api", rootRouter);
    app.use(haltOnTimedout);

    // all other go to /login
    app.get("*", function(req, res) {
      res.redirect("/login");
    });

    function haltOnTimedout(req, res, next) {
      if (!req.timedout) {
        next();
      } else {
        res.send("Timeout. > 30s");
      }
    }

    httpServer = app.listen(webServerConfig.port);

    httpServer.on("listening", () => {
      console.log(`Web server listening on localhost:${webServerConfig.port}`);
      resolve();
    });
    httpServer.on("error", err => {
      reject(err);
    });
  });
}

function close() {
  return new Promise((resolve, reject) => {
    httpServer.close(err => {
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
