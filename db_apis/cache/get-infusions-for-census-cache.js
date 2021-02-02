const database = require("../../services/database");

const GET_ADT_CENSUS_INFUSIONS_SQL = `
SELECT
  DTUNIX, PERSON_ID, TIME_TYPE, DRUG, END_UNIX, INFUSION_RATE, INFUSION_RATE_UNITS, RXCUI
FROM API_CACHE_CENSUS_INFUSION
WHERE TIME_TYPE= 8
  AND DTUNIX = (SELECT DISTINCT(DTUNIX) FROM API_CACHE_CENSUS ORDER BY DTUNIX DESC FETCH FIRST 1 ROW ONLY)
`;

const getAdtCensusInfusionsCache = async (timestamp) => {
  const getData = database.withConnection(
    async (conn) =>
      await conn.execute(GET_ADT_CENSUS_INFUSIONS_SQL).then((res) => res.rows)
  );

  const infusionsData = await getData();
  // console.log('xrayData :>> ', xrayData);

  const personWithInfusionsDict = {};

  infusionsData.forEach((element) => {
    const person_id = element.PERSON_ID;
    if (person_id in personWithInfusionsDict) {
      personWithInfusionsDict[person_id].push(element);
    } else {
      personWithInfusionsDict[person_id] = [element];
    }
  });

  return personWithInfusionsDict;
};

module.exports = {
  getAdtCensusInfusionsCache,
};
