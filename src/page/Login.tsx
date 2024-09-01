import React from "react";
import { GithubLogo, KakaoLogo, Logo } from "../asset";

const Login = () => {
  return (
    <div className="Login">
      <div className="LoginInner">
        <div className="UpperPartContainer">
          <img src={Logo} className="LoginIcon" alt="Logo" />
          <div className="Title">골라바</div>
        </div>

        <div className="LowerPartContainer">
          <div className="LoginBox">
            <img src={GithubLogo} className="ProviderIcon" alt="GithubLogo" />
            <p className="StartWithProvider">Github 계정으로 시작하기</p>
          </div>

          <div className="LoginBox">
            <img src={KakaoLogo} className="ProviderIcon" alt="GithubLogo" />
            <p className="StartWithProvider"> Kakao 계정으로 시작하기</p>
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
