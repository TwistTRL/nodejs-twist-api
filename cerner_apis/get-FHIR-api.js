/*
 * @Author: Peng
 * @Date: 2020-03-09 16:28:13
 * @Last Modified by: Peng
 * @Last Modified time: 2020-03-12 12:47:36
 */

const fetch = require("node-fetch");
const { base64data } = require("./cerner-FHIR-config");
const TOKEN_URL_1 =
  "https://authorization.sandboxcerner.com/tenants/96976f07-eccb-424c-9825-e0d0b887148b/protocols/oauth2/profiles/smart-v1/token";
const TOKEN_URL_2 =
  "https://authorization.sandboxcerner.com/tenants/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/protocols/oauth2/profiles/smart-v1/token";

const method = "post";
const body =
  "grant_type=client_credentials&scope=system/Patient.read system/Encounter.read system/DocumentReference.read system/Binary.read system/DiagnosticReport.read";
const headers = {
  Host: "authorization.sandboxcerner.com",
  "content-type": "application/x-www-form-urlencoded",
  Authorization: "Basic " + base64data,
  Accept: "application/json",
  "Content-Length": 61,
  Connection: "close"
};

var token;
var tokenExpired = true;
var DOCUMENTREFERENCE_URL;

async function getAccessToken() {
  let response = await fetch(TOKEN_URL_1, {
    method,
    body,
    headers
  });
  let json = await response.json();
  token = json.access_token;
  console.log("token :", token);
  return json;
}

const MRN_URL =
  "https://fhir-ehr.sandboxcerner.com/r4/96976f07-eccb-424c-9825-e0d0b887148b/Patient?identifier=urn:oid:2.16.840.1.113883.3.23.1|";

getPDFUrl = async mrn => {
  console.time("get-pdf-from-mrn-total");
  console.log("getPDFUrl.. mrn :", mrn);
  if (tokenExpired) {
    console.time("get-token");
    let response = await fetch(TOKEN_URL_1, {
      method,
      body,
      headers
    });
    let json = await response.json();
    token = json.access_token;
    console.timeEnd("get-token");
    console.log("token :", token);
  }

  tokenHeaders = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  console.time("get-personId");
  let mrnRes = await fetch(MRN_URL + mrn, { headers: tokenHeaders });
  let mrnJson = await mrnRes.json();
  console.timeEnd("get-personId");
  // console.log("mrnJson :", mrnJson);
  if (!mrnJson || !mrnJson["entry"] || !mrnJson["entry"].length) {
    console.log("mrn res error");
    return null;
  }

  let personId = mrnJson["entry"][0]["resource"]["id"];
  let ENCOUNTER_URL =
    "https://fhir-ehr.sandboxcerner.com/r4/96976f07-eccb-424c-9825-e0d0b887148b/Encounter?patient=" +
    personId +
    "&_count=10000";

  DOCUMENTREFERENCE_URL =
    "https://fhir-ehr.sandboxcerner.com/r4/96976f07-eccb-424c-9825-e0d0b887148b/DocumentReference?patient=" +
    personId +
    "&encounter=";

  console.time("get-encounters");
  let encounterRes = await fetch(ENCOUNTER_URL, { headers: tokenHeaders });
  let encounterJson = await encounterRes.json();
  // console.log("encounterJson :", encounterJson);

  if (
    !encounterJson ||
    !encounterJson["entry"] ||
    !encounterJson["entry"].length
  ) {
    console.log("encounter res error");
    return null;
  }

  let encounterList = encounterJson["entry"].map(
    item => item["resource"]["id"]
  );

  // console.log("init encounterList :", encounterList);
  encounterList = await getNextEncounters(encounterJson, encounterList);
  console.timeEnd("get-encounters");
  console.log("~~ getting all encounter, encounterList :", encounterList);

  console.time("get-docs");
  let documentList = await Promise.all(encounterList.map(getDocsFromEncounter));
  console.timeEnd("get-docs");
  // console.log(' documentList :',  documentList);

  let result = [];
  let docIdDic = {};
  documentList.forEach(element => {
    element.forEach(item => {
      if (!(item.id in docIdDic)) {
        result.push(item);
        docIdDic[item.id] = item;
      }
    });
  });
  console.log('total pdf file size is :', result.length);
  console.timeEnd("get-pdf-from-mrn-total");
  return result;
};

const getNextPageUrl = arr => {
  for (const item of arr) {
    if (item["relation"] === "next") {
      return item["url"];
    }
  }
  console.log("(no next page url) arr :", arr);
  return null;
};

const getNextEncounters = async (curPageEncouterJson, encounterList) => {
  let nextPageUrl = getNextPageUrl(curPageEncouterJson["link"]);
  if (!nextPageUrl) {
    return encounterList;
  }
  let nextEncounterRes = await fetch(nextPageUrl, { headers: tokenHeaders });
  let nextEncounterJson = await nextEncounterRes.json();
  if (
    !nextEncounterJson ||
    !nextEncounterJson["entry"] ||
    !nextEncounterJson["entry"].length
  ) {
    console.log("nextEncounterJson res error");
    return encounterList;
  }
  let isLastPage = true;
  nextEncounterJson["entry"].forEach(item => {
    let itemId = item["resource"]["id"];
    if (!encounterList.includes(itemId)) {
      encounterList.push(itemId);
      console.log("itemId :", itemId);
      isLastPage = false;
    }
  });
  if (isLastPage) {
    return encounterList;
  } else {
    return await getNextEncounters(nextEncounterJson, encounterList);
  }
};

const getDocsFromEncounter = async encounter => {
  let docRes = await fetch(DOCUMENTREFERENCE_URL + encounter, {
    headers: tokenHeaders
  });
  let docJson = await docRes.json();
  let docsForEncounter = [];

  if (docJson && docJson["entry"] && docJson["entry"].length) {
    docJson["entry"].forEach(singleDoc => {
      if (
        singleDoc["resource"] &&
        singleDoc["resource"]["content"] &&
        singleDoc["resource"]["content"].length
      ) {
        singleDoc["resource"]["content"].forEach(content => {
          if (
            content["attachment"] &&
            content["attachment"]["contentType"] === "application/pdf"
          ) {
            let id = singleDoc["resource"]["id"];
            let url = content["attachment"]["url"];
            let time = dateToUnix(content["attachment"]["creation"]);
            let title = content["attachment"]["title"];
            let lastUpdated = dateToUnix(
              singleDoc["resource"]["meta"]["lastUpdated"]
            );
            docsForEncounter.push({ id, url, time, title, lastUpdated });
          }
        });
      }
    });
  }
  return docsForEncounter;
};

const dateToUnix = dateString =>
  Math.round(new Date(dateString).getTime() / 1000) || dateString;

module.exports = {
  getAccessToken,
  getPDFUrl
};
