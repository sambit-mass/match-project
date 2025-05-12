# backend-api

### TypeScript + Node express JS | Node Version - v22.14.0 | Typescript Version - v5.8.2


### Features


#### Step-by-step to create an environment

Let’s now take a step-by-step to create an environment for using the Typescript language within an Express.js project.

- `npm init`

#### Typescript package

Let’s now install the typescript package -

- `npm install typescript -s`

#### Changes in package.json

Inside our package.json we will put a script called tsc:

- `“scripts” : {“tsc” : “tsc”}`

This modification allows us to call typescript functions from the command line in the project’s folder. So we can use the following command:

- `npm run tsc -- --init`
  This command initializes the typescript project by creating the tsconfig.json file.
- `{"compilerOptions": {"target": "es2016","module": "commonjs","rootDir": "./src","outDir": "./dist","noEmitOnError": true,"esModuleInterop": true,"forceConsistentCasingInFileNames": true,"strict": true,"skipLibCheck": true}}`

#### Create ‘dist’ and ‘src’ folder in the root directory

- `./dist`
- `./src`

#### Install express

Installing node express.js

- `npm install express -s`

#### Express and Typescript packages are independent. The consequence of this is that Typescript does not “know” types of Express classes. There is a specific npm package for the Typescript to recognize the Express types.

Installing typescript express.js

- `npm install @types/express -s`

#### Inside the src folder create a file called ‘app.ts’ and paste the code below -

// lib/app.ts
import express = require('express');

// Create a new express application instance
const app: express.Application = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

Inside package.json -> “scripts” add the code listed below:
"dev": "npx ts-node-dev ./src/app.ts",
    	"prod": "tsc && node ./dist/app.js",
    	"build": "npx tsc"

#### Basic packages installation

Run these scripts to add the packages -

  npm i @aws-sdk/client-s3
  npm i @aws-sdk/client-sqs
  npm i @grpc/grpc-js
  npm i @grpc/proto-loader
  npm i @types/cookie-parser
  npm i @types/cors
  npm i @types/ejs
  npm i @types/express
  npm i @types/jsonwebtoken
  npm i @types/morgan
  npm i @types/multiparty
  npm i @types/nodemailer
  npm i @types/request-ip
  npm i @types/uuid
  npm i app-root-path
  npm i argon2
  npm i axios
  npm i cookie-parser
  npm i cors
  npm i cryptr
  npm i dotenv
  npm i ejs
  npm i express
  npm i express-rate-limit
  npm i express-validator
  npm i helmet
  npm i jsonpath
  npm i jsonwebtoken
  npm i moment-timezone
  npm i morgan
  npm i multiparty
  npm i mysql2
  npm i request-ip
  npm i sequelize
  npm i ts-node-dev
  npm i typescript
  npm i winston
