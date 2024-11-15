const MESSAGES = {
  ERRORS: {
    MISSING_FIELDS: "Missing required fields: ",
    CONNECT_FAILED: (error) => `Connect Fail: ${error}`,
    PUBLISH_FAILED: (error) => `Publish Error: ${error}`,
    INTERNAL_SERVER_ERROR: "Internal server error.",
    ALREADY_CONNECTED: "Already connected!",
    NO_CONNECTION: "No connection. Please connect first.",
    SUBSCRIBE_FAILED: (error) => `Subscribe Error: ${error}`,
    DISCONNECT_ERROR: (error) => `Disconnect Error: ${error}`,
    NO_CONNECTION_TO_DISCONNECT: "No connection to disconnect.",
    INTERNAL_SERVER_ERROR: "An unexpected error occurred.",
  },
  SUCCESS: {
    CONNECT_SUCCESS: "Connected to AWS IoT successfully",
    PUBLISH_SUCCESS: (topic) => `Message published to topic: ${topic}`,
    DISCONNECT_SUCCESS: "Disconnected from AWS IoT successfully",
    SUBSCRIBE_SUCCESS: (topic) => `Subscribed to topic: ${topic}`,
    DISCONNECTING: "Disconnecting...",
  },
  VALIDATION: {
    PUBLISH: "Request body must contain topic, node_id, value_type, and value.",
    CONNECT: "Request body must contain endpoint and client_id.",
    REQUIRED_FIELDS: "Missing required fields: command_id, command_name.",
    CONTROL_RULE: "Invalid CONTROL_RULE payload.",
    SCENARIO: "Invalid SCENARIO payload.",
    CONTROL_DEVICE: "Invalid CONTROL_DEVICE payload.",
    INVALID_COMMAND_NAME: "Invalid command_name.",
    INVALID_TYPE: "Invalid type for command.",
  },
};

module.exports = MESSAGES;
