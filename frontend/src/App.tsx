import "./App.css";
import Chat from "./pages/Chat";
import { Route } from "react-router-dom";
import Authentication from "./pages/Authentication";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

function App() {
  const history = useHistory();
  useEffect(() => {
    const userDetails = localStorage.getItem("loginInfo");
    if (userDetails) {
      history.push("/chats");
    } else {
      history.push("/");
    }
  }, [history]);
  return (
    <div className="App">
      <Route exact path="/" component={Authentication} />
      <Route exact path="/chats" component={Chat} />
    </div>
  );
}

export default App;
