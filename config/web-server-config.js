const fs = require('fs');
const path = require('path');
const ipListPath = path.join(__dirname, './ipList.txt');

module.exports = {
  port: process.env.HTTP_PORT,
  ipWhiteList: fs.readFileSync(ipListPath).toString().split('\n')
};
