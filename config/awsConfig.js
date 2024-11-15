require("dotenv").config();

module.exports = {
  region: process.env.AWS_REGION,
  endpoint: process.env.IOT_ENDPOINT,
  clientId: process.env.CLIENT_ID,
  caFilePath: process.env.CA_CERT_PATH,
  certFilePath: process.env.CERT_PATH,
  privateKeyFilePath: process.env.PRIVATE_KEY_PATH,
  timeStreamDatabase: process.env.TIME_STREAM_DATABASE,
  timeStreamTable: process.env.TIME_STREAM_TABLE,
};
