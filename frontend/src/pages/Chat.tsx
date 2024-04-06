import React from "react";
import { useState } from "react";
import { Box } from "@chakra-ui/react";
import Header from "../component/Header";
import ChatList from "../component/ChatList";
import Message from "../component/Message";

const Chat = () => {
  const [isLoadChatList, setIsLoadChatList] = useState(false);

  const userDetails = localStorage.getItem("loginInfo");
  const user = userDetails && JSON.parse(userDetails);
  return (
    <div style={{ width: "100%" }}>
      {user && (
        <div>
          <Header user={user} />
          <Box
            display="flex"
            justifyContent="space-between"
            w="100%"
            h="90vh"
            p="10px"
          >
            <ChatList user={user} isLoadChatList={isLoadChatList} />
            <Message
              user={user}
              isLoadChatList={isLoadChatList}
              setIsLoadChatList={setIsLoadChatList}
            />
          </Box>
        </div>
      )}
    </div>
  );
};

export default Chat;
