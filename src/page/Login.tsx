import React from "react";
import { GithubLogo, HomeIcon, KakaoLogo, Logo } from "../asset";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const nav = useNavigate();

  const handleLoginClick = (provider: "github" | "kakao"): void => {
    const host = window.location.origin;
    const redirectUri = `https://api.gollaba.app/oauth2/authorize/${provider}?redirect_uri=${host}/oauth-callback`;
    window.location.href = redirectUri;
  };

  return (
    <div className="Login">
      <div className="LoginInner">
        <div
          className="HomeButton"
          onClick={() => {
            nav("/");
          }}
        >
          <img src={HomeIcon} alt="HomeIcon" />
          <div>메인페이지 가기</div>
        </div>
        <div className="UpperPartContainer">
          <img src={Logo} className="LoginIcon" alt="Logo" />
          <div className="Title">골라바</div>
        </div>

        <div className="LowerPartContainer">
          <div className="LoginBox" onClick={() => handleLoginClick("github")}>
            <img src={GithubLogo} className="ProviderIcon" alt="GithubLogo" />
            <p className="StartWithProvider">Github 계정으로 시작하기</p>
          </div>

          <div className="LoginBox" onClick={() => handleLoginClick("kakao")}>
            <img src={KakaoLogo} className="ProviderIcon" alt="GithubLogo" />
            <p className="StartWithProvider">Kakao 계정으로 시작하기</p>
          </div>
        </div>
        <div className="Copyright">
          © 2024 Team Gollaba All rights reserved.
        </div>
      </div>
    </div>
  );
};
export default Login;
