<template>
  <div>
    <h5 class="goal-title">🎯 목표 ID: {{ goalId }}</h5>
    <!-- <span class="goal-id-label">🎯 "{{ goalName }}" 목표 추천</span> -->
    <hr />
    <div v-if="recommendedPolicies && recommendedPolicies.length">
      <RecommendPolicyCard
        v-for="policy in recommendedPolicies"
        :key="policy.plcyNo"
        :policy="policy"
        :is-scrapped="policy.bookmarked"
      />
    </div>
    <p v-else class="text-muted">추천할 정책이 없습니다.</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import recommendPolicyAPI from '@/api/recommendPolicyApi';
import RecommendPolicyCard from './recommendPolicyCard.vue';

const props = defineProps({
  goalId: Number,
});

const recommendedPolicies = ref([]);

onMounted(async () => {
  try {
    const recommended = await recommendPolicyAPI.getRecommendedPolicies(
      props.goalId
    );
    console.log('받은 추천 정책:', recommended); // 여기에 찍기
    recommendedPolicies.value = recommended ?? [];
  } catch (e) {
    console.error('❌ 추천 정책 로딩 실패:', e);
    recommendedPolicies.value = [];
  }
});
</script>
