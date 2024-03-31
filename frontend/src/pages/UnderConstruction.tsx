import { Button, Container, Text } from "@chakra-ui/react";
import Development from "../assets/development.svg";
import { useHistory } from "react-router-dom";

const UnderConstruction = () => {
  const history = useHistory();
  const userDetails = localStorage.getItem("loginInfo");
  let userName = null;
  if (userDetails) {
    const user = JSON.parse(userDetails);
    userName = user.name;
  }

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };

  return (
    <Container maxW="xl" centerContent justifyContent="center">
      <Text fontSize={"3xl"} className="app-name">
        Hi {userName ?? "Guest"}
      </Text>
      <Text fontSize={"2xl"}>Welcome to ChatHub Connect</Text>

      <img
        src={Development}
        alt="development"
        className="under-development-image"
      />
      <Text fontSize={"3xl"}>Still under development</Text>
      <Button
        style={{ marginTop: 15 }}
        colorScheme="teal"
        variant="solid"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Container>
  );
};

export default UnderConstruction;
