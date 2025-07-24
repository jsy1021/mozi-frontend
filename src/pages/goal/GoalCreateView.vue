<template>
  <GoalForm
    :is-edit="false"
    @submit="handleCreateGoal"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { useRouter } from 'vue-router';
import GoalForm from '../../components/goal/GoalForm.vue';
import mockData from '../../data/db.json';

const router = useRouter();

// 목표 생성 처리
const handleCreateGoal = (formData) => {
  try {
    // 새 목표 생성
    const newGoal = {
      goal_id: Date.now(), // 임시 ID
      user_id: mockData.currentUser.user_id,
      goal_name: formData.goalName,
      keyword: formData.keyword,
      target_amount: formData.targetAmount,
      current_amount: 0,
      goal_date: formData.targetDate,
      memo: formData.memo,
      created_at: new Date().toISOString().split('T')[0],
      goalStatus: true,
    };

    // 로컬 스토리지에 저장 (백연결시 추후 여기서 API 호출)
    const storedData = localStorage.getItem('moziGoals');
    const goals = storedData ? JSON.parse(storedData) : mockData.goals;
    goals.push(newGoal);
    localStorage.setItem('moziGoals', JSON.stringify(goals));

    console.log('Goal created:', newGoal);

    // 목표 메인 페이지로 이동
    router.push({ name: 'goalMain' });
  } catch (error) {
    console.error('Error creating goal:', error);
    alert('목표 생성 중 오류가 발생했습니다.');
  }
};

// 취소 처리
const handleCancel = () => {
  router.push({ name: 'goalMain' });
};
</script>

<style scoped></style>
