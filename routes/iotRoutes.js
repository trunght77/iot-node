const express = require("express");
const router = express.Router();
const iotController = require("../controllers/iotController");

// Route để kết nối MQTT
router.post("/connect", iotController.connect);

// Route để ngắt kết nối MQTT
router.post("/disconnect", iotController.disconnect);

// Route để subscribe một topic
router.post("/subscribe", iotController.subscribe);

// Route để publish một thông điệp đến một topic value
router.post("/value", iotController.publishValue);

// Route để publish một thông điệp đến một topic clienttoserver
router.post("/client_to_server", iotController.publishCommand);

module.exports = router;
