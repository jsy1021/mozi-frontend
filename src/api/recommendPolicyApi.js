import api from './index.js';

const RECOMMEND_BASE_URL = 'recommend/policy';

export default {
  async getRecommendedPolicies(goalId) {
    const res = await api.get(`${RECOMMEND_BASE_URL}/${goalId}`);
    console.log('RECOMMENDED POLICIES:', res); // 전체 응답 객체 로그
    return res.result ?? [];
  },

  async getAllRecommendedPolicies() {
    const res = await api.get(`${RECOMMEND_BASE_URL}/all`);
    return res.result ?? [];
  },
};
