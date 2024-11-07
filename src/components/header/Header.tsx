import { useLocation, useNavigate } from "react-router-dom";
import { Logo, SearchIcon } from "../../asset";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // 'jwt-decode' 패키지는 기본적으로 default export 사용
import UserApi from "../../services/user";

interface UserInfo {
  id: string;
  nickname: string;
  [key: string]: any;
}

const Header = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const [isToken, setIsToken] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = getToken();

      if (token !== null) {
        console.log("토큰 있음!", token);
        setIsToken(true);
        // 토큰이 유효한 경우 유저 정보를 불러옵니다.
        try {
          const userInfo = await UserApi.showUser(token);
          setUserInfo(userInfo.data.data); // 데이터에 접근하여 상태에 설정합니다.
        } catch (error) {
          console.error("유저 정보 불러오기 실패:", error);
        }
      }
    };

    checkToken();
  }, []); // 'isToken'을 의존성 배열에서 제거, 토큰 검사는 한 번만 실행

  console.log("체크>", userInfo);

  if (loc.pathname === "/login") return null;

  return (
    <div className="Header">
      <div className="HeaderInner">
        <div className="HeaderLeft">
          <img
            src={Logo}
            alt="Logo"
            onClick={() => {
              nav("/");
            }}
          />
          <div
            className="Gollaba"
            onClick={() => {
              nav("/");
            }}
          >
            골라바
          </div>
          <div className="SearchBar">
            <img src={SearchIcon} alt="SearchIcon" />
            <input
              type="text"
              className="SearchTermInput"
              placeholder="제목으로 투표를 검색하세요."
            />
          </div>
        </div>

        <div className="HeaderRight">
          <div
            className="HeaderButton"
            style={{ backgroundColor: "#478AD1" }}
            onClick={() => {
              nav("/write");
            }}
          >
            투표 만들기
          </div>

          {!isToken ? (
            <div
              className="HeaderButton login"
              onClick={() => {
                nav("/login");
              }}
            >
              로그인
            </div>
          ) : (
            <div className="MypageBtn">
              <img className="ProfileImage" src={userInfo?.profileImageUrl} />
              <div className="Nickname">{userInfo?.name || "닉네임"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

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
