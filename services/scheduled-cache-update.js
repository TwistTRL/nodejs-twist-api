const { insertCensusCache } = require("./cache/census-cache");
const { getAdtCensus } = require("../db_apis/census/get-census-from-adt");

const schedule = require("node-schedule");

const initialize = async () => {
  const startTime = new Date(Date.now() + 10 * 1000); // start after 10 sec

  const j = schedule.scheduleJob({ start: startTime, rule: "*/5 * * * *" }, async () => {
    const dtunix = parseInt(Math.floor(Date.now() / 1000 / 60 / 5) * 60 * 5); // in 5 minutes
    console.log('scheduled updating census at unix time :>> ', dtunix);
    console.time(`update census at ${dtunix}`);

    const current_census_data = await getAdtCensus(dtunix);

    const insertCensus = await insertCensusCache(dtunix, current_census_data);

    console.timeEnd(`update census at ${dtunix}`);
  });
};

module.exports = {
  initialize,
};
