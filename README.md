# nodejs-twist-api

## Twist Server Use Only

```
git clone https://github.com/TwistTRL/nodejs-twist-api.git
cd nodejs-twist-api/

npm install
npm run docs
```

API documentation: web browser `twist:3300/api/`

(port: process.env.HTTP_PORT || 3300)

* run in dev using `nodemon`
```
npm run dev
```

* run in production using `pm2`
```
npm start
```

* run test using `mocha`
```
npm test
```

 


## Special Thanks
This repo starts from a clone of the code here:
https://jsao.io/2018/03/creating-a-rest-api-with-node-js-and-oracle-database/

Using [APIDOC](https://apidocjs.com/) for APIs documentation
