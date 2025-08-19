import { defineStore } from 'pinia';
import goalApi from '@/api/goalApi';

//목표 관련 스토어

export const useGoalStore = defineStore('goal', {
  //
  state: () => ({
    goals: [], // 사용자의 목표 리스트 전체
    selectedGoal: null, // 단일 목표 상세
    loading: false, // API 요청 진행중인지 여부
    error: null, // API 요청 중 발생한 오류
  }),

  //
  getters: {
    // 목표 개수
    goalCount: (state) => state.goals.length,
    // 달성 완료 목표 : goalStatus === false 인 목표
    achievedGoals: (state) => state.goals.filter((g) => g.goalStatus === false),
  },

  //
  actions: {
    // 공통 로딩/에러
    async wrapRequest(fn) {
      this.loading = true;
      this.error = null;
      try {
        return await fn();
      } catch (err) {
        console.error('Goal Store API Error: ', err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 1. 사용자별 목표 목록 조회
    async getGoals() {
      const data = await this.wrapRequest(() => goalApi.getGoals());
      this.goals = data;
    },

    // 2. 특정 목표 조회
    async getGoal(goalId) {
      const data = await this.wrapRequest(() => goalApi.getGoal(goalId));
      this.selectedGoal = data;
    },

    // 목표 생성/수정 시 formatGoalData 사용 확인
    async createGoal(goalData) {
      const formatted = goalApi.formatGoalData(goalData); // ← goalApi 수정으로 자동 해결
      const data = await this.wrapRequest(() => goalApi.createGoal(formatted));
      this.goals.push(data);
      return data;
    },

    async updateGoal(goalId, goalData) {
      const formatted = goalApi.formatGoalData(goalData); // ← goalApi 수정으로 자동 해결
      const data = await this.wrapRequest(() =>
        goalApi.updateGoal(goalId, formatted)
      );
      const idx = this.goals.findIndex((g) => g.goalId === goalId);
      if (idx !== -1) this.goals[idx] = data;
      return data;
    },

    // 5. 목표 삭제
    async deleteGoal(goalId) {
      const data = await this.wrapRequest(() => goalApi.deleteGoal(goalId));
      if (data) this.goals = this.goals.filter((g) => g.goalId !== goalId);
      return data;
    },

    // 6. 목표 달성률 조회
    async getAchievementRate(goalId) {
      return this.wrapRequest(() => goalApi.getAchievementRate(goalId));
    },

    // 7. 목표 달성 예상 날짜 조회
    async getExpectedDate(goalId, monthlyAmount) {
      return this.wrapRequest(() =>
        goalApi.getExpectedDate(goalId, monthlyAmount)
      );
    },

    // 8. 목표 달성 여부 확인
    async isGoalAchieved(goalId) {
      return this.wrapRequest(() => goalApi.isGoalAchieved(goalId));
    },

    // 9. 목표 상태 업데이트
    async updateGoalStatus(goalId, status) {
      return this.wrapRequest(() => goalApi.updateGoalStatus(goalId, status));
    },

    // 10. 1억 모으기 목표 조회
    async getBillionGoal() {
      return this.wrapRequest(() => goalApi.getBillionGoal());
    },

    // 11. 남은 금액 계산
    async getRemainingAmount(goalId) {
      return this.wrapRequest(() => goalApi.getRemainingAmount(goalId));
    },

    // 12. 남은 기간 계산 (일 단위)
    async getRemainingDays(goalId) {
      return this.wrapRequest(() => goalApi.getRemainingDays(goalId));
    },

    // 13. 목표 키워드 조회
    async getGoalKeyword(goalId) {
      return this.wrapRequest(() => goalApi.getGoalKeyword(goalId));
    },
  },
});

export function formatCurrency(amount) {
  if (amount == null || isNaN(Number(amount))) return '0원';
  const num = Number(amount);
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억원`;
  if (num >= 10000) return `${(num / 10000).toFixed(0)}만원`;
  return `${num.toLocaleString()}원`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split(' ')[0].split('-');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function maskAccountNumber(accountNumber) {
  if (!accountNumber) return '';
  const s = String(accountNumber).trim();
  if (s.length <= 4) return s;
  const visible = 4;
  const first = s.slice(0, visible);
  const last = s.slice(-visible);
  const middleLength = s.length - visible * 2;
  let middlePart = '*'.repeat(middleLength).split('');
  for (let i = 0; i < middleLength; i++) {
    if (s[visible + i] === '-') middlePart[i] = '-';
  }
  return `${first}${middlePart.join('')}${last}`;
}

export function getDDay(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split(' ')[0].split('-');
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export function formatName(name) {
  return name ? name.replace(/\n/g, '<br>') : '';
}

export const keywords = [
  { key: 'MARRIAGE', label: '결혼' },
  { key: 'EMPLOYMENT', label: '취업' },
  { key: 'HOME_PURCHASE', label: '내집마련' },
  { key: 'TRAVEL', label: '여행' },
  { key: 'EDUCATION_FUND', label: '학자금' },
  { key: 'HOBBY', label: '취미' },
];

export function keywordToKorean(keyword) {
  const match = keywords.find((k) => k.key === keyword);
  return match ? match.label : keyword;
}
