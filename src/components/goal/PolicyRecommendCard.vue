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

const emit = defineEmits(['loading']);

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
  emit('loading', true);
  try {
    const res = await recommendPolicyAPI.getAllRecommendedPolicies();
    console.log('✅ 받은 추천 데이터:', res);
    goalRecommendations.value = res ?? [];
  } catch (e) {
    console.error('❌ 전체 추천 로딩 실패:', e);
    goalRecommendations.value = [];
  } finally {
    emit('loading', false);
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
        <RecommendCarousel :cards="goal.recommendations" />
      </div>
    </div>

    <!-- 추천 상품이 없을 때 -->
    <div v-else class="text-center text-muted py-4">
      <div class="empty-state">
        <i class="fa-solid fa-coins empty-icon"></i>
        <p class="empty-title"><strong>추천할 정책이 없습니다</strong></p>
        <p class="empty-desc">
          목표 정보를 업데이트하시면<br />더 정확한 추천을 받을 수 있어요!
        </p>
      </div>
    </div>
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

/* 빈 상태 */
.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 20px;
  color: #ddd;
  margin-bottom: 6px;
}

.empty-title {
  font-size: 14px;
}

.empty-desc {
  color: #888;
  font-size: 12px;
  line-height: 1.4;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d;
}

.py-4 {
  padding: 1.5rem 0;
}
</style>
