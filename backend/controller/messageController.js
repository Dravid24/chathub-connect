const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.sendStatus(400);
    throw new Error("Content or chat id is missing!");
  }

  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name profileUrl");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profileUrl email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMsg: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getAllMessage = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name profileUrl email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, getAllMessage };
