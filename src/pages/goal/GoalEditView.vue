<template>
  <div v-if="goalStore.loading" class="loading-container">
    <div class="loading-spinner">목표 정보를 불러오는 중...</div>
  </div>

  <div v-else-if="goalStore.error" class="error-container">
    <div class="error-message">목표 정보를 불러올 수 없습니다.</div>
    <button @click="loadGoalData" class="retry-button">다시 시도</button>
  </div>

  <GoalForm
    v-else-if="goalData"
    :is-edit="true"
    :goal-data="goalData"
    @submit="handleUpdateGoal"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGoalStore } from '@/stores/goalStore';
import GoalForm from '../../components/goal/GoalForm.vue';

const router = useRouter();
const route = useRoute();
const goalStore = useGoalStore();

const goalData = ref(null);

// 현재 사용자 ID (실제로는 인증 스토어에서 가져와야 함)
const currentUserId = 1; // TODO: 실제 사용자 ID로 변경

// 목표 ID
const goalId = parseInt(route.params.goalId);

// 목표 데이터 로드 - goalStore 사용
const loadGoalData = async () => {
  try {
    // goalStore의 getGoal 메서드 사용
    await goalStore.getGoal(currentUserId, goalId);

    const goal = goalStore.selectedGoal;

    if (goal) {
      // GoalForm 컴포넌트 형식에 맞게 변환
      goalData.value = {
        id: goal.goalId,
        name: goal.goalName,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount || 0,
        targetDate: goal.goalDate,
        keyword: goal.keyword,
        memo: goal.memo,
        selectedAccounts: [], // 추후 계좌 연동 시 실제 데이터로 변경
      };
    } else {
      throw new Error('목표를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('Error loading goal:', error);

    // goalStore의 에러가 404인 경우 메인 페이지로 리다이렉트
    if (goalStore.error?.response?.status === 404) {
      alert('존재하지 않는 목표입니다.');
      router.push({ name: 'goalMain' });
    }
  }
};

// 목표 수정 처리 - goalStore 사용
const handleUpdateGoal = async (formData) => {
  try {
    // goalStore의 updateGoal 메서드 사용
    await goalStore.updateGoal(currentUserId, goalId, formData);

    console.log('Goal updated successfully');

    // 목표 메인 페이지로 이동
    router.push({ name: 'goalMain' });
  } catch (error) {
    console.error('Error updating goal:', error);

    // goalStore의 에러 처리
    if (goalStore.error) {
      alert('목표 수정 중 오류가 발생했습니다.');
    }
  }
};

// 취소 처리
const handleCancel = () => {
  router.push({ name: 'goalMain' });
};

// 컴포넌트 마운트 시 실행
onMounted(() => {
  if (!goalId || isNaN(goalId)) {
    alert('잘못된 목표 ID입니다.');
    router.push({ name: 'goalMain' });
    return;
  }

  loadGoalData();
});
</script>

<style scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  gap: 16px;
}

.loading-spinner {
  font-size: 16px;
  color: #666;
}

.error-message {
  font-size: 16px;
  color: #dc3545;
  text-align: center;
}

.retry-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background-color: #0056b3;
}
</style>
