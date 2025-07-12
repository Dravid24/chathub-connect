const express = require("express");
const { validateToken } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getAllMessage,
  markAsRead,
} = require("../controller/messageController");

const router = express.Router();

router.route("/").post(validateToken, sendMessage);
router.route("/:chatId").get(validateToken, getAllMessage);
router.put("/:chatId/mark-as-read", validateToken, markAsRead);

module.exports = router;
