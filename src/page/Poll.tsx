import React, { useState, useEffect } from "react";
import {
  AnonymousIcon,
  BronzeCrown,
  Crown,
  IdentifiedIcon,
  ImageIcon,
  Leaderboard,
  LeftArrow,
  manualVoting,
  MinusButton,
  MultipleVote,
  PlusIcon,
  SilverCrown,
  SingleVote,
  Temp,
  ViewIcon,
  VoteActive,
  VoteBtn,
  VoteInactive,
} from "../asset";
import VoteApi from "../services/vote";
import { useNavigate, useParams } from "react-router-dom";
import UserApi from "../services/user";
import { useRecoilState } from "recoil";
import { userFavoritesState, userInfoState } from "../recoil/atom";
import { set } from "date-fns";

type PollData = {
  id: string;
  title: string;
  creatorName: string;
  creatorProfileUrl: string | null;
  responseType: "SINGLE" | "MULTIPLE";
  pollType: "ANONYMOUS" | "NAMED";
  endAt: string;
  totalVotingCount: number;
  items: PollItem[];
};

type PollItem = {
  id: number;
  description: string;
  imageUrl: string | null;
  votingCount: number;
};

type Params = {
  pollId: string;
};

const Modal: React.FC<{
  message: string;
  onClose: () => void;
  redirect?: boolean;
  redirectPath?: string;
}> = ({ message, onClose, redirect, redirectPath }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (redirect && redirectPath) {
      navigate(redirectPath);
    } else {
      onClose();
    }
  };

  return (
    <div className="ModalBackdrop" onClick={handleClose}>
      <div className="card">
        <div className="tools">
          <div className="circle">
            <span className="red box"></span>
          </div>
          <div className="circle">
            <span className="yellow box"></span>
          </div>
          <div className="circle">
            <span className="green box"></span>
          </div>
        </div>
        <div className="CardContent">
          <div>{message}</div>
          <button onClick={handleClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

const Poll: React.FC = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isRedirect, setIsRedirect] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string>("");

  const [userInfo] = useRecoilState(userInfoState);
  //투표 여부 확인용 변수
  const [tempFlag, setTempFlag] = useState(false);

  //투표 마감 여부 확인용 변수
  const [isExpired, setIsExpired] = useState(false);

  const [voteOptions, setVoteOptions] = useState<PollItem[]>([]);
  const [data, setData] = useState<PollData | null>(null);
  const [namedNickname, setNamedNickname] = useState<string>("");
  const { pollId } = useParams<Params>();

  const [selectedOptionIndexes, setSelectedOptionIndexes] = useState<number[]>(
    []
  );
  const [userFavorites, setUserFavorites] = useRecoilState(userFavoritesState);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const response = await UserApi.readCount(pollId);
      } catch (error) {
        console.log(error);
      }
    };
    fetchViewCount();
  }, [pollId]);

  useEffect(() => {
    const fetchPollDataAndVoteCheck = async () => {
      try {
        const response = await VoteApi.getPoll(pollId);
        if (response.status === 200) {
          console.log("Fetched Poll Data:", response.data.data);
          const pollData = response.data.data;
          setData(pollData);
          setVoteOptions(pollData.items || []);

          console.log("폴데이터", pollData);

          const isExpiredNow = new Date(pollData.endAt) < new Date();
          setIsExpired(isExpiredNow);

          if (isExpiredNow) {
            setTempFlag(true);
          } else {
            const voteResponse = await VoteApi.isVoted({ pollHashId: pollId });
            if (
              voteResponse.status === 200 &&
              voteResponse.data.data === true
            ) {
              setTempFlag(true);
            } else {
              setTempFlag(false);
            }
          }
        }
      } catch (error) {
        console.error(
          "Failed to fetch poll data or check voting status",
          error
        );
      }
    };

    fetchPollDataAndVoteCheck();
  }, [pollId]);

  useEffect(() => {
    if (pollId) {
      setIsLiked(userFavorites.includes(pollId));
    }
  }, [userFavorites, pollId]);

  const toggleLike = async () => {
    if (!userInfo) {
      setModalMessage("로그인 후 이용 가능한 서비스입니다.");
      setOpenModal(true);
      setIsRedirect(true);
      setRedirectPath("/login");
    }

    try {
      if (isLiked) {
        await VoteApi.offFavorites(pollId);
        setUserFavorites((prev) => prev.filter((id) => id !== pollId));
      } else {
        await VoteApi.onFavorites(pollId);
        setUserFavorites((prev) => [...prev, pollId as string]);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleOptionClick = (index: number) => {
    if (isExpired) return;

    if (data?.responseType === "SINGLE") {
      if (selectedOptionIndexes.includes(index)) {
        setSelectedOptionIndexes([]);
      } else {
        setSelectedOptionIndexes([index]);
      }
    } else if (data?.responseType === "MULTIPLE") {
      if (selectedOptionIndexes.includes(index)) {
        setSelectedOptionIndexes((prevIndexes) =>
          prevIndexes.filter((i) => i !== index)
        );
      } else {
        setSelectedOptionIndexes((prevIndexes) => [...prevIndexes, index]);
      }
    }
  };

  const ClickVoteButton = async () => {
    if (selectedOptionIndexes.length === 0) {
      setModalMessage("옵션을 선택해주세요.");
      setOpenModal(true);
      return;
    }

    const selectedOptions = selectedOptionIndexes.map(
      (index) => voteOptions[index]
    );

    if (selectedOptions.length === 0) {
      setModalMessage("유효한 옵션을 선택해주세요.");
      setOpenModal(true);
      return;
    }

    try {
      const payload = {
        pollHashId: pollId,
        pollItemIds: selectedOptions.map((option) => option.id),
        voterName: userInfo?.name || "test",
      };

      let response;

      if (tempFlag) {
        const chosen = await VoteApi.chosenItem(pollId);

        response = await VoteApi.voteEdit(chosen.data.data.id, {
          pollItemIds: selectedOptions.map((option) => option.id),
        });
      } else {
        response = await VoteApi.vote(payload);
      }

      if (response.status === 200) {
        setModalMessage(
          tempFlag ? "투표가 수정되었습니다." : "투표가 완료되었습니다."
        );

        setTempFlag(true);
        setOpenModal(true);
      } else {
        console.error("Failed to submit vote", response);
      }
    } catch (error) {
      console.error("Failed to submit vote", error);
    }
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="Poll">
      {openModal && (
        <Modal
          message={modalMessage}
          onClose={() => setOpenModal(false)}
          redirect={isRedirect}
          redirectPath={redirectPath}
        />
      )}
      <div className="Inner">
        <div className="UpperDiv">
          <div className="Title">
            <img src={LeftArrow} alt="LeftArrow" />
            {data.title}
          </div>
          <div className="UpperDescription">
            <div className="Desc">
              <img
                src={data.creatorProfileUrl ? data.creatorProfileUrl : Temp}
                alt="Temp"
              />
              <div>
                {data.creatorName} ·{" "}
                {data.endAt ? new Date(data.endAt).toLocaleDateString() : ""}{" "}
                마감
              </div>
            </div>
            <img src={ViewIcon} alt="ViewIcon" className="ViewIcon" />
            <div>{data.totalVotingCount}</div>
            <div className="heart-container" title="Like" onClick={toggleLike}>
              <input
                type="checkbox"
                className="checkbox"
                id="like-button"
                checked={isLiked}
                readOnly
              />
              <div className="svg-container">
                <svg
                  viewBox="0 0 24 24"
                  className="svg-outline"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z" />
                </svg>
                <svg
                  viewBox="0 0 24 24"
                  className="svg-filled"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
                </svg>
                <svg
                  className="svg-celebrate"
                  width="100"
                  height="100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon points="10,10 20,20"></polygon>
                  <polygon points="10,50 20,50"></polygon>
                  <polygon points="20,80 30,70"></polygon>
                  <polygon points="90,10 80,20"></polygon>
                  <polygon points="90,50 80,50"></polygon>
                  <polygon points="80,80 70,70"></polygon>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="Options">
          <div className="Option">
            <img
              src={
                data.pollType === "ANONYMOUS" ? AnonymousIcon : IdentifiedIcon
              }
              alt="OptionIcon"
              className="OptionIcon"
            />
            <div>{data.pollType === "ANONYMOUS" ? "익명투표" : "기명투표"}</div>
          </div>

          <div className="Option">
            <img
              src={data.responseType === "MULTIPLE" ? MultipleVote : SingleVote}
              alt="MultipleVoteIcon"
              className="OptionIcon"
            />
            {data.responseType === "MULTIPLE" ? (
              <div>복수투표</div>
            ) : (
              <div>단일투표</div>
            )}
          </div>
        </div>

        <div className="VoteOptionArea">
          {voteOptions && voteOptions.length > 0 ? (
            voteOptions.map((option, index) => (
              <div
                className={`VoteOption ${
                  selectedOptionIndexes.includes(index) ? "Selected" : ""
                }`}
                key={`option-${index}`}
                onClick={() => handleOptionClick(index)}
              >
                <div className="VoteOptionImage">
                  {option.imageUrl ? (
                    <img
                      src={option.imageUrl}
                      alt={`OptionImage${index + 1}`}
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div>
                      <img
                        src={ImageIcon}
                        alt="imageIcon"
                        style={{
                          width: "30px",
                          height: "30px",
                          marginTop: "10px",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div
                  className={`OptionDetail  ${
                    selectedOptionIndexes.includes(index) ? "Selected" : ""
                  }`}
                >
                  <img
                    src={
                      selectedOptionIndexes.includes(index)
                        ? VoteActive
                        : VoteInactive
                    }
                    className="VoteIcon"
                    alt="VoteIcon"
                  />
                  <div className="OptionText">{option.description}</div>
                </div>
              </div>
            ))
          ) : (
            <div>No vote options available.</div>
          )}
        </div>
        {/* <div className="SubmitContainer">
          {isExpired ? (
            <button
              className="SubmitButton"
              style={{ backgroundColor: "#a6a6a6" }}
            >
              <img src={manualVoting} alt="vote" />
              이미 종료된 투표입니다.
            </button>
          ) : tempFlag ? (
            <button className="SubmitButton" onClick={ClickVoteButton}>
              <img src={manualVoting} alt="vote" />
              재투표하기
            </button>
          ) : (
            // <button className="SubmitButton" onClick={ClickVoteButton}>
            //   <img src={manualVoting} alt="vote" />
            //   투표하기
            // </button>

            <div className="NamedBtnContainer">
              <input className="NameInput" placeholder="기명투표 닉네임" />
              <button className="SubmitButton" onClick={ClickVoteButton}>
                <img src={manualVoting} alt="vote" />
                투표하기
              </button>
            </div>
          )}
        </div> */}

        {/*
        <div className="SubmitContainer">
          {isExpired ? (
            <button
              className="SubmitButton"
              style={{ backgroundColor: "#a6a6a6" }}
            >
              <img src={manualVoting} alt="vote" />
              이미 종료된 투표입니다.
            </button>
          ) : tempFlag ? (
            <button className="SubmitButton" onClick={ClickVoteButton}>
              <img src={manualVoting} alt="vote" />
              재투표하기
            </button>
          ) : data.pollType === "NAMED" && !userInfo ? (
            <div className="NamedBtnContainer">
              <input
                className="NameInput"
                placeholder="기명투표 닉네임"
                value={namedNickname}
                onChange={(e) => setNamedNickname(e.target.value)}
              />
              <button
                className="SubmitButton"
                onClick={() => {
                  if (!namedNickname.trim()) {
                    alert("닉네임을 입력해주세요.");
                    return;
                  }
                  ClickVoteButton();
                }}
              >
                <img src={manualVoting} alt="vote" />
                투표하기
              </button>
            </div>
          ) : (
            <button className="SubmitButton" onClick={ClickVoteButton}>
              <img src={manualVoting} alt="vote" />
              투표하기
            </button>
          )}
        </div>
        */}

        <div className="SubmitContainer">
          {isExpired ? (
            <button
              className="SubmitButton"
              style={{ backgroundColor: "#a6a6a6" }}
            >
              <img src={manualVoting} alt="vote" />
              이미 종료된 투표입니다.
            </button>
          ) : !userInfo && tempFlag ? (
            <div>
              {/* 비회원이 투표를 마친 경우 버튼을 표시하지 않습니다. */}
            </div>
          ) : tempFlag ? (
            <button className="SubmitButton" onClick={ClickVoteButton}>
              <img src={manualVoting} alt="vote" />
              재투표하기
            </button>
          ) : data.pollType === "NAMED" && !userInfo ? (
            <div className="NamedBtnContainer">
              <input
                className="NameInput"
                placeholder="기명투표 닉네임"
                value={namedNickname}
                onChange={(e) => setNamedNickname(e.target.value)}
              />
              <button
                className="SubmitButton"
                onClick={() => {
                  if (!namedNickname.trim()) {
                    setModalMessage("닉네임을 입력해주세요.");
                    setOpenModal(true);
                    return;
                  }
                  ClickVoteButton();
                }}
              >
                <img src={manualVoting} alt="vote" />
                투표하기
              </button>
            </div>
          ) : (
            <button className="SubmitButton" onClick={ClickVoteButton}>
              <img src={manualVoting} alt="vote" />
              투표하기
            </button>
          )}
        </div>

        <div className="VerticalLine"></div>

        <div className="PollResultContainer">
          {tempFlag ? (
            <></>
          ) : (
            <div className="card">
              <div className="tools">
                <div className="circle">
                  <span className="red box"></span>
                </div>
                <div className="circle">
                  <span className="yellow box"></span>
                </div>
                <div className="circle">
                  <span className="green box"></span>
                </div>
              </div>
              <div className="CardContent">
                <div>
                  위의 <img src={VoteBtn} alt="votebtn" /> 버튼을 누르고
                </div>
                <div>
                  <span>투표결과</span>를 확인해보세요!
                </div>
              </div>
            </div>
          )}

          <div className="LeftSide">
            <div className="Title">
              <img src={LeftArrow} alt="Arrow" />
              투표 결과
            </div>
            <div className={`ResultOptions  ${tempFlag ? "" : "dimmed"}`}>
              {voteOptions &&
                voteOptions.length > 0 &&
                voteOptions.map((option, index) => (
                  <div className="ResultOption" key={`result-option-${index}`}>
                    <div className="OptionName">
                      {option.description}
                      {" - "}
                      {(
                        (option.votingCount / (data.totalVotingCount || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="OptionPercent">
                      <div
                        className="inner-bar"
                        style={{
                          width: `${(
                            (option.votingCount /
                              (data.totalVotingCount || 1)) *
                            100
                          ).toFixed(1)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className={`RightSide ${tempFlag ? "" : "dimmed"}`}>
            <div className="Title">
              <img src={Leaderboard} alt="Rank" />
              순위
            </div>

            <div className="Leaderboard">
              {voteOptions
                .sort((a, b) => b.votingCount - a.votingCount)
                .map((option, index) => (
                  <div className="Rank" key={`rank-${index}`}>
                    <div className="Name">
                      {index === 0 ? (
                        <img src={Crown} alt="Crown" />
                      ) : index === 1 ? (
                        <img src={SilverCrown} alt="SilverCrown" />
                      ) : index === 2 ? (
                        <img src={BronzeCrown} alt="BronzeCrown" />
                      ) : (
                        <div className="Number">{index + 1}위</div>
                      )}
                      {option.description}
                    </div>
                    <div className="Percent">
                      {(
                        (option.votingCount / (data.totalVotingCount || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Poll;
