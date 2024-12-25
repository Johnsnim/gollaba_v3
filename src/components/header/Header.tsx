import { useLocation, useNavigate } from "react-router-dom";
import { Logo, SearchIcon } from "../../asset";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  userInfoState,
  isTokenState,
  userFavoritesState,
} from "../../recoil/atom";
import { jwtDecode } from "jwt-decode";
import UserApi from "../../services/user";

interface DecodedToken {
  exp?: number;
}

interface UserInfo {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  [key: string]: any;
}

const Header: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();

  const [isToken, setIsToken] = useRecoilState(isTokenState);
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const [userFavorites, setUserFavorites] = useRecoilState(userFavoritesState);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const checkToken = async () => {
      const token = getToken();

      if (token !== null) {
        console.log("토큰 있음!", token);
        setIsToken(true);
        try {
          const userInfoResponse = await UserApi.showUser(token);
          setUserInfo(userInfoResponse.data.data);

          // 좋아요 목록 가져오기
          const favoritesResponse = await UserApi.userFavorites();
          console.log("좋아요>>", favoritesResponse);
          setUserFavorites(favoritesResponse.data.data);
        } catch (error) {
          console.error("유저 정보 또는 좋아요 목록 불러오기 실패:", error);
        }
      } else {
        setIsToken(false);
        setUserInfo(null);
        setUserFavorites([]);
      }
    };

    checkToken();
  }, [loc.pathname, setIsToken, setUserInfo, setUserFavorites]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = getToken();
      setIsToken(token !== null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setIsToken]);

  useEffect(() => {
    setSearchTerm("");
  }, [loc.pathname]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchTerm.trim()) {
      nav(`/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
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
            <div
              className="MypageBtn"
              onClick={() => {
                nav("/my");
              }}
            >
              <img
                className="ProfileImage"
                src={userInfo?.profileImageUrl || "/default-profile.png"}
                alt="Profile"
              />
              <div className="Nickname">{userInfo?.name || "닉네임"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

function getToken(): string | null {
  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  try {
    const decodedToken: DecodedToken = jwtDecode(token);

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
