const replace = require('replace-in-file');
const options = {
  files: './services/router.js',
  from: process.env.TEST_PERSON_ID,
  to: 'EXAMPLE_PERSON_ID',
};

async function startReplacing() {
  try {
    const results = await replace(options)
    console.log('Replacement results:', results);
    console.log('results[0].hasChanged: ', results[0].hasChanged);

    if (results[0].hasChanged) {
      console.log("restart ");
      startReplacing();
    }

  }
  catch (error) {
    console.error('Error occurred:', error);
  }
}

if (process.env.TEST_PERSON_ID != null) {
  startReplacing();
}

