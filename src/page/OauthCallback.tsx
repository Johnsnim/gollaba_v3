import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OAuth2CallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    // 회원가입된 회원일 경우
    const accessToken = queryParams.get("accessToken");
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      navigate("/");
      return;
    }

    // 회원가입이 필요한 회원일 경우
    const name = queryParams.get("name");
    const email = queryParams.get("email");
    const providerId = queryParams.get("providerId");
    const providerType = queryParams.get("providerType");
    const profileImageUrl = queryParams.get("profileImageUrl");

    // 필수 값 없을 경우 back
    if (!email || !email.trim() || !providerId || !providerType) {
      alert("회원가입에 필요한 필수 값이 없습니다. 관리자에게 문의하세요.");
      navigate("/login");
      return;
    }

    navigate({ pathname: "/signup", search: location.search });
  }, [location, navigate]);

  return null;
}
