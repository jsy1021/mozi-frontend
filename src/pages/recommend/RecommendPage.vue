<template>
  <div class="container py-3">
    <!-- 상단 타이틀 -->
    <div class="position-relative d-flex align-items-center mb-3">
      <!-- 타이틀 가운데 정렬 -->
      <div
        style="
          font-size: 18px;
          font-weight: bold;
          color: #757575;
          flex: 1;
          text-align: center;
        "
      >
        추천
      </div>
    </div>

    <!-- 추천 인트로 -->
    <div class="p-3 rounded bg-light mb-3 text-center">
      <p class="mb-1 fw-semibold" style="font-size: 14px">
        {{ userName }}님을 위한 맞춤 추천
      </p>
      <small class="text-muted" style="font-size: 12px"
        >목표와 프로필을 기반으로 추천을 제공합니다.</small
      >
    </div>

    <!-- 추천 탭 -->
    <ul class="nav nav-tabs recommend-tabs mb-3">
      <li class="nav-item" v-for="tab in tabs" :key="tab">
        <a
          href="#"
          class="nav-link"
          :class="{ active: currentTab === tab }"
          @click.prevent="changeTab(tab)"
        >
          {{ tab }}
        </a>
      </li>
    </ul>

    <!-- ✅ 탭 콘텐츠: 래퍼로 감싸서 높이 유지 + 밀림 방지 -->
    <div class="tab-content-wrapper">
      <transition name="slide-fade" mode="out-in">
        <component
          :is="
            currentTab === '금융상품'
              ? FinancialRecommendTab
              : policyRecommendTab
          "
          :user-id="userId"
          :goal-id="goalId"
          :key="currentTab"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import policyRecommendTab from './PolicyRecommendTab.vue';
import FinancialRecommendTab from './FinancialRecommendTab.vue';

const router = useRouter();
const route = useRoute();

const goBack = () => router.back();

const userName = '사용자';
const tabs = ['금융상품', '청년정책'];

// 탭 유지
const ACTIVE_TAB_KEY = 'recommend_active_tab';
const VALID_TABS = new Set(tabs);

const currentTab = ref('금융상품');

// 탭 변경: 상태 + 세션 + URL 쿼리 동기화
function changeTab(tab) {
  if (!VALID_TABS.has(tab)) return;
  currentTab.value = tab;
  sessionStorage.setItem(ACTIVE_TAB_KEY, tab);
  try {
    router.replace({ query: { ...(route?.query || {}), tab } });
  } catch (_) {}
}

// 초기 복원: URL 쿼리 > 세션 > 기본값
onMounted(() => {
  const fromQuery =
    typeof route?.query?.tab === 'string' ? route.query.tab : null;
  const fromSession = sessionStorage.getItem(ACTIVE_TAB_KEY);

  if (fromQuery && VALID_TABS.has(fromQuery)) {
    currentTab.value = fromQuery;
    sessionStorage.setItem(ACTIVE_TAB_KEY, fromQuery);
  } else if (fromSession && VALID_TABS.has(fromSession)) {
    currentTab.value = fromSession;
    try {
      router.replace({ query: { ...(route?.query || {}), tab: fromSession } });
    } catch (_) {
      /* noop */
    }
  } else {
    changeTab(currentTab.value);
  }
});

watch(currentTab, (v) => {
  if (VALID_TABS.has(v)) sessionStorage.setItem(ACTIVE_TAB_KEY, v);
});
/* 주의: userId/goalId는 상위에서 내려주거나 라우트에서 가져오세요.
   필요하면 아래처럼 라우트 파라미터로 받을 수도 있음.
   const route = useRoute();
   const userId = computed(() => route.params.userId);
   const goalId = computed(() => route.params.goalId);
*/

const userId = undefined;
const goalId = undefined;
</script>

<style scoped>
.position-relative {
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.title-center {
  flex: 1;
  text-align: center;
  font-weight: bold;
}

.settings-icon {
  position: absolute;
  right: 0;
  cursor: pointer;
}

.recommend-tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ddd;
}
.recommend-tabs .nav-item {
  flex: 1; /* 각 탭 동일 너비 */
  text-align: center;
}
.recommend-tabs .nav-link {
  width: 100%;
  text-align: center;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7684; /* 글씨 색상 고정 */
  font-weight: 500;
}
.recommend-tabs .nav-link.active {
  border-bottom: 2px solid #36c18c; /* ✅ 활성 탭 하단 border 색상 변경 */
  color: #6b7684; /* 글씨 색상 그대로 유지 */
}

/* ✅ 전환 래퍼: 높이 유지 + 떠나는 패널 absolute로 밀림 방지 */
.tab-content-wrapper {
  position: relative;
  min-height: 40vh; /* 필요 시 조절 */
}

/* ✅ 탭 콘텐츠 전환 (슬라이드 + 페이드) */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
/* 떠나는 패널을 띄워서 레이아웃 흔들림 방지 */
.slide-fade-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(8px); /* 오른쪽에서 살짝 들어오고 나가기 */
}
</style>
