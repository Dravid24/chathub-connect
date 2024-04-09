const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const createChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId is missing");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMsg");

  isChat = await User.populate(isChat, {
    path: "latestMsg.sender",
    select: "name profileUrl email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMsg")
      .then(async (results) => {
        result = await User.populate(results, {
          path: "latestMsg.sender",
          select: "name profileUrl email",
        });
        res.status(200).send(result);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroup = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.groupName) {
    return res.status(400).send({ message: "Users or group name is missing" });
  }

  let users = req.body.users;
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than two members is required to create a group");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.groupName,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.json(updatedChat);
  }
});

const removeUserFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const userRemoved = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!userRemoved) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.json(userRemoved);
  }
});

const addUserToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const userAdded = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!userAdded) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.json(userAdded);
  }
});

module.exports = {
  createChat,
  fetchChats,
  createGroup,
  renameGroup,
  removeUserFromGroup,
  addUserToGroup,
};
