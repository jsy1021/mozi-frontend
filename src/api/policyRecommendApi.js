// policyRecommendApi.js
import api from './index.js';

const RECOMMEND_BASE_URL = 'recommend';

export default {
  // 목표 ID를 기반으로 추천 정책 5개 불러오기
  async getRecommendedPolicies(goalId) {
    const res = await api.get(`${RECOMMEND_BASE_URL}/${goalId}`);
    console.log('[추천 정책 리스트]', res);
    return res;
  },
};
