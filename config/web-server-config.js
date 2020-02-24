const fs = require('fs');
const path=require('path');
const ipListPath = path.join(__dirname, './ipList.txt');

let ipWhiteList = fs.readFileSync(ipListPath).toString().split('\n');
console.log('ipWhiteList :', ipWhiteList);
let port = process.env.HTTP_PORT || 3300;
console.log('port :', port);
module.exports = {
  port,
  ipWhiteList
};
