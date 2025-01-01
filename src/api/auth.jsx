import axios from "axios";

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

export default api;
