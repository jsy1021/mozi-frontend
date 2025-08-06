<script setup>
import { onMounted, ref, computed } from 'vue';
import recommendPolicyAPI from '@/api/recommendPolicyApi';
import RecommendCarousel from '@/pages/recommend/policy/recommendCarousel.vue';

const props = defineProps({
  goalId: {
    type: [Number, String],
    required: true,
  },
});

const numericGoalId = Number(props.goalId);

const goalRecommendations = ref([]);

const keywordMap = {
  MARRIAGE: '결혼',
  EMPLOYMENT: '취업',
  HOME_PURCHASE: '내집마련',
  TRAVEL: '여행',
  EDUCATION_FUND: '학자금',
  HOBBY: '취미',
};

const filteredRecommendations = computed(() =>
  goalRecommendations.value.filter((goal) => goal.goalId === numericGoalId)
);

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

<template>
  <div>
    <div v-if="filteredRecommendations.length">
      <div
        v-for="goal in filteredRecommendations"
        :key="goal.goalId"
        class="mb-4"
      >
        <!-- <div class="goal-header">
          <h5 class="goal-title">{{ goal.goalName }}</h5>
          <span class="goal-keyword">
            #{{ keywordMap[goal.keyword] ?? goal.keyword }}
          </span>
        </div> -->
        <RecommendCarousel :cards="goal.recommendations" />
        <!-- <hr /> -->
      </div>
    </div>
    <div v-else class="text-muted text-center">추천할 상품이 없습니다.</div>
  </div>
</template>

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
