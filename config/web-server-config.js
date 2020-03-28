const fs = require('fs');
const path=require('path');
const ipListPath = path.join(__dirname, './ipList.txt');

let ipWhiteList = fs.readFileSync(ipListPath).toString().split('\n');
console.log('process.env.HTTP_PORT :', process.env.HTTP_PORT);
let port = process.env.HTTP_PORT || 3100;
console.log('port :', port);
module.exports = {
  port,
  ipWhiteList
};
