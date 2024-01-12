const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const getToken = require("../config/getToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, profileUrl } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Some fields are invalid");
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User already exist");
  }

  const user = await User.create({
    name,
    email,
    password,
    profileUrl,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileUrl: user.profileUrl,
      token: getToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create user");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      profileUrl: user.profileUrl,
      token: getToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = { registerUser, loginUser };
