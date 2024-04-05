import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useToast,
  FormControl,
  Input,
  Spinner,
  Image,
  List,
  ListItem,
  Text,
  Badge,
  Box,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { CloseIcon } from "@chakra-ui/icons";
// import { MdEdit } from "react-icons/md";
// import { IoCheckmarkSharp } from "react-icons/io5";

type headerProps = {
  children: any;
  user: {
    email: string;
    name: string;
    profileUrl: string;
    _id: string;
    token: string;
  };
  setIsLoadChatList: Dispatch<SetStateAction<boolean>>;
  isLoadChatList: boolean;
};

const EditGroupModal = ({
  children,
  user,
  setIsLoadChatList,
  isLoadChatList,
}: headerProps) => {
  const [groupName, setGroupName] = useState<string>();
  const [isEditGroupName, setIsEditGroupName] = useState<boolean>(false);
  const [isRenameLoading, setIsRenameLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<headerProps["user"][]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const toast = useToast();

  const { selectedChat, setSelectedChat } = ChatState();

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setGroupName(selectedChat.chatName);
    setSearchResult([]);
  }, [selectedChat]);

  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };

  const handleRenameGroup = () => {
    if (!groupName) return;

    setIsRenameLoading(true);
    axios
      .put(
        "/api/chat/group-rename",
        { chatId: selectedChat._id, chatName: groupName },
        config
      )
      .then((res) => {
        setSelectedChat(res.data);
        setIsLoadChatList(!isLoadChatList);
        setIsRenameLoading(false);
        setIsEditGroupName(false);
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
        setIsRenameLoading(false);
      });
  };

  const handleSearch = (event: { target: { value: string } }) => {
    const search = event?.target?.value;
    if (search === "") {
      return setSearchResult([]);
    }
    setIsLoadingSearch(true);
    axios
      .get(`/api/user?search=${search}`, config)
      .then((res) => {
        setSearchResult(res.data);
        setIsLoadingSearch(false);
      })
      .catch(() => {
        setIsLoadingSearch(false);
        toast({
          title: "Error Occured",
          description: "Failed to load search result",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });
  };

  const handleAddUser = (selectUser) => {
    if (selectedChat.users.find((u) => u._id === selectUser._id)) {
      toast({
        title: "User already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setSearchResult([]);
      return;
    }
    if (selectedChat?.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add users!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setSearchResult([]);
      return;
    }
    setIsLoadingSearch(true);
    axios
      .put(
        "/api/chat/add-user",
        { chatId: selectedChat._id, userId: selectUser._id },
        config
      )
      .then((res) => {
        setSelectedChat(res.data);
        setIsLoadChatList(!isLoadChatList);
        setSearchResult([]);
        setIsLoadingSearch(false);
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
        setIsLoadingSearch(false);
      });
  };

  const handleRemoveUser = (selectUser) => {
    if (selectedChat?.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can remove users!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    if (selectedChat?.groupAdmin._id === selectUser._id) {
      toast({
        title: "Admin cannot remove from the group",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    setIsLoadingSearch(true);
    axios
      .put(
        "/api/chat/remove-user",
        {
          chatId: selectedChat._id,
          userId: selectUser._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      .then((res) => {
        setSelectedChat(res.data);
        setIsLoadChatList(!isLoadChatList);
        setIsLoadingSearch(false);
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
        setIsLoadingSearch(false);
      });
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
            <FormControl display={"flex"}>
              <Input
                placeholder="Group Name"
                mb={3}
                mr={1}
                value={groupName}
                disabled={!isEditGroupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                }}
              />
              <Button
                onClick={() =>
                  !isEditGroupName
                    ? setIsEditGroupName(true)
                    : handleRenameGroup()
                }
                p={0}
                isLoading={isRenameLoading}
              >
                {/* {isEditGroupName ? (
                  <IoCheckmarkSharp fontSize={25} />
                ) : (
                  <MdEdit fontSize={25} />
                )} */}
              </Button>
            </FormControl>
            <Text w={"100%"} p={2} as="b">
              Group Members ({selectedChat.users.length})
            </Text>
            <Box
              display={"flex"}
              flexDir={"row"}
              flexWrap={"wrap"}
              w={"100%"}
              mb={2}
            >
              {selectedChat.users.map((user) => {
                return (
                  <Badge
                    colorScheme={
                      selectedChat?.groupAdmin._id === user._id
                        ? "green"
                        : "purple"
                    }
                    m={1}
                    key={user._id}
                  >
                    {user.name}
                    {selectedChat?.groupAdmin._id === user._id && " (admin)"}
                    <CloseIcon
                      mb={1}
                      ml={2}
                      cursor="pointer"
                      onClick={() => handleRemoveUser(user)}
                    />
                  </Badge>
                );
              })}
            </Box>
            <FormControl>
              <Input
                placeholder="Add users"
                mb={1}
                onChange={(e) => {
                  handleSearch(e);
                }}
              />
            </FormControl>
            {isLoadingSearch ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spinner />
              </div>
            ) : (
              <div className="search-result">
                {searchResult?.map((user, i) => {
                  return (
                    <List spacing={3} key={i}>
                      <ListItem
                        className="search-result-list"
                        onClick={() => handleAddUser(user)}
                      >
                        <Image
                          borderRadius="full"
                          boxSize="40px"
                          src={user.profileUrl}
                          alt={user.name}
                          boxShadow="0px 0px 4px 0px black"
                        />
                        <div style={{ marginLeft: "10px" }}>
                          <Text as="b">{user.name}</Text>
                          <Text fontSize="md" mt={"-8px"}>
                            {user.email}
                          </Text>
                        </div>
                      </ListItem>
                    </List>
                  );
                })}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditGroupModal;
