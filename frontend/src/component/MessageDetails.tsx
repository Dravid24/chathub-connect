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
} from "@chakra-ui/react";
import { IoMdSend } from "react-icons/io";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import ScrollableFeed from "react-scrollable-feed";
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isSameUser,
} from "../common/util";
import io from "socket.io-client";
import typingIcon from "../assets/typing.gif";

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

  const { selectedChat, notification, setNotification } = ChatState();

  const toast = useToast();

  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnection(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    getAllMessage();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

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
  const handleSendMessage = async (e) => {
    if ((e.key === "Enter" || e.key === undefined) && currentMsg) {
      setCurrentMsg("");
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
  const handleMessageChange = (e) => {
    setCurrentMsg(e.target.value);

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

  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      justifyContent={"flex-end"}
      p={3}
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
                <div
                  style={{
                    backgroundColor: `${
                      message.sender._id === user._id ? "#B9F5D0" : "#fff"
                    }`,
                    marginLeft: isSameSenderMargin(
                      allMessages,
                      message,
                      i,
                      user._id
                    ),
                    marginTop: isSameUser(allMessages, message, i, user._id)
                      ? 3
                      : 10,
                    borderRadius: "6px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    width: "fit-content",
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </ScrollableFeed>
        </div>
      )}
      {isTyping && (
        <Image src={typingIcon} alt="Typing..." w={16} ml="25px" mb="-10px" />
      )}
      <FormControl
        onKeyDown={handleSendMessage}
        isRequired
        mt={3}
        display="flex"
      >
        <Input
          variant="outline"
          bgColor="#fff"
          size="lg"
          placeholder="Type a message"
          value={currentMsg}
          onChange={handleMessageChange}
        />
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
