/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { FormEvent, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState<string | null>();
  const [password, setPassword] = useState<string | null>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toast = useToast();
  const history = useHistory();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (!email || !password) {
      toast({
        title: "Email and Password is required",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    }
    if (email) {
      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Invalid email",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
        setIsLoading(false);
        return;
      }
    }

    axios
      .post(`/api/user/login`, {
        email,
        password,
      })
      .then((res) => {
        localStorage.setItem("loginInfo", JSON.stringify(res?.data));
        setIsLoading(false);
        history.push("/chats");
      })
      .catch((err) => {
        toast({
          title: "Failed to login",
          description: err.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <VStack spacing={"7px"}>
        <FormControl id="email" isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your name"
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
                isLoading={isLoading}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          colorScheme="teal"
          variant="solid"
          width="100%"
          style={{ marginTop: 15 }}
          type="submit"
        >
          Login
        </Button>
      </VStack>
    </form>
  );
};

export default Login;
