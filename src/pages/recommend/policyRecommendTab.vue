<!-- policyRecommendTab.vue -->
<template>
  <div>
    <div v-if="goalRecommendations.length">
      <div
        v-for="(goal, index) in goalRecommendations"
        :key="goal.goalId"
        class="mb-4"
      >
        <div class="goal-header">
          <h5 class="goal-title">{{ goal.goalName }}</h5>
          <span class="goal-keyword">
            #{{ keywordMap[goal.keyword] ?? goal.keyword }}
          </span>
        </div>

        <RecommendCarousel
          :cards="goal.recommendations"
          @bookmark-changed="
            ({ plcyNo, bookmarked }) =>
              onBookmarkChanged(gi, plcyNo, bookmarked)
          "
        />

        <!-- 마지막 목표가 아닐 때만 hr 출력 -->
        <hr
          v-if="index < goalRecommendations.length - 1"
          style="margin: 16px 0"
        />
      </div>
    </div>
    <div v-else class="text-muted text-center">목표가 없습니다.</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import recommendPolicyAPI from '@/api/recommendPolicyApi';
import RecommendCarousel from './policy/recommendCarousel.vue';
import { getScrappedPolicyIds } from '@/api/scrapApi';
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
    const [res, scrapped] = await Promise.all([
      recommendPolicyAPI.getAllRecommendedPolicies(),
      getScrappedPolicyIds(),
    ]);
    const scrNo = (scrapped ?? []).map((n) => String(n).trim());

    goalRecommendations.value = (res ?? []).map((group) => ({
      ...group,
      recommendations: (group.recommendations ?? []).map((p) => {
        const no = String(p.plcyNo ?? '').trim();
        return { ...p, plcyNo: no, bookmarked: scrNo.includes(no) };
      }),
    }));
  } catch (e) {
    console.error('❌ 전체 추천 로딩 실패:', e);
    goalRecommendations.value = [];
  }
});

const onBookmarkChanged = (groupIndex, plcyNo, bookmarked) => {
  const gi = groupIndex;
  if (gi < 0 || gi >= goalRecommendations.value.length) return;
  const list = goalRecommendations.value[gi].recommendations;
  const idx = list.findIndex(
    (x) => String(x.plcyNo).trim() === String(plcyNo).trim()
  );
  if (idx !== -1) list[idx].bookmarked = bookmarked;
};
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
