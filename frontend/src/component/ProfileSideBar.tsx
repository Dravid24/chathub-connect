import { ArrowBackIcon, LockIcon } from "@chakra-ui/icons";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Image,
  Text,
} from "@chakra-ui/react";
// import { useHistory } from "react-router-dom";

type sideBarProps = {
  isOpenProfile: boolean;
  onCloseProfile: () => void;
  user: {
    email: string;
    name: string;
    profileUrl: string;
    _id: string;
    token: string;
  };
};

const ProfileSideBar = ({
  isOpenProfile,
  onCloseProfile,
  user,
}: sideBarProps) => {
  // const history = useHistory();

  const handleLogout = () => {
    localStorage.clear();
    // history.push("/");
  };
  return (
    <Drawer isOpen={isOpenProfile} placement="right" onClose={onCloseProfile}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <ArrowBackIcon
            fontSize="2xl"
            mb={1}
            mr={4}
            cursor="pointer"
            onClick={() => onCloseProfile()}
          />
          Profile
        </DrawerHeader>

        <DrawerBody>
          <Image
            borderRadius="full"
            boxSize="150px"
            src={user.profileUrl}
            alt={user.name}
            boxShadow="0px 0px 4px 0px black"
            m="40px auto"
          />
          <Text className="profile-title">Name</Text>
          <Text fontSize="xl">{user.name}</Text>
          <Text className="profile-title">Email</Text>
          <Text fontSize="xl">{user.email}</Text>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Text w="100%" cursor="pointer" onClick={() => handleLogout()}>
            <LockIcon color="gray.700" fontSize="xl" mb={2} mr={2} /> Logout
          </Text>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileSideBar;
