const replace = require('replace-in-file');
const options = {
  files: './services/router.js',
  from: 'EXAMPLE_PERSON_ID',
  to: process.env.TEST_PERSON_ID,
};

async function start() {
  try {
    const results = await replace(options)
    console.log('Replacement results:', results);
    console.log('results[0].hasChanged: ', results[0].hasChanged);

    if (results[0].hasChanged) {
      console.log("restart ");
      start();
    }

  }
  catch (error) {
    console.error('Error occurred:', error);
  }
}

start();