const replace = require('replace-in-file');
const HOSTNAME = require('os').hostname();
const HOST_NAME_AND_PORT = "HOST_NAME_AND_PORT";
const toHostAndPort = HOSTNAME + ":" + process.env.HTTP_PORT;

const options = {
  files: './services/router.js',
  from: process.env.TEST_PERSON_ID,
  to: 'EXAMPLE_PERSON_ID',
};

async function replaceID() {
  try {
    const results = await replace(options)
    if (results[0].hasChanged) {
      replaceID();
    }
  }
  catch (error) {
    console.error('Error occurred:', error);
  }
}

const options1 = {
  files: "./config/apidoc-config/apidoc.json",
  from: toHostAndPort,
  to: HOST_NAME_AND_PORT
};
const options2 = {
  files: "./config/apidoc-config/apidoc.json",
  from: toHostAndPort,
  to: HOST_NAME_AND_PORT
};
const options3 = {
  files: "./config/apidoc2-config/apidoc.json",
  from: toHostAndPort,
  to: HOST_NAME_AND_PORT
};
const options4 = {
  files: "./config/apidoc2-config/apidoc.json",
  from: toHostAndPort,
  to: HOST_NAME_AND_PORT
};

async function startReplacString() {
  await replace(options1);
  await replace(options2);
  await replace(options3);
  await replace(options4);

  if (process.env.TEST_PERSON_ID != null) {
    replaceID();
  }
}

startReplacString();

