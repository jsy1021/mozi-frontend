<!-- policyRecommendTab.vue -->
<template>
  <div>
    <div v-if="goalRecommendations.length">
      <div v-for="goal in goalRecommendations" :key="goal.goalId" class="mb-4">
        <!-- 목표 정보 -->
        <h5 class="goal-title">
          🎯 목표: {{ goal.keyword }} (ID: {{ goal.goalId }})
        </h5>
        <hr />

        <!-- 추천 정책 카드 리스트 (가로 스크롤) -->
        <div v-if="goal.recommendations.length">
          <RecommendCardList :cards="goal.recommendations" type="policy" />
        </div>
        <p v-else class="text-muted">추천할 정책이 없습니다.</p>
      </div>
    </div>
    <div v-else class="text-muted text-center">목표가 없습니다.</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import recommendPolicyAPI from '@/api/recommendPolicyApi';
import RecommendCardList from './recommendCardList.vue';

const goalRecommendations = ref([]);

onMounted(async () => {
  try {
    const res = await recommendPolicyAPI.getAllRecommendedPolicies();
    goalRecommendations.value = res ?? [];
  } catch (e) {
    console.error('❌ 전체 추천 로딩 실패:', e);
    goalRecommendations.value = [];
  }
});
</script>
