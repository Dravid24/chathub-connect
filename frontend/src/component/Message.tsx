import React from "react";
import {
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Dispatch, SetStateAction } from "react";
import { LiaEllipsisVSolid } from "react-icons/lia";
import axios from "axios";
import EditGroupModal from "./EditGroupModal";
import MessageDetails from "./MessageDetails";
import { generateRandomDarkColor } from "../common/util";

type messageProps = {
  user: {
    email: string;
    name: string;
    profileUrl: string;
    _id: string;
    token: string;
  };
  isLoadChatList: boolean;
  setIsLoadChatList: Dispatch<SetStateAction<boolean>>;
};

const Message = ({ user, isLoadChatList, setIsLoadChatList }: messageProps) => {
  const { selectedChat, setSelectedChat } = ChatState();

  const toast = useToast();

  const getSenderName = (currentUser, users) => {
    return users[0]._id === currentUser._id ? users[1].name : users[0].name;
  };

  const getSenderProfile = (currentUser, users) => {
    return users[0]._id === currentUser._id
      ? users[1].profileUrl
      : users[0].profileUrl;
  };

  const handleLeave = (user) => {
    axios
      .put(
        "/api/chat/remove-user",
        {
          chatId: selectedChat._id,
          userId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then(() => {
        setSelectedChat();
        setIsLoadChatList(!isLoadChatList);
      })
      .catch((err) => {
        toast({
          title: "Error Occured",
          description: err.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });
  };

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      bg="white"
      w={{ base: "100%", md: "69%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: "20px", md: "22px" }}
            p={3}
            mx={2}
            w="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            bg={"#e8e8e8"}
          >
            <Box display="flex">
              <ArrowBackIcon
                fontSize="xl"
                display={{ base: "flex", md: "none" }}
                cursor="pointer"
                mr={3}
                mt={1}
                onClick={() => setSelectedChat("")}
              />
              <Avatar
                mr={4}
                size="sm"
                name={
                  !selectedChat.isGroupChat
                    ? getSenderName(user, selectedChat?.users)
                    : selectedChat.chatName
                }
                src={
                  !selectedChat.isGroupChat
                    ? getSenderProfile(user, selectedChat?.users)
                    : selectedChat.chatName
                }
                bg={generateRandomDarkColor()}
                color={"#fff"}
                cursor="pointer"
                boxShadow="0px 0px 2px 0px black"
              />
              {!selectedChat.isGroupChat ? (
                <>{getSenderName(user, selectedChat.users)}</>
              ) : (
                <>{selectedChat.chatName}</>
              )}
            </Box>
            {selectedChat.isGroupChat && (
              <Menu>
                <MenuButton mr={3}>
                  <LiaEllipsisVSolid fontSize={25} />
                </MenuButton>
                <MenuList>
                  <EditGroupModal
                    user={user}
                    setIsLoadChatList={setIsLoadChatList}
                    isLoadChatList={isLoadChatList}
                  >
                    <MenuItem fontSize={"medium"}>Group Info/Edit</MenuItem>
                  </EditGroupModal>
                  <MenuItem
                    fontSize={"medium"}
                    bgColor={"#ff3333"}
                    color={"#FFF"}
                    onClick={() => handleLeave(user)}
                  >
                    Leave Group
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Box>
          <MessageDetails
            user={user}
            isLoadChatList={isLoadChatList}
            setIsLoadChatList={setIsLoadChatList}
          />
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="2xl" p={3}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Message;
