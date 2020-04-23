/*
 * @Author: Peng 
 * @Date: 2020-04-22 22:36:55 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-23 00:01:19
 */

/**
 * replace: 1. Port, 2. test person ID, 3. API token
 */

const replace = require("replace-in-file");
const HOSTNAME = require("os").hostname();
const HOST_NAME_AND_PORT = "HOST_NAME_AND_PORT";
const toHostAndPort = HOSTNAME + ":" + process.env.HTTP_PORT;

const optionsId = {
  files: "./services/router.js",
  from: /EXAMPLE_PERSON_ID/g,
  to: process.env.TEST_PERSON_ID,
};

const options1 = {
  files: "./config/apidoc-config/apidoc.json",
  from: HOST_NAME_AND_PORT,
  to: toHostAndPort,
};
const options2 = {
  files: "./config/apidoc-config/apidoc.json",
  from: HOST_NAME_AND_PORT,
  to: toHostAndPort,
};
const options3 = {
  files: "./config/apidoc2-config/apidoc.json",
  from: HOST_NAME_AND_PORT,
  to: toHostAndPort,
};
const options4 = {
  files: "./config/apidoc2-config/apidoc.json",
  from: HOST_NAME_AND_PORT,
  to: toHostAndPort,
};

const replaceString = async (token) => {
  await replace(options1);
  await replace(options2);
  await replace(options3);
  await replace(options4);
  console.log("port replaced");

  if (process.env.TEST_PERSON_ID != null) {
    await replaceID();
  }
  if (token) {
    await replaceToken(token);
  }
};

const replaceID = async () => {
  try {
    const results = await replace(optionsId);
    if (results[0].hasChanged) {
      replaceID();
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
  console.log("ID replaced");
}

const replaceToken = async (token) => {
  const optionsToken = {
    files: "./services/router.js",
    from: /Authorization='([^']*)'/g,
    to: `Authorization='bearer ${token}'`,
  };
  try {
    const results = await replace(optionsToken);
    if (results[0].hasChanged) {
      replaceToken(token);
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
  console.log("token replaced");
}

module.exports = {
  replaceString,
};
