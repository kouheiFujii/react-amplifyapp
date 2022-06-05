import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { withAuthenticator } from "@aws-amplify/ui-react";

function App({ signOut, user }) {
  return (
    <div className="App">
      <header>
        <img src={logo} className="App-logo" alt="logo" />
        <h1>We now have Auth!</h1>
      </header>
      <h1>Hello {user.username}</h1>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

// プラグインが提供する認証コンポーネントでラップする
export default withAuthenticator(App);
