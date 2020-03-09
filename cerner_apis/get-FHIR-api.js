/*
 * @Author: Peng 
 * @Date: 2020-03-09 16:28:13 
 * @Last Modified by: Peng
 * @Last Modified time: 2020-03-09 18:24:29
 */

const request = require("request");
const { base64data } = require("./cerner-FHIR-config");

// https://fhir.cerner.com/authorization/#construct-the-authorization-request-url
// example "Requesting Authorization on Behalf of a System"
// POST /tenants/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/protocols/oauth2/profiles/smart-v1/token HTTP/1.1
// Host: authorization.sandboxcerner.com
// Authorization: Basic YmIzMThhNjItZmE2MS00OWFlLWI2OTItN2Q5OTIxNGYwZWM3OnNlY3JldA==
// Accept: application/json
// Content-Type: application/x-www-form-urlencoded
// Content-Length: 61
// Connection: close
// grant_type=client_credentials&scope=system%2FObservation.read



const options = {
    method: 'POST',
    url: '/tenants/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/protocols/oauth2/profiles/smart-v1/token HTTP/1.1',
    headers: {
        'Host': 'authorization.sandboxcerner.com',
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic' + base64data,
        'Accept': 'application/json',
        'Content-Length': 61,
        'Connection': close
    },
    form: {
      grant_type: 'client_credentials',
      scope: 'system/Observation.read',
    }
  };
  
  request(options, function (error, response, body) {
      console.log('options :', options);
    if (error) throw new Error(error);  
    console.log(body);
  });