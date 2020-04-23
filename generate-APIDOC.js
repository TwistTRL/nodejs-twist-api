/*
 * @Author: Peng
 * @Date: 2020-01-28 10:45:44
 * @Last Modified by: Peng
 * @Last Modified time: 2020-04-22 22:47:41
 */

const replacString = require("./services/replace-string");
const { exec } = require("child_process");

const copyXlsxFile = () => {
  // inoutcode.xlsx will be created or overwritten by default.
  const NEW_PATH_IN_OUT = path.join(__dirname, "./docs/files/inoutcode.xlsx");
  const NEW_PATH_MED_CAT = path.join(__dirname, "./docs/files/medcat.xlsx");

  const docsDir = path.join(__dirname, "docs");
  const filesDir = path.join(docsDir, "files");

  // console.log("IN_OUT_CODES_XLSX_PATH :", IN_OUT_CODES_XLSX_PATH);
  // console.log("MED_CAT_XLSX_PATH :", MED_CAT_XLSX_PATH);

  fs.access(docsDir, (err) => {
    if (err) {
      fs.mkdirSync(docsDir);
    }

    fs.access(filesDir, (err) => {
      if (err) {
        fs.mkdirSync(filesDir);
      }
      fs.copyFile(IN_OUT_CODES_XLSX_PATH, NEW_PATH_IN_OUT, (err) => {
        if (err) throw err;

        let workbook = XLSX.readFile(NEW_PATH_IN_OUT);
        let sheet_name_list = workbook.SheetNames;
        let IN_OUT_CODE_JSON = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        let datatable_array = IN_OUT_CODE_JSON.map((item) => [
          item.EVENT_CD,
          item.EVENT_CD_DEFINITION,
          item.DISPLAY_IO,
          item.IO_CALCS,
          item.IO_CAT,
          item.Subcat,
          item.LABEL,
          item.SHORT_LABEL,
        ]);
        let datatable_json = { data: datatable_array };

        fs.writeFile("./docs/files/xlsx.log", new Date().toString(), function (err) {
          if (err) throw err;
          // console.log("Saved current time!");
        });

        fs.writeFile("./docs/files/xlsx.json", JSON.stringify(datatable_json), function (err) {
          if (err) throw err;
          // console.log("Saved json file!");
        });
      });

      fs.copyFile(MED_CAT_XLSX_PATH, NEW_PATH_MED_CAT, (err) => {
        if (err) throw err;

        let workbook = XLSX.readFile(NEW_PATH_MED_CAT);
        let sheet_name_list = workbook.SheetNames;
        let MED_CAT_JSON = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        let datatable_array = MED_CAT_JSON.map((item) => [
          item.RXCUI,
          item.MEDICATION,
          item["TWIST CLASS"],
          item["CLASS TITLE"],
          item.WITHIN_CLASS_DISPLAY_HIERARCHY,
          item.Route,
          item["Equivalents (mg)"],
          item.Comments,
          item.DRUG_CLASS,
          item.DRUG_CLASS_MoA,
          item.DRUG_CLASS_THERAPEUTIC,
        ]);
        let datatable_json = { data: datatable_array };

        fs.writeFile("./docs/files/xlsx_medcat.log", new Date().toString(), function (err) {
          if (err) throw err;
          // console.log("Saved current time for medcat!");
        });

        fs.writeFile("./docs/files/xlsx_medcat.json", JSON.stringify(datatable_json), function (err) {
          if (err) throw err;
          // console.log("Saved json file for medcat!");
        });
      });
    });
  });
};


const stringAPIdoc = "apidoc -e node_modules -c config/apidoc-config -i ./ -o docs/apidoc && apidoc -e node_modules -c config/apidoc2-config -i ./ -o docs/apidoc2 -t template/";

copyXlsxFile();
replacString();
exec(stringAPIdoc, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    console.log("APIDOC error!");
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  console.log("APIDOC generated");
});
