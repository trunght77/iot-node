const { mqtt, iot } = require("aws-iot-device-sdk-v2");
const fs = require("fs");
const config = require("../config/awsConfig");
const logger = require("../utils/logger");
const MESSAGES = require("../utils/messages");
const topics = require("../config/topics");

const SUCCESS = MESSAGES.SUCCESS;
const ERRORS = MESSAGES.ERRORS;

class IoTService {
  constructor() {
    this.connection = this.connect();
  }

  async connect() {
    try {
      if (this.connection) {
        logger.log(ERRORS.ALREADY_CONNECTED);
        return this.connection;
      }

      const clientCert = fs.readFileSync(config.certFilePath);
      const privateKey = fs.readFileSync(config.privateKeyFilePath);
      const rootCa = fs.readFileSync(config.caFilePath);

      const clientConfig =
        iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(
          clientCert,
          privateKey
        )
          .with_certificate_authority(rootCa)
          .with_client_id(config.clientId)
          .with_clean_session(false)
          .with_endpoint(config.endpoint)
          .build();

      const mqttClient = new mqtt.MqttClient();
      const connection = mqttClient.new_connection(clientConfig);

      connection.on("connect", async () => {
        logger.log(SUCCESS.CONNECT_SUCCESS);
        let listSubscribed = [topics.value, topics.client_to_server];

        listSubscribed.forEach((topic) => {
          try {
            connection.subscribe(topic, mqtt.QoS.AtLeastOnce);
            logger.log(SUCCESS.SUBSCRIBE_SUCCESS(topic));
          } catch (error) {
            logger.error(ERRORS.SUBSCRIBE_FAILED(error));
          }
        });
      });

      connection.on("error", (error) => {
        return new Error(error);
      });

      await connection.connect();

      return connection;
    } catch (error) {
      logger.error(ERRORS.CONNECT_FAILED(error));
      return null;
    }
  }

  async ensureConnected() {
    if (!this.connection) {
      await this.connect();
    }
    return this.connection;
  }

  async publish(topic, data) {
    try {
      const connection = await this.ensureConnected();

      const payload = JSON.stringify(data);
      await connection.publish(topic, payload, mqtt.QoS.AtLeastOnce);

      logger.log(SUCCESS.PUBLISH_SUCCESS(topic) + `: ${payload}`);

      if (topic == topics.client_to_server) {
        const response = await this.waitForNewMessage(topics.server_to_client);
        return response;
      }

      return null;
    } catch (error) {
      logger.error(ERRORS.PUBLISH_FAILED(error));
      throw new Error(error);
    }
  }

  async waitForNewMessage(responseTopic) {
    try {
      const connection = await this.ensureConnected();

      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          logger.error(ERRORS.RESPONSE_TIMEOUT);
          resolve(null);
        }, 5000);

        const onMessage = (topic, payload) => {
          if (topic === responseTopic) {
            clearTimeout(timeout);

            setTimeout(() => {
              try {
                const buffer = Buffer.from(payload);
                const payloadString = buffer.toString("utf-8");
                const parsedPayload = JSON.parse(payloadString);
                if (
                  parsedPayload.command_id == "CMD00011" ||
                  parsedPayload.command_id == "CMD00021" ||
                  parsedPayload.command_id == "CMD00031"
                ) {
                  logger.log(
                    SUCCESS.RECEIVE_RESPONSE(topic) +
                      `: ${JSON.stringify(parsedPayload)}`
                  );
                  resolve(parsedPayload);
                } else {
                  resolve(null);
                }
              } catch (err) {
                logger.error(ERRORS.INVALID_RESPONSE_FORMAT);
                resolve(null);
              } finally {
                connection.unsubscribe(responseTopic).catch((err) => {
                  logger.error(ERRORS.UNSUBSCRIBE_FAILED(err));
                });
              }
            }, 1000);
          }
        };

        connection.subscribe(responseTopic, mqtt.QoS.AtLeastOnce, onMessage);
      });
    } catch (error) {
      logger.error(ERRORS.LISTEN_FAILED(error));
      return null;
    }
  }
}

module.exports = new IoTService();
