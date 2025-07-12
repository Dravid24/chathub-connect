import React, { useEffect, useState } from "react";
import {
  Box,
  Spinner,
  FormControl,
  Input,
  useToast,
  Avatar,
  Tooltip,
  Image,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { IoMdSend } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import ScrollableFeed from "react-scrollable-feed";
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isSameUser,
  isAllPersonsReadMessage,
} from "../common/util";
import io from "socket.io-client";
import typingIcon from "../assets/typing.gif";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { MdOutlineStopCircle } from "react-icons/md";
import "regenerator-runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { BiChevronDown } from "react-icons/bi";

// const ENDPOINT = "http://localhost:5000"; // development
const ENDPOINT = "https://chathub-connect.onrender.com"; // production
let socket, selectedChatCompare;

const MessageDetails = ({ user, isLoadChatList, setIsLoadChatList }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMsg, setCurrentMsg] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [socketConnection, setSocketConnection] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isShowEmoji, setIsShowEmoji] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const { selectedChat, notification, setNotification } = ChatState();

  const toast = useToast();

  const { transcript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };

  useEffect(() => {
    setCurrentMsg(transcript);
    handleTyping();
  }, [transcript]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnection(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    getAllMessage();
    markMessagesAsRead();
    setIsShowEmoji(false);
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    markMessagesAsRead();
  }, [allMessages]);

  useEffect(() => {
    socket.on("message recieved", (msgRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id != msgRecieved.chat._id
      ) {
        if (!notification.includes(msgRecieved)) {
          setNotification([msgRecieved, ...notification]);
          setIsLoadChatList(!isLoadChatList);
        }
      } else {
        setAllMessages([...allMessages, msgRecieved]);
      }
    });
  });

  const getAllMessage = async () => {
    if (!selectedChat) return;
    setIsLoading(true);
    axios
      .get(`/api/message/${selectedChat._id}`, config)
      .then((res) => {
        setIsLoading(false);
        setAllMessages(res.data);

        socket.emit("join chat", selectedChat._id);
      })
      .catch(() => {
        toast({
          title: "Error Occured",
          description: "Failed to load all messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });
  };
  const markMessagesAsRead = async () => {
    if (!selectedChat) return;
    axios
      .put(
        `/api/message/${selectedChat._id}/mark-as-read`,
        { userId: user._id },
        config
      )
      .then(() => {
        socket.emit("join chat", selectedChat._id);
      })
      .catch(() => {
        toast({
          title: "Error Occured",
          description: "Failed to update message status",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });
  };
  const handleSendMessage = async (e) => {
    if ((e.key === "Enter" || e.key === undefined) && currentMsg) {
      setCurrentMsg("");
      setIsShowEmoji(false);
      socket.emit("stop typing", selectedChat._id);
      axios
        .post(
          "/api/message",
          { content: currentMsg, chatId: selectedChat._id },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        )
        .then((res) => {
          const data = res.data;
          socket.emit("send message", data);
          setAllMessages([...allMessages, data]);
        })
        .catch(() => {
          toast({
            title: "Error Occured",
            description: "Failed to send message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        });
    }
  };

  const handleTyping = () => {
    if (!socketConnection) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    const lastTypingTime = new Date().getTime();
    const timer = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timer && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timer);
  };

  const handleMessageChange = (e) => {
    setCurrentMsg(e);
    handleTyping();
  };

  const onEmojiClick = (e) => {
    setCurrentMsg((prevInput) => prevInput + e.emoji);
    handleTyping();
  };

  const handleVoiceToText = () => {
    setIsMicOn(true);
    SpeechRecognition.startListening();
    handleTyping();
  };

  const handleStop = () => {
    SpeechRecognition.stopListening();
    setIsMicOn(false);
  };

  const handleSpeak = (text) => {
    const value = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(value);
  };

  const handleTranslate = async (messageId, text) => {
    const translateLang = localStorage.getItem("translateLang");
    try {
      const url = `https://microsoft-translator-text.p.rapidapi.com/translate?to%5B0%5D=${translateLang}&api-version=3.0&profanityAction=NoAction&textType=plain`;
      const options = {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key":
            "f4e0322e30mshab5ce59c58fe572p1813aejsnd047a8ad310d",
          "X-RapidAPI-Host": "microsoft-translator-text.p.rapidapi.com",
        },
      };
      const data = [
        {
          Text: text,
        },
      ];

      const response = await axios.post(url, data, options);
      const responseObject = response.data;
      const translatedText = responseObject[0].translations[0].text;
      const updatedMessages = allMessages.map((msg) =>
        msg._id === messageId ? { ...msg, content: translatedText } : msg
      );
      setAllMessages(updatedMessages);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to translate message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      justifyContent={"flex-end"}
      p={3}
      pt={0}
      w={"100%"}
      h={"100%"}
      overflowY={"hidden"}
      bg={"#f5f5f5"}
    >
      {isLoading ? (
        <Spinner size="xl" alignSelf="center" margin={"auto"} />
      ) : (
        <div className="messages">
          <ScrollableFeed>
            {allMessages?.map((message, i) => (
              <div key={message._id} style={{ display: "flex" }}>
                {(isSameSender(allMessages, message, i, user._id) ||
                  isLastMessage(allMessages, i, user._id)) && (
                  <Tooltip
                    label={message.sender.name}
                    placement="bottom-start"
                    hasArrow
                  >
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor="pointer"
                      name={message.sender.name}
                      src={message.sender.profileUrl}
                    />
                  </Tooltip>
                )}
                <>
                  <div
                    style={{
                      marginTop: isSameUser(allMessages, message, i, user._id)
                        ? 3
                        : 10,
                      marginLeft: isSameSenderMargin(
                        allMessages,
                        message,
                        i,
                        user._id
                      ),
                      maxWidth: "75%",
                    }}
                  >
                    <div
                      style={{ display: "flex" }}
                      className="indidual-message"
                    >
                      {message.sender._id === user._id && (
                        <span
                          className="messageOptions"
                          style={{ margin: "auto", marginLeft: "5px" }}
                        >
                          <Menu>
                            <MenuButton>
                              <BiChevronDown size={20} />
                            </MenuButton>
                            <MenuList>
                              <MenuItem
                                onClick={() => handleSpeak(message.content)}
                              >
                                Speak
                              </MenuItem>
                              <MenuItem
                                onClick={() =>
                                  handleTranslate(message._id, message.content)
                                }
                              >
                                Translate
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </span>
                      )}
                      <div
                        style={{
                          backgroundColor: `${
                            message.sender._id === user._id ? "#B9F5D0" : "#fff"
                          }`,
                          borderRadius: "6px",
                          padding: "5px 5px 5px 15px",
                          width: "fit-content",
                          display: "flex",
                        }}
                      >
                        {message.content}{" "}
                        {message.sender._id === user._id && (
                          <IoCheckmarkDoneSharp
                            color={
                              isAllPersonsReadMessage(message, user._id)
                                ? "#53bdeb"
                                : "#8696a0"
                            }
                            style={{ margin: "8px 0 0 5px" }}
                          />
                        )}
                      </div>
                      {message.sender._id !== user._id && (
                        <span
                          className="messageOptions"
                          style={{ margin: "auto", marginLeft: "5px" }}
                        >
                          <Menu>
                            <MenuButton>
                              <BiChevronDown size={20} />
                            </MenuButton>
                            <MenuList>
                              <MenuItem
                                onClick={() => handleSpeak(message.content)}
                              >
                                Speak
                              </MenuItem>
                              <MenuItem
                                onClick={() =>
                                  handleTranslate(message._id, message.content)
                                }
                              >
                                Translate
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </span>
                      )}
                    </div>
                    {message.sender._id === user._id &&
                      i === allMessages.length - 1 && (
                        <p className="messageStatus">
                          {isAllPersonsReadMessage(message, user._id)
                            ? "Seen"
                            : "Delivered"}
                        </p>
                      )}
                  </div>
                </>
              </div>
            ))}
          </ScrollableFeed>
        </div>
      )}
      {isTyping && (
        <Image src={typingIcon} alt="Typing..." w={16} ml="25px" mb="-10px" />
      )}
      <EmojiPicker
        open={isShowEmoji}
        width="100%"
        height="350px"
        onEmojiClick={onEmojiClick}
        previewConfig={{ showPreview: false }}
        style={{ marginTop: "10px", marginBottom: "-10px" }}
      />
      <FormControl
        onKeyDown={handleSendMessage}
        isRequired
        mt={3}
        display="flex"
      >
        <BsEmojiSmile
          onClick={() => setIsShowEmoji(!isShowEmoji)}
          fontSize="25"
          style={{ margin: "auto", marginRight: "10px", cursor: "pointer" }}
        />
        <InputGroup>
          <Input
            variant="outline"
            bgColor="#fff"
            size="lg"
            placeholder="Type a message"
            value={currentMsg}
            onChange={(e) => handleMessageChange(e.target.value)}
          />
          <Tooltip
            label={
              !browserSupportsSpeechRecognition
                ? "Microphone not supported on this device"
                : isMicOn
                ? "Click to stop speaking"
                : "Click to start speaking"
            }
            placement="bottom-start"
            hasArrow
          >
            <InputRightElement
              m={"5px"}
              cursor="pointer"
              onClick={() => (isMicOn ? handleStop() : handleVoiceToText())}
            >
              {isMicOn ? (
                <MdOutlineStopCircle
                  className="animate-pulse"
                  size={25}
                  style={{
                    margin: "auto",
                    borderRadius: "50px",
                  }}
                />
              ) : (
                <FaMicrophone
                  color="black"
                  size={20}
                  style={{ margin: "auto" }}
                />
              )}
            </InputRightElement>
          </Tooltip>
        </InputGroup>

        <IoMdSend
          onClick={handleSendMessage}
          fontSize="30"
          style={{ margin: "auto", marginLeft: "10px", cursor: "pointer" }}
        />
      </FormControl>
    </Box>
  );
};

export default MessageDetails;
