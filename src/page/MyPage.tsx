import React, { useState, useEffect } from "react";
import UserApi from "../services/user";
import VoteApi from "../services/vote";
import { jwtDecode } from "jwt-decode";
import { Gear, Check, Cancel, AnonymousIcon, IdentifiedIcon } from "../asset";
import { useNavigate } from "react-router-dom";

interface UserInfo {
  id: string;
  name: string;
  profileImageUrl?: string;
  email: string;
  [key: string]: any;
}

interface Poll {
  id: string;
  title: string;
  readCount: number;
  pollType: string;
  endAt: string;
}

const MyPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isToken, setIsToken] = useState<boolean>(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [myPollsPage, setMyPollsPage] = useState<number>(0);
  const [favoritesPage, setFavoritesPage] = useState<number>(0);
  const [myPollsTotalPages, setMyPollsTotalPages] = useState<number>(1);
  const [favoritesTotalPages, setFavoritesTotalPages] = useState<number>(1);
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"myPolls" | "favorites">(
    "myPolls"
  );
  const nav = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = getToken();

      if (token !== null) {
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
    const fetchPolls = async () => {
      if (!userInfo) return;

      try {
        let response;
        if (activeTab === "myPolls") {
          response = await VoteApi.getMyPolls(myPollsPage, 8);
          setPolls(response.data.data.items || []);
          setMyPollsTotalPages(response.data.data.totalPage || 1);
        } else {
          response = await VoteApi.getFavorites(favoritesPage, 8);
          setPolls(response.data.data.items || []);
          setFavoritesTotalPages(response.data.data.totalPage || 1);
        }
      } catch (error) {
        console.error("투표 목록 불러오기 실패:", error);
      }
    };

    fetchPolls();
  }, [userInfo, myPollsPage, favoritesPage, activeTab]);

  const handleNextPage = () => {
    if (activeTab === "myPolls" && myPollsPage < myPollsTotalPages - 1) {
      setMyPollsPage(myPollsPage + 1);
    } else if (
      activeTab === "favorites" &&
      favoritesPage < favoritesTotalPages - 1
    ) {
      setFavoritesPage(favoritesPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (activeTab === "myPolls" && myPollsPage > 0) {
      setMyPollsPage(myPollsPage - 1);
    } else if (activeTab === "favorites" && favoritesPage > 0) {
      setFavoritesPage(favoritesPage - 1);
    }
  };

  const handleTabChange = (tab: "myPolls" | "favorites") => {
    setActiveTab(tab);
  };

  const handleEditNickname = () => {
    setIsEditingNickname(true);
    setNewNickname(userInfo?.nickname || "");
  };
  const handleCancelEdit = () => {
    setIsEditingNickname(false);
    setNewNickname("");
  };
  const handleSaveNickname = async () => {
    if (!newNickname.trim()) return;
    try {
      await UserApi.changeName({ name: newNickname });
      setUserInfo((prev) => (prev ? { ...prev, nickname: newNickname } : prev));
      setIsEditingNickname(false);
      window.location.reload();
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
    }
  };
  const handleProfileImageClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const formData = new FormData();
        formData.append("image", target.files[0]);
        try {
          const response = await UserApi.changeImage(formData);
          setUserInfo((prev) =>
            prev
              ? { ...prev, profileImageUrl: response.data.data.profileImageUrl }
              : prev
          );
          window.location.reload();
        } catch (error) {
          console.error("프로필 이미지 변경 실패:", error);
        }
      }
    };
    fileInput.click();
  };

  const currentPage = activeTab === "myPolls" ? myPollsPage : favoritesPage;
  const totalPages =
    activeTab === "myPolls" ? myPollsTotalPages : favoritesTotalPages;

  return (
    <div className="MyPage">
      <div className="Inner">
        <div className="TopBox">
          <img
            className="Profile"
            src={userInfo?.profileImageUrl || "default-profile.png"}
            alt="Profile"
            onClick={handleProfileImageClick}
          />
          <div className="Detail">
            <div className="Nickname">
              {isEditingNickname ? (
                <>
                  <input
                    type="text"
                    placeholder="새 닉네임 *"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                  />
                  <img
                    src={Check}
                    alt="Save"
                    onClick={handleSaveNickname}
                    className="Icon"
                  />
                  <img
                    src={Cancel}
                    alt="Cancel"
                    onClick={handleCancelEdit}
                    className="Icon"
                  />
                </>
              ) : (
                <>
                  {userInfo?.name || "닉네임"}
                  <img
                    src={Gear}
                    alt="Edit"
                    onClick={() => setIsEditingNickname(true)}
                    className="Icon"
                  />
                </>
              )}
            </div>
            <div className="Email">
              {userInfo?.email || "example@gmail.com"}
            </div>

            <button
              className="Logout"
              onClick={() => {
                localStorage.removeItem("accessToken");
                setIsToken(false);
                setUserInfo(null);
                nav("/");
              }}
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="UnderBox">
          <div className="Tabs">
            <button
              className={`TabButton ${activeTab === "myPolls" ? "active" : ""}`}
              onClick={() => handleTabChange("myPolls")}
            >
              작성한 투표
            </button>
            <button
              className={`TabButton ${
                activeTab === "favorites" ? "active" : ""
              }`}
              onClick={() => handleTabChange("favorites")}
            >
              좋아요한 투표
            </button>
          </div>
          <div className="PollList">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="PollItem"
                onClick={() => nav(`/poll/${poll.id}`)}
              >
                <div className="PollTitle">{poll.title}</div>
                <div className="PollReadCounts">조회수 : {poll.readCount}</div>
                <div className="PollTypes">
                  <img
                    src={
                      poll.pollType === "NAMED" ? IdentifiedIcon : AnonymousIcon
                    }
                  />
                  {poll.pollType === "NAMED" ? "기명투표" : "익명투표"}
                </div>
                <div className="PollEndDate">
                  {new Date(poll.endAt).toLocaleDateString()}
                </div>
                <div
                  className={`PollIsExpired ${
                    new Date(poll.endAt) < new Date() ? "Expired" : ""
                  }`}
                >
                  {new Date(poll.endAt) < new Date() ? "종료됨" : "진행중"}
                </div>
              </div>
            ))}
          </div>
          <div className="Pagination">
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              이전
            </button>
            <span>
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;

function getToken(): string | null {
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
