/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import ChatProvider from "./Context/ChatProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ChatProvider>
    <BrowserRouter>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </ChatProvider>
);
