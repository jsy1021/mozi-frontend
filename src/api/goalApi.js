// 목표 관련 api 함수 모음
import api from './index.js'; // ← 인터셉터가 설정된 api 사용

const GOAL_BASE_URL = 'goal';

export default {
  // 1. 현재 사용자의 목표 목록 조회
  // GET /api/goal
  async getGoals() {
    const data = await api.get(`${GOAL_BASE_URL}`);
    console.log('GOAL GET LIST:', data);
    return data;
  },

  // 2. 특정 목표 조회
  // GET /api/goal/{goalId}
  async getGoal(goalId) {
    const data = await api.get(`${GOAL_BASE_URL}/${goalId}`);
    console.log('GOAL GET DETAIL:', data);
    return data;
  },

  // 3. 새 목표 생성
  // POST /api/goal
  async createGoal(goalData) {
    const data = await api.post(`${GOAL_BASE_URL}`, goalData);
    console.log('GOAL CREATE:', data);
    return data;
  },

  // 4. 목표 수정
  // PUT /api/goal/{goalId}
  async updateGoal(goalId, goalData) {
    const data = await api.put(`${GOAL_BASE_URL}/${goalId}`, goalData);
    console.log('GOAL UPDATE:', data);
    return data;
  },

  // 5. 목표 삭제
  // DELETE /api/goal/{goalId}
  async deleteGoal(goalId) {
    const data = await api.delete(`${GOAL_BASE_URL}/${goalId}`);
    console.log('GOAL DELETE:', data);
    return data;
  },

  // 6. 목표 달성률 조회
  // GET /api/goal/{goalId}/achievement-rate
  async getAchievementRate(goalId) {
    const data = await api.get(`${GOAL_BASE_URL}/${goalId}/achievement-rate`);
    console.log('GOAL ACHIEVEMENT RATE:', data);
    return data;
  },

  // 7. 목표 달성 예상 날짜 조회
  // GET /api/goal/{goalId}/expected-date?monthlyAmount={amount}
  async getExpectedDate(goalId, monthlyAmount) {
    const data = await api.get(`${GOAL_BASE_URL}/${goalId}/expected-date`, {
      params: { monthlyAmount },
    });
    console.log('GOAL EXPECTED DATE:', data);
    return data;
  },

  // 8. 목표 달성 여부 확인
  // GET /api/goal/{goalId}/is-achieved
  async isGoalAchieved(goalId) {
    const data = await api.get(`${GOAL_BASE_URL}/${goalId}/is-achieved`);
    console.log('GOAL IS ACHIEVED:', data);
    return data;
  },

  // 9. 목표 상태 업데이트
  // PATCH /api/goal/{goalId}/status
  async updateGoalStatus(goalId, status) {
    const data = await api.patch(`${GOAL_BASE_URL}/${goalId}/status`, status);
    console.log('GOAL STATUS UPDATE:', data);
    return data;
  },

  // 10. 1억 모으기 목표 조회
  // GET /api/goal/billion
  async getBillionGoal() {
    const data = await api.get(`${GOAL_BASE_URL}/billion`);
    console.log('BILLION GOAL:', data);
    return data;
  },

  // 11. 남은 금액 계산
  // GET /api/goal/{goalId}/remaining-amount
  async getRemainingAmount(goalId) {
    const data = await api.get(`${GOAL_BASE_URL}/${goalId}/remaining-amount`);
    console.log('REMAINING AMOUNT:', data);
    return data;
  },

  // 12. 남은 기간 계산 (일 단위)
  // GET /api/goal/{goalId}/remaining-days
  async getRemainingDays(goalId) {
    const data = await api.get(`${GOAL_BASE_URL}/${goalId}/remaining-days`);
    console.log('REMAINING DAYS:', data);
    return data;
  },

  // 13. 목표 키워드 조회
  // GET /api/goal/{goalId}/keyword
  async getGoalKeyword(goalId) {
    const data = await api.get(`${GOAL_BASE_URL}/${goalId}/keyword`);
    console.log('GOAL KEYWORD:', data);
    return data;
  },

  // === 기타 편의 메서드===

  // 목표 데이터 포맷팅 (날짜 형식 등)
  formatGoalData(goalData) {
    return {
      ...goalData,
      goalDate: goalData.goalDate
        ? this.formatDateForBackend(goalData.goalDate)
        : null,
      targetAmount: parseFloat(goalData.targetAmount || 0),
    };
  },
  // 날짜 포맷팅 헬퍼 메서드 추가
  formatDateForBackend(dateValue) {
    if (!dateValue) return null;

    // dateValue가 이미 "YYYY-MM-DD HH:mm:ss" 형식이면 그대로 반환
    if (typeof dateValue === 'string' && dateValue.includes(' ')) {
      return dateValue;
    }

    // "YYYY-MM-DD" 형식이면 시간 추가
    if (typeof dateValue === 'string' && dateValue.length === 10) {
      return `${dateValue} 23:59:59`;
    }

    // Date 객체인 경우 로컬 시간대로 포맷팅
    if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      return `${year}-${month}-${day} 23:59:59`;
    }

    return null;
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

  // === 계좌-목표 연결 관련 함수들 ===

  // 계좌 연결 - 여러 계좌를 한 목표에 연결
  async linkAccountsToGoal(goalId, accountIds) {
    try {
      // accountApi의 updateAccountsByGoal 사용
      const { updateAccountsByGoal } = await import('@/api/accountApi');

      const data = {
        goalId: goalId,
        accountIds: accountIds, // [1, 2, 3] 형태의 계좌 ID 배열
      };

      const result = await updateAccountsByGoal(data);
      console.log('ACCOUNTS LINKED TO GOAL:', result);
      return result;
    } catch (error) {
      console.error('계좌 연결 실패:', error);
      throw error;
    }
  },

  // 계좌 연결 해제 - 특정 계좌의 목표 연결 해제
  async unlinkAccountFromGoal(accountId) {
    try {
      // goalId를 null로 설정하여 연결 해제
      const { updateAccountsByGoal } = await import('@/api/accountApi');

      const data = {
        goalId: null,
        accountIds: [accountId], // 단일 계좌도 배열로 전달
      };

      const result = await updateAccountsByGoal(data);
      console.log('ACCOUNT UNLINKED FROM GOAL:', result);
      return result;
    } catch (error) {
      console.error('계좌 연결 해제 실패:', error);
      throw error;
    }
  },

  // 현재 달성 금액 - 목표에 연결된 계좌들의 잔액 합계 반환
  async getCurrentAmountByGoal(goalId) {
    try {
      // accountApi의 getAccountsByGoal 사용
      const { getAccountsByGoal } = await import('@/api/accountApi');

      // 1. 목표별 계좌 조회
      const linkedAccountsResponse = await getAccountsByGoal(goalId);

      // 2. 프론트엔드에서 잔액 합계 계산
      const accountList = linkedAccountsResponse.accountList || [];
      const totalAmount = accountList.reduce((sum, account) => {
        return sum + (account.balance || 0);
      }, 0);

      console.log(`CURRENT AMOUNT FOR GOAL ${goalId}:`, totalAmount);
      return totalAmount;
    } catch (error) {
      console.error('현재 달성 금액 조회 실패:', error);
      throw error;
    }
  },
};
