import {
  Avatar,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Image,
  useDisclosure,
  List,
  ListItem,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, Search2Icon } from "@chakra-ui/icons";
import React, { useState } from "react";
import ProfileSideBar from "./ProfileSideBar";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";

type headerProps = {
  user: {
    email: string;
    name: string;
    profileUrl: string;
    _id: string;
    token: string;
  };
};

const Header = ({ user }: headerProps) => {
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [searchResult, setSearchResult] = useState<headerProps["user"][]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  const { setSelectedChat, chats, setChats } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef(null);

  const onCloseProfile = () => {
    setIsOpenProfile(false);
  };

  const handleSearch = (event: { target: { value: string } }) => {
    const search = event?.target?.value;
    setSearchValue(search);
    if (search === "") {
      return setSearchResult([]);
    }
    setIsLoadingUser(true);
    axios
      .get(`/api/user?search=${search}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setSearchResult(res.data);
        setIsLoadingUser(false);
      })
      .catch(() => {
        setIsLoadingUser(false);
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

  const handleSelectedChat = (id: string) => {
    axios
      .post(
        "/api/chat",
        { userId: id },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        if (!chats.find((c: { _id: string }) => c._id === res.data._id)) {
          setChats([res?.data, ...chats]);
        }
        setSelectedChat(res?.data);
        setSearchResult([]);
        onClose();
      })
      .catch((error) => {
        setSearchResult([]);
        onClose();
        toast({
          title: "Unable to fetch chat",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="10px"
        borderWidth="7px"
      >
        <Text fontSize={"2xl"} className="app-name">
          ChatHub Connect
        </Text>
        <InputGroup w="40%" ml="-30px">
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.300" />
          </InputLeftElement>
          <Input type="text" placeholder="Search User" onClick={onOpen} />
        </InputGroup>
        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize="2xl" m={1} mr={4} />
            </MenuButton>
          </Menu>
          <Avatar
            m="4px"
            size="sm"
            name={user.name}
            src={user.profileUrl}
            cursor="pointer"
            onClick={() => setIsOpenProfile(true)}
            boxShadow="0px 0px 2px 0px black"
          />
        </div>
      </Box>
      <ProfileSideBar
        isOpenProfile={isOpenProfile}
        onCloseProfile={onCloseProfile}
        user={user}
      />
      {isOpen && (
        <Modal
          initialFocusRef={initialRef}
          isOpen={isOpen}
          onClose={onClose}
          size={"xl"}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalBody p={6}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Search2Icon color="gray.300" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Search User"
                  ref={initialRef}
                  mb={3}
                  onChange={handleSearch}
                />
              </InputGroup>
              {!isLoadingUser && searchValue && searchResult.length === 0 && (
                <div style={{ textAlign: "center", padding: "10px" }}>
                  No Result Found
                </div>
              )}
              {isLoadingUser ? (
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
                          onClick={() => handleSelectedChat(user._id)}
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
      )}
    </>
  );
};

export default Header;
