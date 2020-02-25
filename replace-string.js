/*
 * @Author: Peng
 * @Date: 2020-01-28 10:45:44
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-02-25 06:36:28
 */

const replace = require("replace-in-file");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const { IN_OUT_CODES_XLSX_PATH } = require("./db_relation/in-out-db-relation");

const { MED_CAT_XLSX_PATH } = require("./db_relation/drug-category-relation");

const options = {
  files: "./services/router.js",
  from: "EXAMPLE_PERSON_ID",
  to: process.env.TEST_PERSON_ID
};

const options1 = {
  files: "./config/apidoc-config/apidoc.json",
  from: "3300",
  to: "3333"
};
const options2 = {
  files: "./config/apidoc-config/apidoc.json",
  from: "3300",
  to: "3333"
};
const options3 = {
  files: "./config/apidoc2-config/apidoc.json",
  from: "3300",
  to: "3333"
};
const options4 = {
  files: "./config/apidoc2-config/apidoc.json",
  from: "3300",
  to: "3333"
};
const options5 = {
  files: "./config/web-server-config.js",
  from: "3300",
  to: "3333"
};

async function startReplacString() {
  if (process.env.HTTP_PORT == null) {
    await replace(options1);
    await replace(options2);
    await replace(options3);
    await replace(options4);
    await replace(options5);
  }

  if (process.env.TEST_PERSON_ID != null) {
    replaceID();
  }
}

async function replaceID() {
  try {
    const results = await replace(options);
    if (results[0].hasChanged) {
      replaceID();
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

function copyXlsxFile() {
  // inoutcode.xlsx will be created or overwritten by default.
  const NEW_PATH_IN_OUT = path.join(__dirname, "./docs/files/inoutcode.xlsx");
  const NEW_PATH_MED_CAT = path.join(__dirname, "./docs/files/medcat.xlsx");

  const docsDir = path.join(__dirname, "docs");
  const filesDir = path.join(docsDir, "files");

  console.log("IN_OUT_CODES_XLSX_PATH :", IN_OUT_CODES_XLSX_PATH);
  console.log("MED_CAT_XLSX_PATH :", MED_CAT_XLSX_PATH);

  fs.access(docsDir, err => {
    if (err) {
      fs.mkdirSync(docsDir);
    }

    fs.access(filesDir, err => {
      if (err) {
        fs.mkdirSync(filesDir);
      }
      fs.copyFile(IN_OUT_CODES_XLSX_PATH, NEW_PATH_IN_OUT, err => {
        if (err) throw err;

        let workbook = XLSX.readFile(NEW_PATH_IN_OUT);
        let sheet_name_list = workbook.SheetNames;
        let IN_OUT_CODE_JSON = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        let datatable_array = IN_OUT_CODE_JSON.map(item => [
          item.EVENT_CD,
          item.EVENT_CD_DEFINITION,
          item.DISPLAY_IO,
          item.IO_CALCS,
          item.IO_CAT,
          item.Subcat,
          item.LABEL,
          item.SHORT_LABEL
        ]);
        let datatable_json = { data: datatable_array };

        fs.writeFile("./docs/files/xlsx.log", new Date().toString(), function(err) {
          if (err) throw err;
          console.log("Saved current time!");
        });

        fs.writeFile("./docs/files/xlsx.json", JSON.stringify(datatable_json), function(err) {
          if (err) throw err;
          console.log("Saved json file!");
        });
      });

      fs.copyFile(MED_CAT_XLSX_PATH, NEW_PATH_MED_CAT, err => {
        if (err) throw err;

        let workbook = XLSX.readFile(NEW_PATH_MED_CAT);
        let sheet_name_list = workbook.SheetNames;
        let MED_CAT_JSON = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        let datatable_array = MED_CAT_JSON.map(item => [
          item.RXCUI,
          item.MEDICATION,
          item["TWIST CLASS"],
          item.WITHIN_CLASS_DISPLAY_HIERARCHY,
          item.CONDITION,
          item.DRUG_CLASS,
          item.DRUG_CLASS_MoA,
          item.DRUG_CLASS_THERAPEUTIC
        ]);
        let datatable_json = { data: datatable_array };

        fs.writeFile("./docs/files/xlsx_medcat.log", new Date().toString(), function(err) {
          if (err) throw err;
          console.log("Saved current time for medcat!");
        });

        fs.writeFile("./docs/files/xlsx_medcat.json", JSON.stringify(datatable_json), function(
          err
        ) {
          if (err) throw err;
          console.log("Saved json file for medcat!");
        });
      });
    });
  });
}

startReplacString();
copyXlsxFile();
