import React, { useState } from "react";
import {
  AnonymousIcon,
  LeftArrow,
  MinusButton,
  MultipleVote,
  PlusIcon,
  Temp,
  ViewIcon,
  VoteInactive,
} from "../asset";

const Poll = () => {
  const [voteOptions, setVoteOptions] = useState([
    { imageUrl: null, title: "" },
    { imageUrl: null, title: "" },
  ]);
  return (
    <div className="Poll">
      <div className="Inner">
        <div className="UpperDiv">
          <div className="Title">
            <img src={LeftArrow} alt="LeftArrow" />
            저녁으로 무엇을 먹을까요?
          </div>
          <div className="UpperDescription">
            <div className="Desc">
              <img src={Temp} />
              <div>홍길동 · 9월 16일 마감</div>
            </div>
            <img src={ViewIcon} alt="ViewIcon" className="ViewIcon" />
            <div>367</div>
          </div>
        </div>

        <div className="Options">
          <div className="Option">
            <img
              src={AnonymousIcon}
              alt="AnonymousIcon"
              className="OptionIcon"
            />
            <div>익명투표</div>
          </div>
          <div className="Option">
            <img
              src={MultipleVote}
              alt="AnonymousIcon"
              className="OptionIcon"
            />
            <div>복수투표</div>
          </div>
        </div>

        <div className="VoteOptionArea">
          {voteOptions.map((option, index) => (
            <div className="VoteOption" key={`option-${index}`}>
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
                  <>
                    <span>이미지 첨부하기 +</span>
                    <span className="span2">
                      클릭 후 파일선택이나 드래그로 이미지를 첨부하세요.
                    </span>
                  </>
                )}
              </div>

              <div className="OptionDetail">
                <img src={VoteInactive} className="VoteIcon" alt="VoteIcon" />
                <div className="OptionText"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="VerticalLine"></div>
        <div className="PollResultContainer">
          <div className="Title">
            <img src={LeftArrow} alt="Arrow" />
            투표 결과
          </div>
          <div className="ResultOptions">
            <div className="ResultOption">
              <div className="OptionName">햄버거</div>
              <div className="OptionPercent"></div>
            </div>
            <div className="ResultOption">
              <div className="OptionName">피자</div>
              <div className="OptionPercent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Poll;
