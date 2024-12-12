import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { RecoilRoot } from "recoil";
import "./style/index.scss";
import {
  Login,
  Main,
  MyPage,
  OauthCallback,
  Poll,
  Search,
  Signup,
  Write,
} from "./page";
import { Header, ScrollToTop } from "./components";

function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <BrowserRouter>
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth-callback" element={<OauthCallback />} />
            <Route path="/write" element={<Write />} />
            <Route path="/poll/:pollId" element={<Poll />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/my" element={<MyPage />} />
            <Route path="/search/:searchTerm" element={<Search />} />
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </div>
  );
}

export default App;
