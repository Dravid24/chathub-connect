const express = require("express");
const { validateToken } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getAllMessage,
} = require("../controller/messageController");

const router = express.Router();

router.route("/").post(validateToken, sendMessage);
router.route("/:chatId").get(validateToken, getAllMessage);

module.exports = router;
