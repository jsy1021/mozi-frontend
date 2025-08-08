<template>
  <div class="container py-3">
    <!-- 상단 타이틀 -->
    <div class="position-relative d-flex align-items-center mb-3">
      <!-- 뒤로가기 버튼 -->
      <button class="back-btn" @click="goBack">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <!-- 타이틀 가운데 정렬 -->
      <h4 class="fw-bold mb-0 title-center">추천</h4>
    </div>

    <!-- 추천 인트로 -->
    <div class="p-3 rounded bg-light mb-3 text-center">
      <p class="mb-1 fw-semibold">{{ userName }}님을 위한 맞춤 추천</p>
      <small class="text-muted">목표와 프로필을 기반으로 추천을 제공합니다.</small>
    </div>

    <!-- 추천 탭 -->
    <ul class="nav nav-tabs recommend-tabs mb-3">
      <li class="nav-item" v-for="tab in tabs" :key="tab">
        <a
          href="#"
          class="nav-link"
          :class="{ active: currentTab === tab }"
          @click.prevent="currentTab = tab"
        >
          {{ tab }}
        </a>
      </li>
    </ul>

    <!-- 금융 상품 추천 -->
    <div v-if="currentTab === '금융상품'">
      <FinancialRecommendTab :user-id="userId" :goal-id="goalId" />
    </div>

    <!-- 청년 정책 추천 -->
    <div v-if="currentTab === '청년정책'">
      <policyRecommendTab :user-id="userId" :goal-id="goalId" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import policyRecommendTab from './policyRecommendTab.vue';
import FinancialRecommendTab from './FinancialRecommendTab.vue';


const router = useRouter();

const goBack = () => router.back();

const userName='사용자';


const tabs = ['금융상품', '청년정책'];
const currentTab = ref('금융상품');
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
  border-bottom: 2px solid #36C18C; /* ✅ 활성 탭 하단 border 색상 변경 */
  color: #6b7684; /* 글씨 색상 그대로 유지 */
}
</style>
