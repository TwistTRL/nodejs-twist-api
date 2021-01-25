const { insertCensusCache, deleteExpiredCensusCache } = require("./cache/census-cache");
const { getAdtCensus } = require("../db_apis/census/get-census-from-adt");

const schedule = require("node-schedule");

const initialize = async () => {
  const startTime = new Date(Date.now() + 10 * 1000); // start after 10 sec

  // every 3 minutes
  const updateCensusSchedule = schedule.scheduleJob({ start: startTime, rule: "*/3 * * * *" }, async () => {
    const dtunix = parseInt(Math.floor(Date.now() / 1000 / 60 / 3) * 60 * 3); // in 3 minutes
    console.log(`🔄 scheduled updating census at unix time ${dtunix}`);
    console.time(`update census at ${dtunix}`);

    const current_census_data = await getAdtCensus(dtunix);
    const insertCensus = await insertCensusCache(dtunix, current_census_data);

    console.timeEnd(`update census at ${dtunix}`);
  });

  // every day at 1 am 
  const deleteExpiredCensusSchedule = schedule.scheduleJob({ start: startTime, rule: "0 1 * * *" }, async () => {
    const dtunix_now = parseInt(Date.now() / 1000 ); 
    const dtunix_expired = dtunix_now - 7 * 24 * 60 * 60; // 7 days before
    console.log(`🗑️ at unix time ${dtunix_now}, 
    scheduled to delete expired census data whose timestamp are before ${dtunix_expired}`, );
    console.time(`delete expired census at ${dtunix_now}`);

    const deleteCensus = await deleteExpiredCensusCache(dtunix_expired);
    console.timeEnd(`delete expired census at ${dtunix_now}`);

  });
};

module.exports = {
  initialize,
};
