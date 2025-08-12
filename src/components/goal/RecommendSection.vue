<script setup>
import RecommendCard from './RecommendCard.vue';

import { useRoute } from 'vue-router';
import { ref, onMounted, onBeforeUnmount } from 'vue';

import FinancialRecommendCard from './FinancialRecommendCard.vue';
import PolicyRecommendCard from './PolicyRecommendCard.vue';

const route = useRoute();
const goalId = route.params.goalId;

const props = defineProps({
  goalId: {
    type: Number,
    required: true,
  },
});

const isPolicyLoading = ref(false);

console.log(typeof props.goalId);
</script>

<template>
  <!-- <div> -->
  <div class="goal-recommend">
    <!-- 정책 -->
    <div class="policy" style="margin-bottom: 0; padding-bottom: 0">
      <div class="card-top">
        <div class="card-title" style="margin-top: 8px">
          <p>맞춤형 정책 제안</p>
        </div>
      </div>
      <!-- 정책 카드 -->
      <div class="card-slot">
        <div v-show="isPolicyLoading" class="loading-overlay">
          <div class="spinner"></div>
        </div>
        <PolicyRecommendCard
          :goal-id="props.goalId"
          @loading="isPolicyLoading = $event"
        />
      </div>
    </div>

    <!-- 금융 -->
    <div class="financial" style="margin-top: 0; padding-top: 0">
      <div class="card-top">
        <div class="card-title">
          <p>맞춤형 금융 상품</p>
        </div>
      </div>
      <!-- 금융 카드 -->
      <FinancialRecommendCard :goal-id="props.goalId" />
    </div>
  </div>
  <!-- </div> -->
</template>

<style scoped>
.goal-recommend {
  margin: 20px;
  border: 1px solid #e8f5f0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(54, 193, 140, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  overflow: hidden;
  transition: all 0.3s ease;
}

.goal-recommend:hover {
  box-shadow: 0 8px 32px rgba(54, 193, 140, 0.12);
  transform: translateY(-2px);
}

.goal-recommend > div {
  margin: 0;
  border-radius: 0;
  flex-direction: column;
  align-items: center;
  padding: 0px 16px;
  position: relative;
}

/* 정책과 금융 상품 섹션 구분선 */
.financial {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}

/* 카드 헤더 */
.card-top {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  width: 100%;
  position: relative;
}

.card-title {
  text-align: left;
  flex: 1;
}

.card-title > p {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  text-align: center;
  position: relative;
}

/* 제목에 아이콘 추가 */
.policy .card-title > p::before {
  content: '🏛️';
  margin-right: 8px;
  font-size: 14px;
}

.financial .card-title > p::before {
  content: '💰';
  margin-right: 8px;
  font-size: 14px;
}

/* 정책 섹션*/
.policy {
  position: relative;
  padding-top: 6px;
}

/* 금융 섹션*/
.financial {
  position: relative;
}

/* 섹션 구분을 위한 미묘한 효과 */
.policy::after {
  content: none;
}

/* 호버 효과 */
/* .policy:hover,
.financial:hover {
  background: linear-gradient(135deg, #f8fffe 0%, #e8f5f0 100%);
} */

/* 반응형 디자인 */
@media (max-width: 480px) {
  .goal-recommend {
    margin: 16px;
  }

  .goal-recommend > div {
    padding: 8px 12px;
  }

  .card-title > p {
    font-size: 15px;
  }

  .plusbtn a {
    width: 28px;
    height: 28px;
  }

  .plusbtn i {
    font-size: 12px;
  }
}

/* 애니메이션 효과 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.goal-recommend {
  animation: slideInUp 0.6s ease-out;
}

/* 스크롤 시 나타나는 효과 */
.policy,
.financial {
  transition: all 0.3s ease;
}

/* 포커스 상태 개선 */
.plusbtn a:focus {
  outline: 2px solid #36c18c;
  outline-offset: 2px;
}

/* 정책 로딩 스피너 */
.card-slot {
  position: relative;
  min-height: 160px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
  border-radius: 12px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(0, 0, 0, 0.12);
  border-top-color: rgba(0, 0, 0, 0.45);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
