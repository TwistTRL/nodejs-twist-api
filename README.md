# nodejs-twist-api

## Twist Server Use Only

```
git clone https://github.com/TwistTRL/nodejs-twist-api.git
cd nodejs-twist-api/
npm install
```

* Devlopment environment
```
npm run devdocs
npm run dev
```

* Production environment
```
npm run docs
npm start
```

* Test
```
npm test
```

API documentation: web browser `twist:3333/api/`

(port: process.env.HTTP_PORT || 3333)
 
![flow](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/TwistTRL/nodejs-twist-api/master/assets/flowchart.iuml)

## Airflow Created Database Tables

![db](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/TwistTRL/nodejs-twist-api/master/assets/database-diagram.iuml)

## File Structure

```bash
.
├── apidoc2-header.md
├── apidoc-header.md
├── _apidoc.js
├── assets
│   ├── database-diagram.iuml
│   └── flowchart.iuml
├── config
│   ├── apidoc2-config
│   │   └── apidoc.json
│   ├── apidoc-config
│   │   └── apidoc.json
│   ├── database-config.js
│   └── web-server-config.js
├── db_apis
│   ├── cross_tables
│   │   ├── get_personnel_for_patient.js
│   │   └── get_room_time.js
│   ├── get_bed.js
│   ├── get_bed_survey.js
│   ├── get_drug.js
│   ├── get_heart_rate.js
│   ├── get_hr_binned.js
│   ├── get_hr_binned_v2.js
│   ├── get_hr_calc.js
│   ├── get-in-out.js
│   ├── get-labs-all.js
│   ├── get_labs.js
│   ├── get_many_bed.js
│   ├── get_many_personel.js
│   ├── get_many_person.js
│   ├── get_personel.js
│   ├── get_person.js
│   ├── get_raw_hr.js
│   ├── get-relational-query.js
│   ├── get_respiratory_support_variables.js
│   ├── get-vitals-all.js
│   └── get-vitals-all-v2.js
├── db_relation
│   ├── converted-database.js
│   ├── drug-category-relation.js
│   ├── hr-bin-config.js
│   ├── hr-bin-config-v2.js
│   ├── hr-calc-config.js
│   ├── hr-raw-config.js
│   ├── in-out-db-relation.js
│   ├── labs-category-config.js
│   ├── nurse-unit-abbr.js
│   ├── vitals-calc-relation.js
│   └── vitals-db-relation.js
├── index.js
├── package.json
├── package-lock.json
├── README.md
├── replace-pre-push.js
├── replace-string.js
├── services
│   ├── database.js
│   ├── relational-query-sql-builder.js
│   ├── router.js
│   └── web-server.js
├── template
│   └── ...
├── test
│   ├── test_abnormal_mrn.js
│   ├── test-crash.js
│   ├── test-database.js
│   ├── test_drug_overlap.js
│   ├── test_drug_time.js
│   ├── test-isJson.js
│   ├── test-labs.js
│   ├── test-vitals.js
│   └── vital-calc-test.js
└── utils
    ├── errors.js
    ├── isJson.js
    └── relationalJSON.js
```

## Special Thanks
This repo starts from a clone of the code here:
https://jsao.io/2018/03/creating-a-rest-api-with-node-js-and-oracle-database/

Using [APIDOC](https://apidocjs.com/) for APIs documentation
