const express = require("express");
const {
  registerUser,
  loginUser,
  getUsers,
} = require("../controller/userController");
const { validateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", validateToken, getUsers);

module.exports = router;
