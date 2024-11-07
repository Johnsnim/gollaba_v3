import React, { useState, useEffect } from "react";
import {
  AnonymousIcon,
  Crown,
  ImageIcon,
  LeftArrow,
  manualVoting,
  MinusButton,
  MultipleVote,
  PlusIcon,
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
  //임시 체크용 변수
  const tempFlag = false;

  const [voteOptions, setVoteOptions] = useState<PollItem[]>([]);
  const [data, setData] = useState<PollData | null>(null);
  const { pollId } = useParams<Params>();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    console.log("아이디", pollId);

    const fetchPollData = async () => {
      try {
        const response = await VoteApi.getPoll(pollId);
        if (response.status === 200) {
          console.log("Fetched Poll Data:", response.data.data);
          console.log("Vote Options:", response.data.data.items);
          setData(response.data.data);
          setVoteOptions(response.data.data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch trending polls", error);
      }
    };
    fetchPollData();
  }, [pollId]);

  const handleOptionClick = (index: number) => {
    if (selectedOptionIndex === index) {
      setSelectedOptionIndex(null); // 이미 선택된 옵션을 다시 클릭하면 선택 해제
    } else {
      setSelectedOptionIndex(index); // 새로운 옵션 선택
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
                        width: "100%",
                        height: "100%",
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
          <button className="SubmitButton">
            <img src={manualVoting} alt="vote" />
            투표하기
          </button>
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
                          (option.votingCount / (data.totalVotingCount || 1)) *
                          100
                        ).toFixed(1)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Poll;
