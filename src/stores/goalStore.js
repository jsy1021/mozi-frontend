import { defineStore } from 'pinia';
import goalApi from '@/api/goalApi';

//목표 관련 스토어

export const useGoalStore = defineStore('goal', {
    //
    state : () => ({
        goals: [],          // 사용자의 목표 리스트 전체
        selectedGoal: null, // 단일 목표 상세
        loading: false,     // API 요청 진행중인지 여부
        error: null         // API 요청 중 발생한 오류
    }),

    //
    getters: {
        // 목표 개수
        goalCount: (state) => state.goals.length,
        // 달성 완료 목표 : goalStatus === false 인 목표
        achievedGoals: (state) => state.goals.filter(g => g.goalStatus === false),
    },

    // 
    actions: {
        // 공통 로딩/에러
        async wrapRequest(fn){
            this.loading = true
            this.error = null
            try{
                return await fn()
            } catch (err){
                console.error('Goal Store API Error: ', err)
                this.error = err
                throw err
            } finally{
                this.loading = false
            }
        },

        // 1. 사용자별 목표 목록 조회
        async getGoalsByUserId(userId) {
            const data = await this.wrapRequest(() => goalApi.getGoalsByUserId(userId))
            this.goals = data
        },

        // 2. 특정 목표 조회
        async getGoal(userId, goalId) {
            const data = await this.wrapRequest(() => goalApi.getGoal(userId, goalId))
            this.selectedGoal = data
        },

        // 3. 새 목표 생성
        async createGoal(userId, goalData){
            const formatted = goalApi.formatGoalData(goalData)
            const data = await this.wrapRequest(() => goalApi.createGoal(userId, formatted))
            this.goals.push(data)
            return data
        },

        // 4. 목표 수정
        async updateGoal(userId, goalId, goalData){
            const formatted = goalApi.formatGoalData(goalData)
            const data = await this.wrapRequest(() => 
                goalApi.updateGoal(userId, goalId, formatted)
            )
            const idx = this.goals.findIndex(g => g.goalId === goalId)
            // if(idx !== -1) this.goals[idx] = { ...this.goals[idx], ...formatted }
            if (idx !== -1) this.goals[idx] = data

            return data
        },

        // 5. 목표 삭제
        async deleteGoal(userId, goalId){
            const data = await this.wrapRequest(() => goalApi.deleteGoal(userId, goalId))
            if(data) this.goals = this.goals.filter(g => g.goalId !== goalId)
            return data
        },

        // 6. 목표 달성률 조회
        async getAchievementRate(userId, goalId){
            return this.wrapRequest(() => goalApi.getAchievementRate(userId, goalId))
        },

        // 7. 목표 달성 예상 날짜 조회
        async getExpectedDate(userId, goalId, monthlyAmount){
            return this.wrapRequest(() =>
                goalApi.getExpectedDate(userId, goalId, monthlyAmount)
            )
        },

        // 8. 목표 달성 여부 확인
        async isGoalAchieved(userId, goalId){
            return this.wrapRequest(() => goalApi.isGoalAchieved(userId, goalId))
        },

        // 9. 목표 상태 업데이트
        async updateGoalStatus(userId, goalId, status){
            return this.wrapRequest(() => goalApi.updateGoalStatus(userId, goalId, status))
        },

        // 10. 1억 모으기 목표 조회
        async getBillionGoal(userId){
            return this.wrapRequest(() => goalApi.getBillionGoal(userId))
        },

        // 11. 남은 금액 계산
        async getRemainingAmount(userId, goalId) {
            return this.wrapRequest(() => goalApi.getRemainingAmount(userId, goalId))
        },

        // 12. 남은 기간 계산 (일 단위)
        async getRemainingDays(userId, goalId) {
            return this.wrapRequest(() => goalApi.getRemainingDays(userId, goalId))
        },

        // 13. 목표 키워드 조회
        async getGoalKeyword(userId, goalId) {
            return this.wrapRequest(() => goalApi.getGoalKeyword(userId, goalId))
        }


    }

})