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
import axios from "axios";
import { useHistory } from "react-router-dom";
import { BASE_URL } from "../../common";

const SignUp = () => {
  const [name, setName] = useState<string | null>();
  const [email, setEmail] = useState<string | null>();
  const [password, setPassword] = useState<string | null>();
  const [confirmPassword, setConfirmPassword] = useState<string | null>();
  const [profileUrl, setProfileUrl] = useState<File | null>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const toast = useToast();
  const history = useHistory();

  const handleUploadPic = (file) => {
    setIsLoading(true);
    if (file === undefined) {
      toast({
        title: "Please add profile picture",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (file.type === "image/jpeg" || file.type === "image/png") {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "chathub-connect");
      data.append("cloud_name", "dh6zaartt");
      axios
        .post("https://api.cloudinary.com/v1_1/dh6zaartt/image/upload", data)
        .then((res) => {
          toast({
            title: "Profile picture uploaded successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
          setIsLoading(false);
          setProfileUrl(res?.data.url.toString());
        })
        .catch(() => {
          toast({
            title: "Failed to upload profile picture",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
          setIsLoading(false);
        });
    } else {
      toast({
        title: "Profile picture only support jpeg/png",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please fill all the fields",
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
    if (password !== confirmPassword) {
      toast({
        title: "password and confirm password does not match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setIsLoading(false);
      return;
    }

    axios
      .post(`${BASE_URL}api/user/register`, {
        name,
        email,
        password,
        profileUrl,
      })
      .then((res) => {
        toast({
          title: "Registration successful",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
        localStorage.setItem("loginInfo", JSON.stringify(res?.data));
        setIsLoading(false);
        history.push("/chats");
      })
      .catch((err) => {
        toast({
          title: "Registration failed",
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
        <FormControl id="name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
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
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="confirm-password" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your name"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowConfirmPassword(!showConfirmPassword);
                }}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="profile-picture">
          <FormLabel>Upload your picture</FormLabel>
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            placeholder="Enter your email"
            onChange={(e) => handleUploadPic(e?.target?.files[0])}
          />
        </FormControl>
        <Button
          colorScheme="teal"
          variant="solid"
          width="100%"
          style={{ marginTop: 15 }}
          isLoading={isLoading}
          type="submit"
        >
          Sign Up
        </Button>
      </VStack>
    </form>
  );
};

export default SignUp;
