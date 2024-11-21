import React, { useState, useEffect } from "react";
import UserApi from "../services/user";
import VoteApi from "../services/vote";
import { jwtDecode } from "jwt-decode";
import { Gear, Check, Cancel, AnonymousIcon, IdentifiedIcon } from "../asset";
import { useNavigate } from "react-router-dom";

interface UserInfo {
  id: string;
  nickname: string;
  profileImageUrl?: string;
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
  const [isToken, setIsToken] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
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
    const fetchMyPolls = async () => {
      if (!userInfo) return;
      try {
        const response = await VoteApi.getMyPolls(currentPage, 10);
        setPolls(response.data.data.items || []);
        setTotalPages(response.data.data.totalPage || 1);
      } catch (error) {
        console.error("투표 목록 불러오기 실패:", error);
      }
    };

    fetchMyPolls();
  }, [userInfo, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
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
        formData.append("profileImage", target.files[0]);
        try {
          const response = await UserApi.changeImage(formData);
          setUserInfo((prev) =>
            prev
              ? { ...prev, profileImageUrl: response.data.data.profileImageUrl }
              : prev
          );
        } catch (error) {
          console.error("프로필 이미지 변경 실패:", error);
        }
      }
    };
    fileInput.click();
  };

  return (
    <div className="MyPage">
      <div className="Inner">
        <div className="TopBox">
          <img
            className="Profile"
            src={userInfo?.profileImageUrl}
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
                    onClick={handleEditNickname}
                    className="Icon"
                  />
                </>
              )}
            </div>
            <div className="Email">
              {userInfo?.email || "example@gmail.com"}
            </div>
          </div>
        </div>

        <div className="UnderBox">
          <div className="Numbering">작성한 투표 : {polls.length}개</div>
          <div className="PollList">
            <div className="PollHeader">
              <div>제목</div>
              <div>조회수</div>
              <div>옵션</div>
              <div>종료일</div>
              <div>마감여부</div>
            </div>
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="PollItem"
                onClick={() => nav(`/poll/${poll.id}`)}
              >
                <div className="PollTitle">{poll.title}</div>
                <div className="PollReadCounts">{poll.readCount}</div>
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
                  <div className="Now">
                    {new Date(poll.endAt) < new Date() ? "종료됨" : "진행중"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="Pagination">
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              이전 페이지
            </button>
            <span>
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              다음 페이지
            </button>
          </div>
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
