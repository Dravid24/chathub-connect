import React from "react";
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "../component/authentication/Login";
import SignUp from "../component/authentication/SignUp";

const Authentication = () => {
  return (
    <Container maxW="xl" centerContent>
      <Box
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m={"40px 0px 15px 0px"}
        borderRadius="lg"
        borderWidth="1px"
        boxShadow="md"
      >
        <Text fontSize={"4xl"} className="app-name">
          ChatHub Connect
        </Text>
        <hr />
        <Tabs variant="soft-rounded" colorScheme="teal">
          <TabList mb="1em" mt="1em">
            <Tab width="50%">Login</Tab>
            <Tab width="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Authentication;
