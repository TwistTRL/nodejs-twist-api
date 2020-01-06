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

## Special Thanks
This repo starts from a clone of the code here:
https://jsao.io/2018/03/creating-a-rest-api-with-node-js-and-oracle-database/

Using [APIDOC](https://apidocjs.com/) for APIs documentation
