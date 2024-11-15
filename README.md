# Description

The Node.js API uses the MVC model to integrate with AWS IoT (MQTT) and AWS Timestream to serve a frontend application.

# Requirements

- Node.js
- Git

## Installation

```bash
$ npm install
```

## Settting up the environment variables

- Copy the file `.env.example` and make the new file `.env`
- Insert the values for the variables in the `.env` file

## Running the app

```bash
# run this command to auto restart server when save change
$ npm run dev

# start server
$ npm run start
$ node app.js
