/*
 * @Author: Peng Zeng
 * @Date: 2020-12-30 01:44:49
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-12-30 20:36:26
 */

const SYNAPSE_SERVER = "http://10.7.46.53:7001/images/";

const fetch = require("node-fetch");
const database = require("../../services/database");
const { REACT_BASE64 } = require("./base64-example");

const GET_PERSON_NAME_SQL = `
SELECT
  PERSON_ID,
  NAME_FIRST,
  NAME_MIDDLE,
  NAME_LAST
FROM PERSON
WHERE PERSON_ID = :person_id`;

const GET_PERSON_RADIOLOGY_SQL = `
SELECT 
  CATALOG_CD, 
  DISPLAY, 
  RAD_PACS_ID, 
  REASON_FOR_EXAM, 
  COMPLETE_DT_TM_UTC, 
  COMPLETE_DT_TM_UNIX, 
  REQUEST_DT_TM_UTC 
FROM RADIOLOGY 
WHERE CATALOG_CD IN 
  (4081372,
  15593788,
  4087102,
  422260445,
  102293731,
  896730861,
  896730927,
  896731263,
  2909338,
  2909341,
  66024475,
  886152671,
  886152849,
  66024876,
  66024992,
  443851292,
  853501059,
  853501263,
  853501943,
  66025072,
  939407937,
  66038895,
  66038968,
  66039050) 
  AND PERSON_ID = :PERSON_ID
ORDER BY REQUEST_DT_TM_UTC`;

function capitaliseFirstLetterAndLowerCaseAllTheOthers(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const getPersonXrayImageList = async (person_id) => {
  const getPersonNameFromPersonId = database.withConnection(
    async (conn, person_id) =>
      await conn.execute(GET_PERSON_NAME_SQL, { person_id }).then((res) => res.rows[0])
  );

  const getPersonRadiology = database.withConnection(
    async (conn, person_id) =>
      await conn.execute(GET_PERSON_RADIOLOGY_SQL, { person_id }).then((res) => res.rows)
  );

  const person_info = await getPersonNameFromPersonId(person_id);
  const person_name =
    capitaliseFirstLetterAndLowerCaseAllTheOthers(person_info.NAME_LAST) +
    " " +
    capitaliseFirstLetterAndLowerCaseAllTheOthers(person_info.NAME_FIRST);
  console.log("person_name :>> ", person_name);

  const person_radio = await getPersonRadiology(person_id);
  const pacs_id_set = new Set();
  person_radio.forEach((element) => {
    if (!pacs_id_set.has(element.RAD_PACS_ID)) {
      pacs_id_set.add(element.RAD_PACS_ID);
    }
  });
  const pacs_id_list = [...pacs_id_set];

  console.log('process.env.SYNAPSE_API_TOKEN :>> ', process.env.SYNAPSE_API_TOKEN);

  let image_dict;
  let ret;
  await fetch(SYNAPSE_SERVER + "index", {
    headers: { Authorization: process.env.SYNAPSE_API_TOKEN },
  })
    .then((res) => res.json())
    .then((json) => (image_dict = json.image_dict));
  if (person_name in image_dict) {
    const image_pacs_id_list = Object.keys(image_dict[person_name]).filter((item) =>
      pacs_id_list.some((pacs_id) => item.includes(pacs_id))
    );
    ret = image_pacs_id_list.map((key1) => ({
      title: key1,
      children: Object.keys(image_dict[person_name][key1]).map((key2) => ({
        title: key2,
        children: image_dict[person_name][key1][key2].map((item) => ({
          title: item.image,
          id: item.id,
        })),
      })),
    }));
  }
  return ret;
};

const getXrayImageById = async (image_id) => {
  let data;
  console.log("image_id :>> ", image_id);
  if (image_id === "test") {
    return REACT_BASE64;
  }
  await fetch(SYNAPSE_SERVER + "base64/" + image_id, {
    headers: { Authorization: process.env.SYNAPSE_API_TOKEN },
  })
    .then((res) => res.text())
    .then((json) => (data = json));
  return data;
};

module.exports = {
  getPersonXrayImageList,
  getXrayImageById,
};
