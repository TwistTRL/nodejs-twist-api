/*
 * @Author: Lingyu
 * @Date: unknown
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-23 23:24:47
 */
const express = require("express");
const timeout = require("connect-timeout");
const privateRouter = require("./router");
const publicRouter = require("./public-router");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const { replaceString } = require("./replace-string");
const users = require("../config/users").items;
const accessTokenSecret = process.env.TWIST_API_TOKEN_SECRET || "youraccesstokensecret";

var httpServer;
var accessToken = null;
const app = express();

const { v4: uuid } = require("uuid");

const session = require("express-session");
const redisStore = require("connect-redis")(session);
const Redis = require("ioredis");
const REDIS_PORT = 6379; // redis default port is 6379
const redis = new Redis(REDIS_PORT);

redis.on("error", (err) => {
  console.log("Redis error: ", err);
});

const findUser = (name, password) => {
  return users.find((item) => {
    return item.name === name && item.password === password;
  });
};

function initialize() {
  return new Promise((resolve, reject) => {
    // log only 4xx and 5xx responses to console
    app.use(
      morgan("dev", {
        skip: function (req, res) {
          return res.statusCode < 400;
        },
      })
    );
    // log all requests to access.log
    var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
    app.use(morgan("combined", { stream: accessLogStream }));

    // Middleware
    app.use(cors());
    app.use(timeout("45s"));
    app.use(express.json());
    // note the use of haltOnTimedout after every middleware;
    // it will stop the request flow on a timeout
    app.use(haltOnTimedout);

    app.use(bodyParser.urlencoded({ extended: false }));

    //use session
    app.use(
      session({
        genid: (req) => {
          return uuid();
        },
        store: new redisStore({ host: "localhost", port: REDIS_PORT, client: redis }),
        name: "_redis_session",
        secret: "keyboard cat", //process.env.SESSION_SECRET,
        resave: false,
        cookie: { secure: false, maxAge: 60 * 60 * 1000 }, // Set to secure:false and expire in 1 hour for demo purposes
        saveUninitialized: true,
      })
    );

    app.get("/login", function (req, res) {
      console.log("reaching /login");
      res.sendFile(path.join(__dirname, "/login.html"));
      console.log("11");
      return;
    });

    app.post("/login", async (req, res, next) => {
      console.log("req.body :", req.body);
      let user = findUser(req.body.name, req.body.password);
      let currentAddress = req.connection.remoteAddress;
      console.log("post login currentAddress :", currentAddress);

      if (user) {
        console.log("user found: ", user);
        // Generate an access token, expires in 24 hours
        accessToken = jwt.sign({ username: user.name, role: user.role }, accessTokenSecret, { expiresIn: "1d" });
        console.log("accessToken :>> ", accessToken);
        if (req.body.source === "webpage") {
          await replaceString(accessToken);

          const stringAPIdoc =
            "apidoc -e node_modules -c config/apidoc-config -i ./ -o docs/apidoc && apidoc -e node_modules -c config/apidoc2-config -i ./ -o docs/apidoc2 -t template/";

          exec(stringAPIdoc, (err, stdout, stderr) => {
            if (err) {
              // node couldn't execute the command
              res.send("APIDOC error!");
            }

            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            if (stderr) {
              console.log(`stderr: ${stderr}`);
            }

            req.session.token = accessToken;
            res.redirect("/api");
          });
        } else {
          // TODO add front-end jwt part
          console.log("signed in from front-end");
          let status = true;
          res.json({
            status,
            accessToken,
          });
        }
      } else {
        if (req.body.source === "webpage") {
          console.log("redirect to login");
          res.redirect("/login");
        } else {
          let status = false;
          res.send({ status });
        }
      }
    });

    // this route will not be check for authorization
    app.use("/api", publicRouter);

    app.use(authenticateJWT);
    // Mount the router at /api so all its routes start with /api
    app.use("/api", privateRouter);
    app.use(haltOnTimedout);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      const err = new Error("File Not Found");
      err.status = 404;
      next(err);
    });

    // error handler
    // define as the last app.use callback
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.send(err.message);
    });

    let port = process.env.HTTP_PORT || 3333;
    httpServer = app.listen(port);
    httpServer.on("listening", () => {
      console.log("~~~~~~~~~~~~~~~~~~~~");
      console.log("~~~   TWIST API  ~~~");
      console.log("~~~~~~~~~~~~~~~~~~~~");
      console.log("starting time: ", new Date().toString());
      console.log("NODE_ENV :", process.env.NODE_ENV);
      console.log(`Web server listening on localhost:${port}`);
      resolve();
    });
    httpServer.on("error", (err) => {
      reject(err);
    });
  });
}

const haltOnTimedout = (req, res, next) => {
  if (!req.timedout) {
    next();
  } else {
    res.send("Timeout. > 45s");
  }
};

// >>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>>
// middleware for authentication
// 1. from api page: session -> check session.token
// 2. from front-end: headers -> check headers.authorization
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (req.session && req.session.token) {
    // verify the token with JWT
    jwt.verify(req.session.token, accessTokenSecret, (err, user) => {
      if (err) {
        console.log('jwt err :>> ', err);
        return res.sendStatus(403);
      }
      console.log("session token verified");
      // req.user = user;
      next();
    });
  } else if (authHeader) {
    console.log("authHeader :>> ", authHeader);
    // since the authorization header has a value in the format of Bearer [JWT_TOKEN]
    const token = authHeader.split(" ")[1];

    // verify the token with JWT
    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      console.log("jwt verified");
      // req.user = user;
      next();
    });
  } else {
    console.log("no authentication");
    console.log('req.headers :>> ', req.headers);
    console.log('req.body :>> ', req.body);
    res.redirect("/login");
  }
};

// ~~~~ use as:
// app.get('/something', authenticateJWT, (req, res) => {
/** for checking role
   *     const { role } = req.user;
      if (role !== 'admin') {
          return res.sendStatus(403);
      }
  */
//   res.json(something);
// });
// <<~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~<<

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
