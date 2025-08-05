import api from "./index.js"; // ← 인터셉터가 설정된 api 사용

const API_BASE_URL = "/recommend/finance"; //백엔드 추천 API 경로

export const getRecommendations = async () => {
  const response = await api.get(`${API_BASE_URL}`);
  return Array.isArray(response) ? response : [];
};
