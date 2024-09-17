import React, { useState } from "react";
import {
  AnonymousIcon,
  DateIcon,
  HelpIcon,
  IdentifiedIcon,
  MinusButton,
  MultipleVote,
  PlusIcon,
  SingleVote,
  VoteInactive,
} from "../asset";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface VoteOption {
  imageUrl: string | null;
  title: string;
}

const Write = () => {
  const [title, setTitle] = useState<string>("");
  const [isAnon, setIsAnon] = useState<boolean>(true);
  const [isSingle, setIsSingle] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>([
    { imageUrl: null, title: "" },
    { imageUrl: null, title: "" },
  ]);

  const addVoteOption = () => {
    setVoteOptions([...voteOptions, { imageUrl: null, title: "" }]);
  };

  const removeVoteOption = (index: number) => {
    if (voteOptions.length > 2) {
      const updatedOptions = voteOptions.filter((_, i) => i !== index);
      setVoteOptions(updatedOptions);
    }
  };

  const handleImageUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    const file =
      event.type === "drop"
        ? (event as React.DragEvent<HTMLDivElement>).dataTransfer.files[0]
        : (event as React.ChangeEvent<HTMLInputElement>).target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const updatedOptions = [...voteOptions];
        updatedOptions[index].imageUrl = reader.result as string | null;
        setVoteOptions(updatedOptions);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTitleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    setTitle(e.currentTarget.textContent || "");
  };

  const handleOptionTitleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedOptions = [...voteOptions];
    updatedOptions[index].title = event.target.value;
    setVoteOptions(updatedOptions);
  };

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = () => {
    const payload = {
      userId: null,
      creatorName: null,
      title: title,
      responseType: isSingle ? "single" : "multi",
      isBallot: isAnon ? "Anonymous" : "Named",
      options: voteOptions,
      endedAt: selectedDate,
    };

    console.log(payload);
  };

  return (
    <div className="Write">
      <div className="Inner">
        <div className="UpperDiv">
          <div
            className="TitleInput"
            contentEditable="true"
            suppressContentEditableWarning
            data-placeholder="투표의 제목을 입력해주세요."
            onInput={handleTitleInputChange}
          ></div>

          <div className="Upload" onClick={handleSubmit}>
            <div>투표 생성하기</div>
          </div>
        </div>

        <div className="Selectors">
          <div className="TypeSelector">
            <div
              className={`Option ${isAnon ? "Selected" : ""}`}
              onClick={() => setIsAnon(true)}
            >
              <img
                src={IdentifiedIcon}
                alt="IdentifiedIcon"
                className="OptionIcon"
              />
              <div className="Text">익명투표</div>
            </div>
            <div
              className={`Option ${isAnon ? "" : "Selected"}`}
              onClick={() => setIsAnon(false)}
            >
              <img
                src={AnonymousIcon}
                alt="AnonymousIcon"
                className="OptionIcon"
              />
              <div className="Text">기명투표</div>
            </div>
          </div>

          <div className="TypeSelector">
            <div
              className={`Option ${isSingle ? "Selected" : ""}`}
              onClick={() => setIsSingle(true)}
            >
              <img src={SingleVote} alt="SingleVote" className="OptionIcon" />
              <div className="Text">단일투표</div>
            </div>
            <div
              className={`Option ${isSingle ? "" : "Selected"}`}
              onClick={() => setIsSingle(false)}
            >
              <img
                src={MultipleVote}
                alt="MultipleVote"
                className="OptionIcon"
              />
              <div className="Text">복수투표</div>
            </div>
          </div>

          <div className="DateSelector">
            <div className="Option">
              <img src={DateIcon} alt="DateIcon" className="OptionIcon" />
              <DatePicker
                className="DatePicker"
                dateFormat="yyyy.MM.dd"
                shouldCloseOnSelect
                minDate={new Date()}
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />
            </div>
          </div>

          <div className="HelpButton">
            <img src={HelpIcon} alt="HelpIcon" className="HelpIcon" />
            <div className="HelpTextBubble">
              <p>기명투표</p>을 선택하여 로그인 된 사용자의 투표만 받을 수
              있어요.
              <br /> <br />
              <p>복수투표</p>로 여러 선택지를 동시에 고르도록 할 수 있어요.
              <br /> <br />
              <p>마감일</p>을 설정해 투표 기간을 원하는 만큼 지정할 수 있어요.
            </div>
          </div>
        </div>

        <div className="VoteOptionArea">
          {voteOptions.map((option, index) => (
            <div className="VoteOption" key={`option-${index}`}>
              <img
                className={`MinusButton ${voteOptions.length < 3 ? "Min" : ""}`}
                src={MinusButton}
                alt="MinusButton"
                onClick={() => removeVoteOption(index)}
              />
              <label
                htmlFor={`file-upload-${index}`}
                style={{ cursor: "pointer", display: "flex", gap: "5px" }}
              >
                <input
                  id={`file-upload-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageUpload(index, event)}
                />
                <div
                  className="VoteOptionImage"
                  onDrop={(event) => handleImageUpload(index, event)}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                  onDragLeave={preventDefault}
                >
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
              </label>
              <div className="OptionDetail">
                <img src={VoteInactive} className="VoteIcon" alt="VoteIcon" />
                <input
                  type="text"
                  className="OptionText"
                  placeholder={`후보 ${index + 1}`}
                  value={option.title}
                  onChange={(e) => handleOptionTitleChange(index, e)}
                />
              </div>
            </div>
          ))}

          <div className={`VoteOption ${voteOptions.length > 5 ? "Max" : ""}`}>
            <div className="AddButton" onClick={addVoteOption}>
              <img src={PlusIcon} alt="PlusIcon" />
              <div>새 후보 추가</div>
            </div>
            <div
              className="VoteOptionImage"
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "200px",
                backgroundColor: "#c4c4c4",
                justifyContent: "center",
                textAlign: "center",
                filter: "blur(3px)",
              }}
            >
              <span style={{ color: "#fff", fontWeight: "bold" }}>
                이미지 첨부하기 +
              </span>
              <span className="span2" style={{ color: "#fff" }}>
                클릭 후 파일선택이나 드래그로 이미지를 첨부하세요.
              </span>
            </div>

            <div className="OptionDetail" style={{ filter: "blur(5px)" }}>
              <img src={VoteInactive} className="VoteIcon" alt="VoteIcon" />
              <div className="OptionText" style={{ color: "#808080" }}>
                후보 0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Write;
