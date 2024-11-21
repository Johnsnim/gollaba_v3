import React, { useState, useEffect } from "react";
import {
  AnonymousIcon,
  BronzeCrown,
  Crown,
  ImageIcon,
  Leaderboard,
  LeftArrow,
  manualVoting,
  MinusButton,
  MultipleVote,
  PlusIcon,
  SilverCrown,
  Temp,
  ViewIcon,
  VoteActive,
  VoteBtn,
  VoteInactive,
} from "../asset";
import VoteApi from "../services/vote";
import { useParams } from "react-router-dom";

type PollData = {
  id: string;
  title: string;
  creatorName: string;
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

const Poll: React.FC = () => {
  //투표 여부 확인용 변수
  const [tempFlag, setTempFlag] = useState(false);

  //투표 마감 여부 확인용 변수
  const [isExpired, setIsExpired] = useState(false);

  const [voteOptions, setVoteOptions] = useState<PollItem[]>([]);
  const [data, setData] = useState<PollData | null>(null);
  const { pollId } = useParams<Params>();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchPollDataAndVoteCheck = async () => {
      try {
        const response = await VoteApi.getPoll(pollId);
        if (response.status === 200) {
          console.log("Fetched Poll Data:", response.data.data);
          const pollData = response.data.data;
          setData(pollData);
          setVoteOptions(pollData.items || []);

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

  const handleOptionClick = (index: number) => {
    if (isExpired) return;

    if (selectedOptionIndex === index) {
      setSelectedOptionIndex(null);
    } else {
      setSelectedOptionIndex(index);
    }
  };

  const ClickVoteButton = async () => {
    if (selectedOptionIndex === null) {
      alert("옵션을 선택해주세요.");
      return;
    }

    const selectedOption = voteOptions[selectedOptionIndex];

    if (!selectedOption) {
      alert("유효한 옵션을 선택해주세요.");
      return;
    }

    try {
      const payload = {
        pollHashId: pollId,
        pollItemIds: [selectedOption.id],
        voterName: "test",
      };

      let response;

      if (tempFlag) {
        let chosen = await VoteApi.chosenItem(pollId);

        console.log("test", chosen.data.data.id);

        response = await VoteApi.voteEdit(chosen.data.data.id, {
          pollItemIds: [selectedOption.id],
        });
      } else {
        response = await VoteApi.vote(payload);
      }

      if (response.status === 200) {
        alert(tempFlag ? "투표가 수정되었습니다." : "투표가 완료되었습니다.");
        setTempFlag(true);
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
      <div className="Inner">
        <div className="UpperDiv">
          <div className="Title">
            <img src={LeftArrow} alt="LeftArrow" />
            {data.title}
          </div>
          <div className="UpperDescription">
            <div className="Desc">
              <img src={Temp} alt="Temp" />
              <div>
                {data.creatorName} ·{" "}
                {data.endAt ? new Date(data.endAt).toLocaleDateString() : ""}{" "}
                마감
              </div>
            </div>
            <img src={ViewIcon} alt="ViewIcon" className="ViewIcon" />
            <div>{data.totalVotingCount}</div>
          </div>
        </div>

        <div className="Options">
          <div className="Option">
            <img
              src={data.pollType === "ANONYMOUS" ? AnonymousIcon : MultipleVote}
              alt="OptionIcon"
              className="OptionIcon"
            />
            <div>{data.pollType === "ANONYMOUS" ? "익명투표" : "복수투표"}</div>
          </div>
          {data.responseType === "MULTIPLE" && (
            <div className="Option">
              <img
                src={MultipleVote}
                alt="MultipleVoteIcon"
                className="OptionIcon"
              />
              <div>복수투표</div>
            </div>
          )}
        </div>

        <div className="VoteOptionArea">
          {voteOptions && voteOptions.length > 0 ? (
            voteOptions.map((option, index) => (
              <div
                className={`VoteOption ${
                  selectedOptionIndex === index ? "Selected" : ""
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
                    selectedOptionIndex === index ? "Selected" : ""
                  }`}
                >
                  <img
                    src={
                      selectedOptionIndex !== index ? VoteInactive : VoteActive
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
          <div className="RightSide">
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
