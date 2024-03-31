import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
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
import { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { CloseIcon } from "@chakra-ui/icons";

type headerProps = {
  children: any;
  user: {
    email: string;
    name: string;
    profileUrl: string;
    _id: string;
    token: string;
  };
};

const CreateGroupModal = ({ children, user }: headerProps) => {
  const [groupName, setGroupName] = useState<string>();
  const [selectedUsers, setSelectedUsers] = useState<headerProps["user"][]>([]);
  const [searchResult, setSearchResult] = useState<headerProps["user"][]>([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const { chats, setChats } = ChatState();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSearch = (event: { target: { value: string } }) => {
    const search = event?.target?.value;
    if (search === "") {
      return setSearchResult([]);
    }
    setLoading(true);
    axios
      .get(`/api/user?search=${search}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setSearchResult(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
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

  const handleCreateGroup = () => {
    if (!groupName) {
      toast({
        title: "Please add group name",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    if (selectedUsers.length < 2) {
      toast({
        title: "Please select atleast two user",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    axios
      .post(
        "/api/chat/group",
        {
          groupName: groupName,
          users: selectedUsers.map((u) => u._id),
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        setChats([res.data, ...chats]);
        setSelectedUsers([]);
        setGroupName("");
        setSearchResult([]);
        onClose();
        toast({
          title: "Group created successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      })
      .catch(() => {
        toast({
          title: "Error Occured",
          description: "Failed to create group",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });
  };

  const handleSelectUser = (user) => {
    if (!selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
  };

  const handleRemoveUser = (user) => {
    setSelectedUsers(
      selectedUsers.filter((selected) => selected._id !== user._id)
    );
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
            <FormControl>
              <Input
                placeholder="Group Name"
                mb={3}
                onChange={(e) => {
                  setGroupName(e.target.value);
                }}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add users"
                mb={1}
                onChange={(e) => {
                  handleSearch(e);
                }}
              />
            </FormControl>
            <Box display={"flex"} flexDir={"row"} flexWrap={"wrap"} w={"100%"}>
              {selectedUsers.map((user) => {
                return (
                  <Badge colorScheme="purple" m={1} key={user._id}>
                    {user.name}
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
            {loading ? (
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
                        onClick={() => handleSelectUser(user)}
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

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateGroup}>
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateGroupModal;
