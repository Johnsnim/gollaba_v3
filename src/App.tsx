import React, { useEffect } from "react";
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
import { isTokenExpired, refreshToken } from "./api/auth";

const TokenChecker = () => {
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) return;

      if (isTokenExpired(accessToken)) {
        console.log("토큰만료");
        const newToken = await refreshToken();
        if (newToken) {
          console.log("새토큰 발급");
          localStorage.setItem("accessToken", newToken);
        } else {
          console.log("갱신실패 -> 로그아웃 처리");
          localStorage.removeItem("accessToken");
        }
      }
    };

    checkToken();
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <BrowserRouter>
          <ScrollToTop />
          <Header />
          <TokenChecker />
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
