import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Stack, useToast, Text, Skeleton } from "@chakra-ui/react";
import axios from "axios";
import { useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import CreateGroupModal from "./CreateGroupModal";

type headerProps = {
  user: {
    email: string;
    name: string;
    profileUrl: string;
    _id: string;
    token: string;
  };
  isLoadChatList: boolean;
};

const ChatList = ({ user, isLoadChatList }: headerProps) => {
  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChatList = () => {
    axios
      .get("api/chat", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setChats(res?.data);
      })
      .catch(() => {
        toast({
          title: "Error Occured",
          description: "Failed to load chats",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });
  };

  useEffect(() => {
    fetchChatList();
  }, [isLoadChatList]);

  const getSenderName = (currentUser, users) => {
    return users[0]._id === currentUser._id ? users[1].name : users[0].name;
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "30%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "25px", md: "27px" }}
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        Chats
        <CreateGroupModal user={user}>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "15px", lg: "17px" }}
            leftIcon={<AddIcon />}
          >
            Create Group
          </Button>
        </CreateGroupModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
        bg={"F8F8F8"}
      >
        {chats ? (
          <div>
            {chats?.length > 0 ? (
              <Stack overflowY="scroll">
                {chats?.map((chat) => (
                  <Box
                    cursor="pointer"
                    bg={selectedChat?._id === chat._id ? "#319795" : "#EDEBED"}
                    color={selectedChat?._id === chat._id ? "white" : "black"}
                    px={4}
                    py={3}
                    borderRadius="lg"
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <Text as="b">
                      {!chat.isGroupChat
                        ? getSenderName(user, chat?.users)
                        : chat.chatName}
                    </Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text textAlign={"center"} pt={30}>
                No chat found, Please search user for chat
              </Text>
            )}
          </div>
        ) : (
          <Stack>
            <Skeleton height="48px" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default ChatList;
