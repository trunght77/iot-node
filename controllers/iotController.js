const iotService = require("../services/iotService");
const logger = require("../utils/logger");
const response = require("../utils/responseFormatter");
const MESSAGES = require("../utils/messages");

const SUCCESS = MESSAGES.SUCCESS;
const ERROR = MESSAGES.ERRORS;

class IoTController {
  async connect(req, res) {
    try {
      await iotService.connect();

      return response.success(res, SUCCESS.CONNECT_SUCCESS);
    } catch (error) {
      let msg = error?.message.replace("Error: ", "");
      return response.error(res, msg);
    }
  }

  async subscribe(req, res) {
    try {
      const { topic } = req.body;

      await iotService.subscribe(topic, (receivedTopic, payload) => {
        logger.log(
          MESSAGES.SUCCESS.SUBSCRIBE_SUCCESS(receivedTopic) +
            `: ${JSON.stringify(payload)}`
        );
      });

      return response.success(res, SUCCESS.SUBSCRIBE_SUCCESS(topic));
    } catch (error) {
      let msg = error?.message.replace("Error: ", "");
      return response.error(res, msg);
    }
  }

  async publishValue(req, res) {
    try {
      const topic = "values";
      const { node_id, value_type, value } = req.body;
      const payload = { node_id, value_type, value };

      if (!topic || !node_id || !value_type || value === undefined) {
        return response.error(res, MESSAGES.VALIDATION.PUBLISH, 400);
      }

      await iotService.publish(topic, payload);

      return response.success(res, SUCCESS.PUBLISH_SUCCESS(topic));
    } catch (error) {
      let msg = error?.message.replace("Error: ", "");
      return response.error(res, msg);
    }
  }

  async disconnect(req, res) {
    try {
      await iotService.disconnect();
      return response.success(res, SUCCESS.DISCONNECT_SUCCESS);
    } catch (error) {
      let msg = error?.message.replace("Error: ", "");
      return response.error(res, msg);
    }
  }

  /**
   * Hàm xử lý chung để publish thông điệp
   */
  async publishCommand(req, res) {
    const topic = "communicate/clienttoserver";
    var { command_id, command_name, value } = req.body;

    try {
      // Validate các trường chung
      if (!command_id || !command_name) {
        throw new Error(MESSAGES.VALIDATION.REQUIRED_FIELDS);
      }

      // Validate và xử lý từng loại lệnh cụ thể
      let payload = {};
      if (command_name == "CONTROL_RULE") {
        var type = req.body.type;
        payload = IoTController.buildControlRule(type, value);
      } else if (command_name == "SCENARIO") {
        var type = req.body.type;
        payload = IoTController.buildScenario(type, value);
      } else if (command_name == "CONTROL_DEVICE") {
        let device_type = req.body.device_type;
        let node_id = req.body.node_id;
        let value = req.body.value;
        payload = IoTController.buildControlDevice(device_type, node_id, value);
      } else {
        throw new Error(MESSAGES.VALIDATION.INVALID_COMMAND_NAME);
      }

      // Bổ sung các trường chung
      payload = { command_id, command_name, ...payload };

      // Gửi lệnh qua MQTT
      await iotService.publish(topic, payload);

      return response.success(
        res,
        MESSAGES.SUCCESS.PUBLISH_SUCCESS(topic),
        payload
      );
    } catch (error) {
      const msg =
        error?.message?.replace("Error: ", "") ||
        MESSAGES.ERRORS.INTERNAL_SERVER_ERROR;
      return response.error(res, msg, 400);
    }
  }

  /**
   * Xử lý lệnh CONTROL_RULE
   */
  static buildControlRule(type, value) {
    if (type === "ADD") {
      const {
        device_type_if,
        node_id_if,
        comparator_if,
        value_if,
        device_type,
        node_id,
        value: actionValue,
      } = value || {};

      if (
        !device_type_if ||
        !node_id_if ||
        !comparator_if ||
        actionValue === undefined ||
        !device_type ||
        !node_id
      ) {
        throw new Error(MESSAGES.VALIDATION.CONTROL_RULE);
      }

      return { type, value };
    }

    if (type === "DELETE") {
      return { type, value: null };
    }

    throw new Error(MESSAGES.VALIDATION.INVALID_TYPE);
  }

  /**
   * Xử lý lệnh SCENARIO
   */
  static buildScenario(type, value) {
    if (type === "ADD") {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(MESSAGES.VALIDATION.SCENARIO);
      }
      return { type, value };
    }

    if (type === "RUN" || type === "DELETE") {
      return { type, value: null };
    }

    throw new Error(MESSAGES.VALIDATION.INVALID_TYPE);
  }

  /**
   * Xử lý lệnh CONTROL_DEVICE
   */
  static buildControlDevice(device_type, node_id, deviceValue) {
    if (!device_type || !node_id || deviceValue === undefined) {
      throw new Error(MESSAGES.VALIDATION.CONTROL_DEVICE);
    }

    return { device_type, node_id, value: deviceValue };
  }
}

module.exports = new IoTController();
