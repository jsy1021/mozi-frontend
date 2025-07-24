<template>
  <div class="goal-main-container">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1 class="page-title">나의 목표</h1>
      <router-link :to="{ name: 'goalCreate' }" class="add-button">
        <i class="fas fa-plus"></i>
      </router-link>
    </div>

    <!-- 1억 모으기 배너 이부분은 차후 수정 예정 현재는 아무 목표가 없을때 띄워줌-->
    <div v-if="goals.length === 0" class="banner-section">
      <div class="banner-text">'1억 모으기'에 참가하시겠습니까?</div>
    </div>

    <!-- 목표 카드 리스트 -->
    <div class="goals-container">
      <div v-if="goals.length === 0" class="empty-state">
        <p>아직 설정된 목표가 없습니다.</p>
        <p>첫 번째 목표를 설정해보세요!</p>
      </div>

      <div v-else class="goals-list">
        <GoalCard
          v-for="goal in goals"
          :key="goal.goal_id"
          :goal="transformGoal(goal)"
          @click="goToGoalDetail(goal.goal_id)"
          @delete="handleDeleteGoal"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GoalCard from '../../components/goal/GoalCard.vue';
import mockData from '../../data/db.json';

const router = useRouter();

// 목표 데이터
const goals = ref([]);

// 목표 데이터 로드
const loadGoals = () => {
  // 로컬 스토리지에서 먼저 확인
  const storedData = localStorage.getItem('moziGoals');

  if (storedData) {
    goals.value = JSON.parse(storedData);
  } else {
    // 로컬 스토리지가 없으면 mockData로 초기화
    goals.value = mockData.goals;
    localStorage.setItem('moziGoals', JSON.stringify(mockData.goals));
  }
};

// 목표 데이터 변환 (GoalCard 컴포넌트 형식에 맞게)
const transformGoal = (goal) => {
  return {
    id: goal.goal_id,
    name: goal.goal_name,
    currentAmount: goal.current_amount,
    targetAmount: goal.target_amount,
    progress: (goal.current_amount / goal.target_amount) * 100,
    targetDate: goal.goal_date,
    memo: goal.memo,
  };
};

// 목표 삭제 처리
const handleDeleteGoal = (goalId) => {
  const index = goals.value.findIndex((g) => g.goal_id === goalId);
  if (index > -1) {
    goals.value.splice(index, 1);
    // 로컬 스토리지 업데이트
    localStorage.setItem('moziGoals', JSON.stringify(goals.value));
  }
};

// 목표 상세 페이지로 이동
const goToGoalDetail = (goalId) => {
  router.push({ name: 'goalDetail', params: { goalId } });
};

// 컴포넌트 마운트 시 실행
onMounted(() => {
  loadGoals();
});

// 페이지 포커스 시 데이터 새로고침 (다른 페이지에서 수정 후 돌아왔을 때)
window.addEventListener('focus', loadGoals);
</script>

<style scoped>
.goal-main-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 5px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.add-button {
  color: #333;
  font-size: 18px;
  text-decoration: none;
  padding: 8px;
}

.banner-section {
  background-color: #e9ecef;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 30px;
}

.banner-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.goals-container {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state p {
  margin: 10px 0;
  font-size: 16px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 480px) {
  .goal-main-container {
    padding: 15px;
  }

  .page-header {
    margin-bottom: 15px;
  }

  .page-title {
    font-size: 16px;
  }

  .banner-text {
    font-size: 14px;
  }

  .goals-list {
    gap: 15px;
  }
}
</style>
