import axios from "axios";

const userToken = localStorage.getItem("usertoken");

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-type": "application/json",
    Authorization: userToken ? `Bearer ${userToken}` : "",
  },
});

export default api;
