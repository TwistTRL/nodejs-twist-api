#!/usr/bin/env node
const express = require("");
const express = require("express");

function relationalJsonify(obj) {
  let ret = {};
  // normalize
  for (let k of Object.keys(obj)) {
    let t = ret[k] = {};
    for (let r of obj[k]) {
      let rid = r["__ID__"];
      t[rid] = {...r};
    }
  }
  // add reverse refs
  for (let [k,v] of Object.entries(ret)) {
    for (let [kk,vv] of Object.entries(v)) {
      let curId = vv["__ID__"];
      for (let [kkk,vvv] of Object.entries(vv)) {
        if (kkk.startsWith("__REF__")) {
          let revRefName = `__REVREF__${k}`;
          let entity = kkk.slice("__REF__".length);
          let eid = vvv;
          let tmp = ret[entity][eid][revRefName] = ret[entity][eid][revRefName] || [];
          tmp.push(curId);
        }
      }
    }
  }
  return ret;
}

function deserialize(obj) {
  // deep copy object
  let ret = {...obj};
  for (let [k,v] of Object.entries(ret)) {
    let t = ret[k] = {...v};
    for (let [kk,vv] of Object.entries(v)) {
      t[kk] = {...vv};
      // yeah, this leaves the revref list shallow copied, but this will be resolved soon
    }
  }
  // resolve references
  for (let [k,v] of Object.entries(ret)) {
    for (let [kk,vv] of Object.entries(v)) {
      for (let [kkk,vvv] of Object.entries(vv)) {
        if (kkk.startsWith("__REF__")) {
          let entity = kkk.slice("__REF__".length);
          let eid = vvv;
          vv[kkk] = ret[entity][eid];
        }
        if (kkk.startsWith("__REVREF__")) {
          let entity = kkk.slice("__REVREF__".length);
          let eids = vvv;
          vv[kkk] = eids.map( eid=>ret[entity][eid] );
        }
      }
    }
  }
  return ret;
}

await function runQueryAsync(queryJSON,queryResolver) {
  let selectJSON = queryJSON["SELECT"];
  let filterJSON = queryJSON["FILTER"];
  let ret = {};
  
  for (let [entity,attributes] of Object.entries(selectJSON)) {
    ret[entity] = queryResolver(entity,attributes,filterJSON);
  }
  return ret;
}

module.exports = {
  relationalJsonify,
  deserialize,
  resolveQuery,
};
