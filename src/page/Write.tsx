import React, { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import VoteApi from "../services/vote";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UserApi from "../services/user";

interface VoteOption {
  imageFile: File | null;
  title: string;
}

interface UserInfo {
  id: string;
  name: string;
  profileImageUrl?: string;
  email: string;
  [key: string]: any;
}

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

const Write = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isToken, setIsToken] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [modalMessage, setModalMessage] = useState<string>("");
  const [isRedirect, setIsRedirect] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [isAnon, setIsAnon] = useState<boolean>(true);
  const [isSingle, setIsSingle] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const now = new Date();
    const nextHour = new Date(now.setHours(now.getHours() + 2));
    nextHour.setMinutes(0, 0, 0);
    return nextHour;
  });
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>([
    { imageFile: null, title: "" },
    { imageFile: null, title: "" },
  ]);

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

  const addVoteOption = () => {
    setVoteOptions([...voteOptions, { imageFile: null, title: "" }]);
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
      const updatedOptions = [...voteOptions];
      updatedOptions[index].imageFile = file;
      setVoteOptions(updatedOptions);
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

  const handleSubmit = (): void => {
    if (selectedDate) {
      const now = new Date();
      const oneHourLater = new Date(now.setHours(now.getHours() + 1));
      if (selectedDate < oneHourLater) {
        setModalMessage("투표시간은 최소 1시간입니다.");
        setOpenModal(true);
        return;
      }
    }

    if (title.length === 0) {
      setModalMessage("투표 제목을 입력해주세요.");
      setOpenModal(true);
      return;
    }

    const emptyOption = voteOptions.find(
      (option) => option.title.trim() === ""
    );
    if (emptyOption) {
      setModalMessage("모든 항목에 제목을 기입해주세요.");
      setOpenModal(true);
      return;
    }

    const formData = new FormData();

    if (isToken && userInfo) {
      formData.append("userId", userInfo.id);
      formData.append("creatorName", userInfo.name);
    } else {
      formData.append("userId", "null");
      formData.append("creatorName", "비회원");
    }

    formData.append("title", title);
    formData.append("responseType", isSingle ? "SINGLE" : "MULTIPLE");
    formData.append("pollType", isAnon ? "ANONYMOUS" : "NAMED");

    if (selectedDate) {
      const localDateString = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss", {
        locale: ko,
      });
      formData.append("endAt", localDateString);
    }

    voteOptions.forEach((option, index) => {
      formData.append(`items[${index}].description`, option.title);
      if (option.imageFile) {
        formData.append(`items[${index}].image`, option.imageFile);
      }
    });

    const createPoll = async (formData: FormData) => {
      try {
        const response = await VoteApi.createPoll(formData);
        if (response.data.status === "SUCCESS") {
          setModalMessage("투표가 등록되었습니다.");
          setIsRedirect(true);
          setRedirectPath(`/poll/${response.data.data.id}`);
          setOpenModal(true);
        } else {
          setModalMessage("투표 등록 중 문제가 발생했습니다.");
          setOpenModal(true);
        }
      } catch (error) {
        console.error("Error:", error);
        setModalMessage("투표 등록 중 문제가 발생했습니다.");
        setOpenModal(true);
      }
    };

    createPoll(formData);
  };

  return (
    <div className="Write">
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
          <div
            className="TitleInput"
            contentEditable="true"
            suppressContentEditableWarning
            data-placeholder="투표의 제목을 입력해주세요."
            onInput={handleTitleInputChange}
          ></div>

          <div className="Upload" onClick={handleSubmit}>
            <div>등록</div>
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
                dateFormat="yyyy.MM.dd HH:mm"
                locale={ko}
                shouldCloseOnSelect={false}
                minDate={
                  new Date(new Date().setHours(new Date().getHours() + 1))
                }
                minTime={
                  new Date(new Date().setHours(new Date().getHours() + 1))
                }
                maxTime={new Date(new Date().setHours(23, 59))}
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                timeCaption="시간"
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
                  {option.imageFile ? (
                    <img
                      src={URL.createObjectURL(option.imageFile)}
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
                  placeholder={`${index + 1} 항목입력`}
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
