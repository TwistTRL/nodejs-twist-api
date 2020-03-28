const fs = require('fs');
const path = require('path');
const ipListPath = path.join(__dirname, './ipList.txt');

let ipWhiteList = fs.readFileSync(ipListPath).toString().split('\n');

console.log("~~~~~~~~~~~~~~~~~~~~");
console.log("~~~   TWIST API  ~~~");
console.log("~~~~~~~~~~~~~~~~~~~~");
console.log("starting time: ", new Date().toString());
console.log("NODE_ENV :", process.env.NODE_ENV);
console.log('HTTP_PORT :', process.env.HTTP_PORT);
let port = process.env.HTTP_PORT;
module.exports = {
  port,
  ipWhiteList
};
