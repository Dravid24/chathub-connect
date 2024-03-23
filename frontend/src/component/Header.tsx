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
} from "@chakra-ui/react";
import { BellIcon, Search2Icon } from "@chakra-ui/icons";
import React, { useState } from "react";
import ProfileSideBar from "./ProfileSideBar";

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

  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef(null);

  const onCloseProfile = () => {
    setIsOpenProfile(false);
  };

  const data = [
    {
      email: "dravid@gmail.com",
      name: "dravid",
      profileUrl:
        "https://res.cloudinary.com/dh6zaartt/image/upload/v1704211103/n9aczmu8518qbecj7knj.jpg",
    },
  ];

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
                />
              </InputGroup>
              <div className="search-result">
                {data?.map((user, i) => {
                  return (
                    <List spacing={3} key={i}>
                      <ListItem className="search-result-list">
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
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Header;
