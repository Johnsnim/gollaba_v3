// import axios from "axios";

// const userToken = localStorage.getItem("accessToken");

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_BASE_URL,
//   headers: {
//     Authorization: userToken ? `Bearer ${userToken}` : null,
//   },
// });

// api.interceptors.request.use((config) => {
//   if (config.method === "delete" && config.data) {
//     config.headers["Content-Type"] = "application/json";
//     config.params = null;
//   }
//   return config;
// });

// export default api;

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import UserApi from "../services/user";

const userToken = localStorage.getItem("accessToken");

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    Authorization: userToken ? `Bearer ${userToken}` : null,
  },
});

api.interceptors.request.use((config) => {
  if (config.method === "delete" && config.data) {
    config.headers["Content-Type"] = "application/json";
    config.params = null;
  }
  return config;
});

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;
    return exp < now;
  } catch (error) {
    return true;
  }
};

const refreshToken = async () => {
  try {
    const response = await UserApi.renewToken();
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("토큰 갱신 실패", error);
    return null;
  }
};

export { isTokenExpired, refreshToken };
export default api;
