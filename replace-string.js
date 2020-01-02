const replace = require('replace-in-file');
const options = {
  files: './services/router.js',
  from: 'EXAMPLE_PERSON_ID',
  to: process.env.TEST_PERSON_ID,
};

const options1 = {
  files: './config/apidoc-config/apidoc.json',
  from: '3300',
  to: '3333',
};
const options2 = {
  files: './config/apidoc-config/apidoc.json',
  from: '3300',
  to: '3333',
};
const options3 = {
  files: './config/apidoc2-config/apidoc.json',
  from: '3300',
  to: '3333',
};
const options4 = {
  files: './config/apidoc2-config/apidoc.json',
  from: '3300',
  to: '3333',
};
const options5 = {
  files: './config/web-server-config.js',
  from: '3300',
  to: '3333',
};

async function startReplacing() {
  if (process.env.HTTP_PORT == null) {
    await replace(options1);
    await replace(options2);
    await replace(options3);
    await replace(options4);
    await replace(options5);
  }

  if (process.env.TEST_PERSON_ID != null) {
    replaceID();
  }
}

async function replaceID() {
  try {
    const results = await replace(options);
    console.log('Replacement results:', results);
    console.log('results[0].hasChanged: ', results[0].hasChanged);

    if (results[0].hasChanged) {
      console.log("restart ");
      replaceID();
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

startReplacing();