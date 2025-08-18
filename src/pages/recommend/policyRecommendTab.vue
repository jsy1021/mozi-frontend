<!-- policyRecommendTab.vue -->
<template>
  <div class="tab-slot">
    <!-- 로딩 오버레이 -->
    <div
      v-show="isLoading"
      class="loading-overlay"
      aria-busy="true"
      aria-live="polite"
    >
      <div class="spinner"></div>
    </div>

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
              onBookmarkChanged(index, plcyNo, bookmarked)
          "
        />

        <hr
          v-if="index < goalRecommendations.length - 1"
          style="margin: 16px 0"
        />
      </div>
    </div>

    <!-- 목표가 없는 경우 -->
    <div
      v-else-if="!isLoading && !goalRecommendations.length"
      class="text-center text-muted py-4"
    >
      <img
        src="../../../public/images/noGoal.png"
        alt="추천 없음"
        class="empty-image"
      />
      <p><b>아직 목표가 없어요</b></p>
      <p>목표를 세우면 더 정교한 추천을<br />받을 수 있어요!</p>
      <button class="set-goal-btn" @click="goToGoalPage">
        목표 세우러 가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import recommendPolicyAPI from '@/api/recommendPolicyApi';
import RecommendCarousel from './policy/recommendCarousel.vue';
import { getScrappedPolicyIds } from '@/api/scrapApi';
import { useRouter } from 'vue-router';
const router = useRouter();

function goToGoalPage() {
  router.push('/goal');
}

const goalRecommendations = ref([]);

const isLoading = ref(true);

const keywordMap = {
  MARRIAGE: '결혼',
  EMPLOYMENT: '취업',
  HOME_PURCHASE: '내집마련',
  TRAVEL: '여행',
  EDUCATION_FUND: '학자금',
  HOBBY: '취미',
};

onMounted(async () => {
  isLoading.value = true;

  const cacheKey = 'recommend_policy_cache';

  // 캐시 확인
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      goalRecommendations.value = JSON.parse(cached);
      isLoading.value = false;
    } catch (e) {
      console.warn('캐시 파싱 실패, 새로 불러옴');
    }
  }

  try {
    const [res, scrapped] = await Promise.all([
      recommendPolicyAPI.getAllRecommendedPolicies(),
      getScrappedPolicyIds(),
    ]);
    const scrNo = (scrapped ?? []).map((n) => String(n).trim());

    const data = (res ?? []).map((group) => ({
      ...group,
      recommendations: (group.recommendations ?? []).map((p) => {
        const no = String(p.plcyNo ?? '').trim();
        return { ...p, plcyNo: no, bookmarked: scrNo.includes(no) };
      }),
    }));

    goalRecommendations.value = data;

    // 캐싱
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (e) {
    console.error('❌ 전체 추천 로딩 실패:', e);
    if (!cached) goalRecommendations.value = [];
  } finally {
    isLoading.value = false;
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
  font-size: 14px;
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

.tab-slot {
  position: relative;
  min-height: 220px;
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
  opacity: 0;
  transition: opacity 0.18s ease;
}
.loading-overlay:not([style*='display: none']) {
  opacity: 1;
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

.empty-image {
  width: 201px;
  height: auto;
  opacity: 0.8;
}

.set-goal-btn {
  background-color: #36c18c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  width: 200px;
  text-align: center;
}
.set-goal-btn:hover {
  background-color: #2fa477;
}
</style>
