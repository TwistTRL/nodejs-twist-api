/*
 * @Author: Peng Zeng
 * @Date: 2020-12-10 20:09:00
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-10 21:38:50
 */

const { getCensusTeamData } = require("../../database_access/census/census-team");

const TEAM_DICT = {
  "Team 3": "3",
  "Team B": "B",
  "Team A": "A",
  "Team 1": "1",
  "Team 2": "2",
  "Team C": "C",
};
const getTeam = (team) =>
  TEAM_DICT[team] || team.split(" ").length === 2 ? team.split(" ")[1] : team;

async function getCensusTeam(binds) {
  const { timestamp } = binds;
  if (!timestamp) {
    // now
    timestamp = Math.floor(Date.now() / 1000);
  }
  const censusTeamData = await getCensusTeamData(binds);
  return censusTeamData.map((item) => ({
    team: getTeam(item.NAME_PERSONNEL),
    start_unix: item.START_UNIX,
    end_unix: item.END_UNIX,
  }));
}

module.exports = {
  getCensusTeam,
};
