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
      window.location.reload();
      return;
    }

    // 회원가입이 필요한 회원일 경우
    const name = queryParams.get("name");
    const email = queryParams.get("email");
    const providerId = queryParams.get("providerId");
    const providerType = queryParams.get("providerType");
    const profileImageUrl = queryParams.get("profileImageUrl");

    navigate({ pathname: "/signup", search: location.search });
  }, [location, navigate]);

  return null;
}
