<template>
  <div class="goal-main-container">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1 class="page-title">나의 목표</h1>
      <router-link :to="{ name: 'goalCreate' }" class="add-button">
        <i class="fas fa-plus"></i>
      </router-link>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="goalStore.loading" class="loading-container">
      <div class="loading-spinner">목표를 불러오는 중...</div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="goalStore.error" class="error-container">
      <div class="error-message">목표를 불러오는데 실패했습니다.</div>
      <button @click="loadGoals" class="retry-button">다시 시도</button>
    </div>

    <template v-else>
      <!-- 1억 모으기 배너 (1억 모으기 목표가 없을 때만 표시) -->
      <div
        v-if="!hasBillionGoal"
        class="banner-section"
        @click="goToBillionGoalCreate"
      >
        <div class="banner-content">
          <div class="banner-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="banner-text">
            <div class="banner-title">'1억 모으기'에 참가하시겠습니까?</div>
            <div class="banner-subtitle">
              지금 시작해서 목표를 달성해보세요!
            </div>
          </div>
          <div class="banner-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      <!-- 목표 카드 리스트 -->
      <div class="goals-container">
        <div v-if="goalStore.goals.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-flag"></i>
          </div>
          <p>아직 설정된 목표가 없습니다.</p>
          <p>첫 번째 목표를 설정해보세요!</p>
        </div>

        <div v-else class="goals-list">
          <GoalCard
            v-for="goal in sortedGoals"
            :key="goal.goalId"
            :goal="transformGoal(goal)"
            @click="goToGoalDetail(goal.goalId)"
            @delete="handleDeleteGoal"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGoalStore } from '@/stores/goalStore';
import GoalCard from '../../components/goal/GoalCard.vue';
import goalApi from '@/api/goalApi'; // 🔄 추가: goalApi 임포트 (계좌 연결 기능 사용을 위해)

const router = useRouter();
const goalStore = useGoalStore();

// 1억 모으기 목표가 있는지 확인
const hasBillionGoal = computed(() => {
  return goalStore.goals.some(
    (goal) => goal.goalName === '1억 모으기' && goal.targetAmount === 100000000
  );
});

// 목표 정렬 (1억 모으기 목표를 최상단에 배치)
const sortedGoals = computed(() => {
  return [...goalStore.goals].sort((a, b) => {
    const aIsBillion =
      a.goalName === '1억 모으기' && a.targetAmount === 100000000;
    const bIsBillion =
      b.goalName === '1억 모으기' && b.targetAmount === 100000000;

    // 1억 모으기 목표를 최상단에 배치
    if (aIsBillion && !bIsBillion) return -1;
    if (!aIsBillion && bIsBillion) return 1;

    // 나머지는 생성일 순으로 정렬
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
});

// 목표 데이터 로드 - goalStore 사용
const loadGoals = async () => {
  try {
    // getGoalsByUserId에서 getGoals로 변경 (userId 파라미터 제거)
    await goalStore.getGoals();

    // 추가: 각 목표별로 현재 달성 금액 조회 (연결된 계좌 잔액 합계)
    for (const goal of goalStore.goals) {
      try {
        const currentAmount = await goalApi.getCurrentAmountByGoal(goal.goalId);
        goal.currentAmount = currentAmount;
      } catch (error) {
        console.error(`목표 ${goal.goalId}의 현재 금액 조회 실패:`, error);
        goal.currentAmount = 0;
      }
    }
  } catch (error) {
    console.error('목표 로딩 실패:', error);
  }
};

// 목표 데이터 변환 (GoalCard 컴포넌트 형식에 맞게)
const transformGoal = (goal) => {
  return {
    id: goal.goalId,
    name: goal.goalName,
    currentAmount: goal.currentAmount || 0, // 🔄 수정: 계좌 연결로 가져온 실제 금액 사용
    targetAmount: goal.targetAmount,
    progress:
      goal.currentAmount && goal.targetAmount
        ? (goal.currentAmount / goal.targetAmount) * 100
        : 0,
    targetDate: goal.goalDate,
    memo: goal.memo,
  };
};

// 1억 모으기 목표 생성 페이지로 이동
const goToBillionGoalCreate = () => {
  router.push({
    name: 'goalCreate',
    query: { preset: 'billion' },
  });
};

// 목표 삭제 처리 - goalStore 사용
const handleDeleteGoal = async (goalId) => {
  if (!confirm('정말로 이 목표를 삭제하시겠습니까?')) {
    return;
  }

  try {
    // deleteGoal에서 userId 파라미터 제거
    await goalStore.deleteGoal(goalId);
    console.log('목표가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('목표 삭제 실패:', error);
    alert('목표 삭제에 실패했습니다.');
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

// 페이지 포커스 시 데이터 새로고침
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

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  gap: 16px;
}

.loading-spinner {
  font-size: 16px;
  color: #666;
}

.error-message {
  font-size: 16px;
  color: #dc3545;
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

.banner-section {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.banner-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.banner-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 1;
}

.banner-icon {
  font-size: 24px;
  color: #b8860b;
  animation: sparkle 2s ease-in-out infinite alternate;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: #b8860b;
  margin-bottom: 4px;
}

.banner-subtitle {
  font-size: 13px;
  color: #996f00;
}

.banner-arrow {
  font-size: 16px;
  color: #b8860b;
}

@keyframes sparkle {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.goals-container {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 20px;
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

  .banner-content {
    gap: 12px;
  }

  .banner-title {
    font-size: 14px;
  }

  .banner-subtitle {
    font-size: 12px;
  }

  .goals-list {
    gap: 15px;
  }
}
</style>
