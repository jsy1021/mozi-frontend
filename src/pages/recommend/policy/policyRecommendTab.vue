<!-- policyRecommendTab.vue -->
<template>
  <div>
    <div v-if="goalRecommendations.length">
      <div v-for="goal in goalRecommendations" :key="goal.goalId" class="mb-4">
        <div class="goal-header">
          <h5 class="goal-title">{{ goal.goalName }}</h5>
          <span class="goal-keyword">
            #{{ keywordMap[goal.keyword] ?? goal.keyword }}
          </span>
        </div>
        <RecommendCarousel :cards="goal.recommendations" />
        <hr />
      </div>
    </div>
    <div v-else class="text-muted text-center">목표가 없습니다.</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import recommendPolicyAPI from '@/api/recommendPolicyApi';
import RecommendCarousel from './recommendCarousel.vue';

const goalRecommendations = ref([]);

const keywordMap = {
  MARRIAGE: '결혼',
  EMPLOYMENT: '취업',
  HOME_PURCHASE: '내집마련',
  TRAVEL: '여행',
  EDUCATION_FUND: '학자금',
  HOBBY: '취미',
};

onMounted(async () => {
  try {
    const res = await recommendPolicyAPI.getAllRecommendedPolicies();
    console.log('✅ 받은 추천 데이터:', res);
    goalRecommendations.value = res ?? [];
  } catch (e) {
    console.error('❌ 전체 추천 로딩 실패:', e);
    goalRecommendations.value = [];
  }
});
</script>

<style>
.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5px 12px;
}

.goal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.goal-title .icon-left {
  margin-right: 6px;
  font-size: 14px;
  color: #555;
}

.goal-keyword {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}
</style>
