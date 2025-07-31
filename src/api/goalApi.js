// 목표 관련 api 함수 모음
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

const GOAL_BASE_URL = 'goal';

export default {
  // 1. 사용자별 목표 목록 조회
  // GET /api/goal/{userId}
  async getGoalsByUserId(userId) {
    const { data } = await api.get(`${GOAL_BASE_URL}/${userId}`);
    console.log('GOAL GET LIST BY USER:', data);
    return data;
  },

  // 2. 특정 목표 조회
  // GET /api/goal/{userId}/{goalId}
  async getGoal(userId, goalId) {
    const { data } = await api.get(`${GOAL_BASE_URL}/${userId}/${goalId}`);
    console.log('GOAL GET DETAIL:', data);
    return data;
  },

  // 3. 새 목표 생성
  // POST /api/goal/{userId}
  async createGoal(userId, goalData) {
    const { data } = await api.post(`${GOAL_BASE_URL}/${userId}`, goalData);
    console.log('GOAL CREATE:', data);
    return data;
  },

  // 4. 목표 수정
  // PUT /api/goal/{userId}/{goalId}
  async updateGoal(userId, goalId, goalData) {
    const { data } = await api.put(
      `${GOAL_BASE_URL}/${userId}/${goalId}`,
      goalData
    );
    console.log('GOAL UPDATE:', data);
    return data;
  },

  // 5. 목표 삭제
  // DELETE /api/goal/{userId}/{goalId}
  async deleteGoal(userId, goalId) {
    const { data } = await api.delete(`${GOAL_BASE_URL}/${userId}/${goalId}`);
    console.log('GOAL DELETE:', data);
    return data;
  },

  // 6. 목표 달성률 조회
  // GET /api/goal/{userId}/{goalId}/achievement-rate
  async getAchievementRate(userId, goalId) {
    const { data } = await api.get(
      `${GOAL_BASE_URL}/${userId}/${goalId}/achievement-rate`
    );
    console.log('GOAL ACHIEVEMENT RATE:', data);
    return data;
  },

  // 7. 목표 달성 예상 날짜 조회
  // GET /api/goal/{userId}/{goalId}/expected-date?monthlyAmount={amount}
  async getExpectedDate(userId, goalId, monthlyAmount) {
    const { data } = await api.get(
      `${GOAL_BASE_URL}/${userId}/${goalId}/expected-date`,
      {
        params: { monthlyAmount },
      }
    );
    console.log('GOAL EXPECTED DATE:', data);
    return data;
  },

  // 8. 목표 달성 여부 확인
  // GET /api/goal/{userId}/{goalId}/is-achieved
  async isGoalAchieved(userId, goalId) {
    const { data } = await api.get(
      `${GOAL_BASE_URL}/${userId}/${goalId}/is-achieved`
    );
    console.log('GOAL IS ACHIEVED:', data);
    return data;
  },

  // 9. 목표 상태 업데이트
  // PATCH /api/goal/{userId}/{goalId}/status
  async updateGoalStatus(userId, goalId, status) {
    const { data } = await api.patch(
      `${GOAL_BASE_URL}/${userId}/${goalId}/status`,
      status
    );
    console.log('GOAL STATUS UPDATE:', data);
    return data;
  },

  // 10. 1억 모으기 목표 조회
  // GET /api/goal/{userId}/billion
  async getBillionGoal(userId) {
    const { data } = await api.get(`${GOAL_BASE_URL}/${userId}/billion`);
    console.log('BILLION GOAL:', data);
    return data;
  },

  // 11. 남은 금액 계산
  // GET /api/goal/{userId}/{goalId}/remaining-amount
  async getRemainingAmount(userId, goalId) {
    const { data } = await api.get(
      `${GOAL_BASE_URL}/${userId}/${goalId}/remaining-amount`
    );
    console.log('REMAINING AMOUNT:', data);
    return data;
  },

  // 12. 남은 기간 계산 (일 단위)
  // GET /api/goal/{userId}/{goalId}/remaining-days
  async getRemainingDays(userId, goalId) {
    const { data } = await api.get(
      `${GOAL_BASE_URL}/${userId}/${goalId}/remaining-days`
    );
    console.log('REMAINING DAYS:', data);
    return data;
  },

  // 13. 목표 키워드 조회
  // GET /api/goal/{userId}/{goalId}/keyword
  async getGoalKeyword(userId, goalId) {
    const { data } = await api.get(
      `${GOAL_BASE_URL}/${userId}/${goalId}/keyword`
    );
    console.log('GOAL KEYWORD:', data);
    return data;
  },

  // === 기타 편의 메서드===

  // 목표 데이터 포맷팅 (날짜 형식 등)
  formatGoalData(goalData) {
    return {
      ...goalData,
      goalDate: goalData.goalDate
        ? new Date(goalData.goalDate)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')
        : null,
      targetAmount: parseFloat(goalData.targetAmount || 0),
    };
  },

  // 목표 키워드 한글 변환
  getKeywordLabel(keyword) {
    const keywordMap = {
      MARRIAGE: '결혼',
      EMPLOYMENT: '취업',
      HOME_PURCHASE: '내집마련',
      TRAVEL: '여행',
      EDUCATION_FUND: '학자금',
      HOBBY: '취미',
    };
    return keywordMap[keyword] || keyword;
  },

  // 금액 포맷팅 (원 단위)
  formatAmount(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  },

  // 달성률 포맷팅 (퍼센트)
  formatAchievementRate(rate) {
    return Math.round(rate * 100) / 100 + '%';
  },
};
