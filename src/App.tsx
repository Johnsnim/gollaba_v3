import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { RecoilRoot } from "recoil";
import "./style/index.scss";
import { Login, Main, OauthCallback, Poll, Signup, Write } from "./page";
import { Header } from "./components";

function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth-callback" element={<OauthCallback />} />
            <Route path="/write" element={<Write />} />
            <Route path="/poll/:pollId" element={<Poll />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </div>
  );
}

export default App;
