import axios from "axios";

const userToken = localStorage.getItem("accessToken");

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    Authorization: userToken ? `Bearer ${userToken}` : null,
  },
});

export default api;
