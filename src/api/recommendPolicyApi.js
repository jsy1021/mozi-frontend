<<<<<<< HEAD
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
=======
import api from './index.js';

const RECOMMEND_BASE_URL = 'recommend/policy';

export default {
  async getRecommendedPolicies(goalId) {
    const res = await api.get(`${RECOMMEND_BASE_URL}/${goalId}`);
    console.log('RECOMMENDED POLICIES:', res); // 전체 응답 객체 로그
    return res.result ?? [];
  },

  // ✅ 이 함수 추가!!
  async getAllRecommendedPolicies() {
    const res = await api.get(`${RECOMMEND_BASE_URL}/all`);
    return res.result ?? [];
  },
};
>>>>>>> 451966481539ec0f66cd9d5ffbf5e4c2002cfe9a
