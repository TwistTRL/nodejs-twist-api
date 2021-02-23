# nodejs-twist-api

## Twist Server Use Only

```
git clone https://github.com/TwistTRL/nodejs-twist-utils.git

git clone https://github.com/TwistTRL/nodejs-twist-api.git && cd nodejs-twist-api/ && npm install && npm i xlsx
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
 
![flow](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/TwistTRL/nodejs-twist-api/master/assets/flowchart.iuml)

## Airflow Created Database Tables

![db](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/TwistTRL/nodejs-twist-api/master/assets/database-diagram.iuml)

## File Structure

```bash
.
├── assets
│   ├── api-cached-fetch.iuml
│   ├── api-cache.iuml
│   ├── api-init-fetch.iuml
│   ├── database-diagram.iuml
│   ├── db-api-front.iuml
│   ├── db-api-front-v2.iuml
│   ├── flowchart.iuml
│   ├── phenotyping-initial.iuml
│   ├── phenotyping.iuml
│   └── sequence.iuml
├── cerner_apis
│   ├── cerner-FHIR-config.js
│   ├── FHIR-flow.md
│   └── get-FHIR-api.js
├── config
│   ├── apidoc2-config
│   ├── apidoc-config
│   ├── database-config.js
│   ├── database-prd-config.js
│   ├── ipList.txt
│   ├── redis-config.js
│   ├── users.js
│   └── web-server-config.js
├── db_apis
│   ├── adt
│   ├── cache
│   ├── cross_tables
│   ├── diagnosis_display
│   ├── get_bed.js
│   ├── get_bed_survey.js
│   ├── get-diluent-nutrition-calc.js
│   ├── get_drug.js
│   ├── get-ecmo.js
│   ├── get-formula.js
│   ├── get_heart_rate.js
│   ├── get_hr_binned.js
│   ├── get_hr_binned_v2.js
│   ├── get_hr_calc.js
│   ├── get-in-out.js
│   ├── get-in-out-tooltip.js
│   ├── get-in-out-tooltip-v1.js
│   ├── get-in-out-tooltip-v2.js
│   ├── get-in-out-tooltip-v3.js
│   ├── get-in-out-v2.js
│   ├── get-labs-all.js
│   ├── get_labs.js
│   ├── get-macro-nutrients.js
│   ├── get_many_bed.js
│   ├── get_many_personel.js
│   ├── get_many_person.js
│   ├── get-med.js
│   ├── get-microbiology.js
│   ├── get-nutrition-calories.js
│   ├── get-nutrition-fat-pro-cho.js
│   ├── get-nutrition-GIR.js
│   ├── get-nutrition-volume.js
│   ├── get_personel.js
│   ├── get_person.js
│   ├── get-radiology.js
│   ├── get_raw_hr.js
│   ├── get-relational-query.js
│   ├── get_respiratory_support_variables.js
│   ├── get-temperature.js
│   ├── get-temp.js
│   ├── get-tpn-nutrition-calc.js
│   ├── get-vitals-all.js
│   ├── get-vitals-all-v2.js
│   ├── get-weight.js
│   ├── in-out
│   ├── labs
│   ├── lines
│   ├── person
│   ├── phenotyping
│   └── utils
├── db_relation
│   ├── converted-database.js
│   ├── drug-category-relation.js
│   ├── hr-bin-config.js
│   ├── hr-bin-config-v2.js
│   ├── hr-calc-config.js
│   ├── hr-raw-config.js
│   ├── in-out-db-relation.js
│   ├── labs-category-config.js
│   ├── labs-db-relation.js
│   ├── microbiology-db-relation.js
│   ├── nurse-unit-abbr.js
│   ├── radiology-db-relation.js
│   ├── vitals-calc-relation.js
│   └── vitals-db-relation.js
├── docs
│   ├── apidoc
│   ├── apidoc2
│   ├── cache.md
│   ├── files
│   ├── oracledb.md
│   ├── pm2.service
│   ├── redis.service
│   └── thoughts.md
├── ecosystem.config.js
├── index.js
├── nodemon.json
├── package.json
├── package-lock.json
├── README.md
├── replace-pre-push.js
├── replace-string.js
├── services
│   ├── access.log
│   ├── database.js
│   ├── login.html
│   ├── relational-query-sql-builder.js
│   ├── router.js
│   └── web-server.js
├── template
│   ├── css
│   ├── fonts
│   ├── img
│   ├── index.html
│   ├── locales
│   ├── main.js
│   ├── utils
│   └── vendor
├── test
│   ├── test_abnormal_mrn.js
│   ├── test-binary-search.js
│   ├── test-crash.js
│   ├── test-database.js
│   ├── test_drug_overlap.js
│   ├── test_drug_time.js
│   ├── test-isJson.js
│   ├── test-labs.js
│   ├── test-vitals.js
│   └── vital-calc-test.js
└── utils
    ├── errors.js
    ├── isJson.js
    └── relationalJSON.js
```

## TODO list

- [ ] Database cache table update
- [ ] Census page

<!-- ![db-api-front](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/TwistTRL/nodejs-twist-api/master/assets/db-api-front.iuml) -->



## Special Thanks
This repo starts from a clone of the code here:
https://jsao.io/2018/03/creating-a-rest-api-with-node-js-and-oracle-database/

Using [APIDOC](https://apidocjs.com/) for APIs documentation
