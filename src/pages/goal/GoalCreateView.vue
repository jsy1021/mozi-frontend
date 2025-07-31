<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner">목표를 생성하는 중...</div>
  </div>

  <GoalForm
    v-else
    :is-edit="false"
    :preset-data="presetData"
    @submit="handleCreateGoal"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGoalStore } from '@/stores/goalStore';
import GoalForm from '../../components/goal/GoalForm.vue';

const router = useRouter();
const route = useRoute();
const goalStore = useGoalStore();

const loading = ref(false);

// 현재 사용자 ID (실제로는 인증 스토어에서 가져와야 함)
const currentUserId = 1; // TODO: 실제 사용자 ID로 변경

// 1억 모으기 프리셋 데이터
const presetData = computed(() => {
  if (route.query.preset === 'billion') {
    return {
      goalName: '1억 모으기',
      targetAmount: 100000000,
    };
  }
  return null;
});

// 목표 생성 처리 - goalStore 사용
const handleCreateGoal = async (formData) => {
  try {
    loading.value = true;

    // goalStore의 createGoal 메서드 사용
    await goalStore.createGoal(currentUserId, formData);

    console.log('Goal created successfully');

    // 목표 메인 페이지로 이동
    router.push({ name: 'goalMain' });
  } catch (error) {
    console.error('Error creating goal:', error);

    // goalStore의 에러 처리
    if (goalStore.error) {
      alert('목표 생성 중 오류가 발생했습니다.');
    }
  } finally {
    loading.value = false;
  }
};

// 취소 처리
const handleCancel = () => {
  router.push({ name: 'goalMain' });
};
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.loading-spinner {
  font-size: 16px;
  color: #666;
}
</style>
