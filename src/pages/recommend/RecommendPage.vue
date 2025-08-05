<template>
    <div class="container py-3">
      <!-- 상단 타이틀 -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold mb-0">추천</h4>
        <i class="fa-solid fa-gear fa-lg" style="cursor: pointer"></i>
      </div>
  
      <!-- 추천 인트로 -->
      <div class="p-3 rounded bg-light mb-3 text-center">
        <p class="mb-1 fw-semibold">
          {{ userName }}님을 위한 맞춤 추천
        </p>
        <small class="text-muted">목표와 프로필을 기반으로 추천을 제공합니다.</small>
      </div>
  
      <!-- 추천 탭 -->
      <ul class="nav nav-tabs mb-3 full-width-tabs">
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
    <FinancialRecommendTab
      v-if="currentTab === '금융상품'"
      :financial-recommendations="financialRecommendations"
    />
      <!-- 청년 정책 추천 -->
      <div v-if="currentTab === '청년정책'">
        <div v-if="policyRecommendations.length">
          <div v-for="(policy, index) in policyRecommendations" :key="index" class="card mb-2 p-2 shadow-sm">
            <h6 class="mb-1">{{ policy.policyName }}</h6>
            <small class="text-muted">{{ policy.region }}</small>
          </div>
        </div>
        <div v-else class="text-center text-muted py-4">
          추천할 정책이 없습니다.
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import FinancialRecommendTab from '@/pages/recommend/FinancialRecommendTab.vue';
  
  const userName = '홍길동'; // 추후 로그인 사용자 이름과 연동
  
  const tabs = ['금융상품', '청년정책'];
  const currentTab = ref('금융상품');
  
  // 금융 상품 추천 예시 데이터
  const financialRecommendations = ref([
    {
      productName: '고금리 정기예금',
      bankName: '토스뱅크',
      rate: 4.2,
      logoUrl: '/images/financial/tossbank.png',
    },
    {
      productName: '청년 우대 적금',
      bankName: '국민은행',
      rate: 3.8,
      logoUrl: '/images/financial/kbbank.png',
    },
  ]);
  
  // 청년 정책 추천 예시 데이터
  const policyRecommendations = ref([
    {
      policyName: '청년 전세 이자 지원',
      region: '서울특별시',
    },
    {
      policyName: '청년 취업 지원금',
      region: '경기도',
    },
  ]);
  </script>
  
  <style scoped>
  .card {
    border: none;
    border-radius: 12px;
  }
  .full-width-tabs {
  display: flex;
}

.full-width-tabs .nav-item {
  flex: 1; /* 2개 탭을 동일하게 분할 */
  text-align: center;
}

.full-width-tabs .nav-link {
  width: 100%;
}
  </style>