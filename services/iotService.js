const { mqtt, iot } = require("aws-iot-device-sdk-v2");
const fs = require("fs");
const config = require("../config/awsConfig");
const logger = require("../utils/logger");
const MESSAGES = require("../utils/messages");

const SUCCESS = MESSAGES.SUCCESS;
const ERRORS = MESSAGES.ERRORS;

class IoTService {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      if (this.connection) {
        logger.log(ERRORS.ALREADY_CONNECTED);
        throw new Error(ERRORS.ALREADY_CONNECTED);
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
      this.connection = mqttClient.new_connection(clientConfig);

      this.connection.on("connect", () => {
        logger.log(SUCCESS.CONNECT_SUCCESS);
      });

      this.connection.on("error", (error) => {
        return new Error(error);
      });

      await this.connection.connect();
    } catch (error) {
      this.connection = null;
      logger.error(ERRORS.CONNECT_FAILED(error?.message));
      throw new Error(error);
    }
  }

  async subscribe(topic, messageHandler) {
    try {
      if (!this.connection) {
        logger.error(ERRORS.NO_CONNECTION);
        throw new Error(ERRORS.NO_CONNECTION);
      }

      await this.connection.subscribe(
        topic,
        mqtt.QoS.AtLeastOnce,
        (receivedTopic, payload) => {
          logger.log(
            SUCCESS.SUBSCRIBE_SUCCESS(receivedTopic) +
              `: ${JSON.stringify(payload)}`
          );
          messageHandler(receivedTopic, payload);
        }
      );
      logger.log(SUCCESS.SUBSCRIBE_SUCCESS(topic));
    } catch (error) {
      logger.error(ERRORS.SUBSCRIBE_FAILED(error?.message));
      throw new Error(error);
    }
  }

  async publish(topic, data) {
    try {
      if (!this.connection) {
        logger.error(ERRORS.NO_CONNECTION);
        throw new Error(ERRORS.NO_CONNECTION);
      }

      const payload = JSON.stringify(data);
      await this.connection.publish(topic, payload, mqtt.QoS.AtLeastOnce);

      logger.log(SUCCESS.PUBLISH_SUCCESS(topic) + `: ${payload}`);
    } catch (error) {
      logger.error(ERRORS.PUBLISH_FAILED(error?.message));
      throw new Error(error);
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        logger.log(SUCCESS.DISCONNECTING);

        await this.connection.disconnect();
        this.connection = null;

        logger.log(SUCCESS.DISCONNECT_SUCCESS);
      } else {
        throw new Error(ERRORS.NO_CONNECTION_TO_DISCONNECT);
      }
    } catch (error) {
      logger.error(ERRORS.DISCONNECT_ERROR(error?.message));
      throw new Error(error);
    }
  }
}

module.exports = new IoTService();
