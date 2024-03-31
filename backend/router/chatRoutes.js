const express = require("express");
const { validateToken } = require("../middleware/authMiddleware");
const {
  createChat,
  fetchChats,
  createGroup,
  renameGroup,
  removeUserFromGroup,
  addUserToGroup,
} = require("../controller/chatController");

const router = express.Router();

router.post("/", validateToken, createChat);
router.get("/", validateToken, fetchChats);
router.post("/group", validateToken, createGroup);
router.put("/group-rename", validateToken, renameGroup);
router.put("/remove-user", validateToken, removeUserFromGroup);
router.put("/add-user", validateToken, addUserToGroup);

module.exports = router;
