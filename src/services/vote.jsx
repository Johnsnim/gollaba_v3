import api from "../api/auth";

const VoteApi = {
  //투표 생성
  createPoll: async (payload) =>
    api.post("/v2/polls", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  //전체 투표 조회
  getPolls: async (page, limit) =>
    api.get(`/v2/polls?page=${page}&size=${limit}`),

  //검색어 기준 투표 조회
  searchPolls: async (offset, limit, title) =>
    api.get(
      `/v2/polls?limit=${limit}&offset=${
        offset * 15
      }&optionGroup=TITLE&query=${title}`
    ),

  //단일 투표 조회
  getPoll: async (pollId) => api.get(`/v2/polls/${pollId}`),

  //투표
  vote: async (payload) => api.post(`/v2/voting`, payload),

  //투표 수정
  voteEdit: async (pollId, payload) => api.put(`/v2/voting/${pollId}`, payload),

  //투표 여부 확인
  isVoted: async (payload) => api.post(`/v2/voting/check`, payload),

  chosenItem: async (pollHashId) =>
    api.get(`/v2/voting/me?pollHashId=${pollHashId}`),

  updatePoll: async (pollId, payload) =>
    api.post(`v2/polls/${pollId}/update`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  //내 투표 조회
  getMyPolls: async (page, limit) =>
    api.get(`/v2/polls/me?page=${page}&size=${limit}`),

  //Top 투표
  topPolls: async () => api.get(`/v2/polls/top?limit=5`),

  //트렌딩 투표
  trendingPolls: async () => api.get(`/v2/polls/trending?limit=5`),

  //좋아요 생성
  onFavorites: async (pollHashId) =>
    api.post(`/v2/favorites`, { pollHashId: pollHashId }),

  //좋아요 해제
  offFavorites: async (pollHashId) =>
    api.delete(`/v2/favorites`, { data: { pollHashId: pollHashId } }),

  //좋아요 투표 전체 조회
  getFavorites: async (page, limit) =>
    api.get(`/v2/polls/favorites-me?page=${page}&size=${limit}`),
};

export default VoteApi;
