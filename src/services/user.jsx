import api from "../api/auth";

const UserApi = {
  signupForm: async (payload) => api.post(`/v2/users/signup`, payload),
  showUser: async (token) => api.get(`/v2/users/me`, token),
  changeName: async (payload, token) => api.put(`/v2/users`, payload, token),
  changeImage: async (payload, token) =>
    api.post(`v2/users/change-profile`, payload, token),
  updateUser: async (payload, token) => api.post(`v2/users`, payload, token),
  readCount: async (pollId) => api.post(`/v2/polls/${pollId}/read`),
  userFavorites: async () => api.get(`/v2/favorites/me`),
  renewToken: async () => api.post(`/v2/users/renew-token`),
};

export default UserApi;
