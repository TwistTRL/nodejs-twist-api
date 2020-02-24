/*
 * @Author: Lingyu
 * @Date: unknown
 * @Last Modified by: Peng
 * @Last Modified time: 2020-02-24 12:03:54
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

const app = express();
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const identityKey = "skey";
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

    app.use(
      session({
        name: identityKey,
        secret: "twist", // 用来对session id相关的cookie进行签名
        store: new FileStore(), // 本地存储session（文本文件，也可以选择其他store，比如redis的）
        saveUninitialized: false, // 是否自动保存未初始化的会话，建议false
        resave: false, // 是否每次都重新保存会话，建议false
        cookie: {
          maxAge: 30 * 1000 // 有效期，单位是毫秒
        }
      })
    );

    app.get("/login", function(req, res) {
      console.log("reaching /login");
      res.sendFile(path.join(__dirname, "/login.html"));
    });

    app.post("/login", function(req, res, next) {
      console.log("req.body :", req.body);
      var user = findUser(req.body.name, req.body.password);
      console.log("user logged in:", user);
      if (user) {
        req.session.regenerate(function(err) {
          if (err) {
            return res.json({ ret_code: 2, ret_msg: "login falied" });
          }
          req.session.loginUser = user.name;
          if (currentAddress && !ipWhiteList.includes(currentAddress)) {
            ipWhiteList.push(currentAddress);
            console.log("ipWhiteList updated:", ipWhiteList);
            fs.appendFile(ipListPath, "\n" + currentAddress, function(err) {
              if (err) throw err;
              console.log("Saved currentAddress: ", currentAddress);
            });
          }
          console.log("go to api apge");
          res.redirect("/");
        });
      } else {
        console.log("user login error");
        res.redirect("/");
      }
    });

    app.post("/logout", function(req, res, next) {
      // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
      // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
      // 然后去查找对应的 session 文件，报错
      // session-file-store 本身的bug

      if (req.session && req.session.loginUser) {
        req.session.destroy(function(err) {
          if (err) {
            res.json({ ret_code: 2, ret_msg: "logout failed" });
            return;
          }
          req.session.loginUser = null;
          res.clearCookie(identityKey);
          res.redirect("/login");
        });
      } else {
        res.redirect("/");
      }
    });

    app.get("/", function(req, res, next) {
      console.log("reaching /");
      let loginUser = req.session.loginUser;
      if (!loginUser) {
        console.log("not logged in");
        res.redirect("/login");
      } else {
        console.log(`${loginUser} is logged in, go to logout page`);
        res.redirect("/logout");
      }
    });

    app.get("/logout", function(req, res) {
      console.log("reaching /logout");
      res.send("llll");

      // res.sendFile(path.join(__dirname + "/logout.html"));
    });
    
    app.use(function(req, res, next) {
      //verify Ip Logic
      currentAddress = req.connection.remoteAddress;
      console.log("currentAddress :", currentAddress);
      // console.log("remoteAddress = ", req.connection);

      if (!ipWhiteList.includes(req.connection.remoteAddress)) {
        console.log("to login");
        res.redirect("/login");
      } else {
        next();
      }
    });

    // Mount the router at /api so all its routes start with /api
    app.use("/api", rootRouter);
    app.use(haltOnTimedout);

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
