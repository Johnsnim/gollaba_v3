import { useLocation, useNavigate } from "react-router-dom";
import { HomeIcon, Logo } from "../asset";
import { useEffect, useState, useRef } from "react";
import UserApi from "../services/user";

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const photoInput = useRef<HTMLInputElement | null>(null);
  const imagePayload = useRef<File | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [providerId, setProviderId] = useState("");
  const [providerType, setProviderType] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const emailFromQuery = queryParams.get("email") || "";
    const nameFromQuery = queryParams.get("name") || "";
    const providerIdFromQuery = queryParams.get("providerId") || "";
    const providerTypeFromQuery = queryParams.get("providerType") || "";
    const profileImageUrlFromQuery =
      queryParams.get("profileImageUrl") ||
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    setEmail(emailFromQuery);
    setName(nameFromQuery);
    setProviderId(providerIdFromQuery);
    setProviderType(providerTypeFromQuery);
    setProfileImageUrl(profileImageUrlFromQuery);
  }, [location]);

  const handleClick = () => {
    if (photoInput.current) {
      photoInput.current.click();
    }
  };

  const changeProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const profileImageSelected = e.target.files?.[0];
    if (profileImageSelected) {
      imagePayload.current = profileImageSelected;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2 && typeof reader.result === "string") {
          setProfileImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(profileImageSelected);
    } else {
      setProfileImageUrl(
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
      );
    }
  };

  const signup = async () => {
    const payload = {
      email: email,
      name: name,
      profileImageUrl: profileImageUrl,
      providerType: providerType,
      providerId: providerId,
    };

    console.log("페이로드>", payload);
    const response = await UserApi.signupForm(payload);

    if (response?.data?.error === true) {
      alert(response.data.message);
      return;
    }

    navigate("/login");
  };

  return (
    <div className="Signup">
      <div className="SignupInner">
        <div
          className="HomeButton"
          onClick={() => {
            navigate("/");
          }}
        >
          <img src={HomeIcon} alt="HomeIcon" />
          <div>메인페이지 가기</div>
        </div>
        <div className="UpperPartContainer">
          <div className="Title">회원가입</div>
          <img
            src={profileImageUrl}
            alt="프로필 이미지"
            style={{
              width: 120,
              height: 120,
              objectFit: "cover",
              cursor: "pointer",
              borderRadius: "50%",
              marginTop: "20px",
            }}
            onClick={handleClick}
          />
          <input
            type="file"
            id="profileImageInput"
            style={{ display: "none" }}
            accept="image/jpg, image/jpeg, image/png"
            onChange={changeProfile}
            ref={photoInput}
          />

          <div className="Text">클릭해서 원하는 이미지로 교체할 수 있어요.</div>
        </div>

        <div className="LowerPartContainer">
          <input
            type="text"
            placeholder="가입 이메일 *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
          />
          <input
            type="text"
            placeholder="닉네임 *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button className="Submit" onClick={signup}>
          가입
        </button>
        <div className="Copyright">
          © 2024 Team Gollaba All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Signup;
