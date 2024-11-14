import React, { useState, useEffect } from "react";
import UserApi from "../services/user";
import { jwtDecode } from "jwt-decode";
import { Gear } from "../asset";

interface UserInfo {
  id: string;
  nickname: string;
  [key: string]: any;
}

const MyPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isToken, setIsToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = getToken();

      if (token !== null) {
        console.log("토큰 있음!", token);
        setIsToken(true);
        try {
          const userInfo = await UserApi.showUser(token);
          setUserInfo(userInfo.data.data);
        } catch (error) {
          console.error("유저 정보 불러오기 실패:", error);
        }
      } else {
        setIsToken(false);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    console.log("userInfo", userInfo);
  }, [userInfo]);

  return (
    <div className="MyPage">
      <div className="Inner">
        <div className="TopBox">
          <img className="Profile" src={userInfo?.profileImageUrl} />
          <div className="Detail">
            <div className="Nickname">
              {userInfo?.name || "닉네임"} <img src={Gear} alt="Gear" />
            </div>
            <div className="Email">
              {userInfo?.email || "example@gmail.com"}
            </div>
          </div>
        </div>

        <div className="UnderBox">
          <div className="Numbering">작성한 투표 : 10개</div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;

function getToken() {
  const token = localStorage.getItem("accessToken");

  if (token === null) return null;

  try {
    const decodedToken: { exp?: number } = jwtDecode(token);

    if (!decodedToken.exp) return null;

    const expiredDate = new Date(decodedToken.exp * 1000);
    const now = new Date();

    if (expiredDate < now) return null;

    return token;
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}
