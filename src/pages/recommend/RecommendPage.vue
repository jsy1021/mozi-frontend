<template>
  <div class="container py-3">
    <!-- 상단 타이틀 -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">추천</h4>
      <i class="fa-solid fa-gear fa-lg" style="cursor: pointer"></i>
    </div>

    <!-- 추천 인트로 -->
    <div class="p-3 rounded bg-light mb-3 text-center">
      <p class="mb-1 fw-semibold">{{ userName }}님을 위한 맞춤 추천</p>
      <small class="text-muted"
        >목표와 프로필을 기반으로 추천을 제공합니다.</small
      >
    </div>

    <!-- 추천 탭 -->
    <ul class="nav nav-tabs mb-3">
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
      <div v-if="financialRecommendations.length">
        <div
          v-for="(item, index) in financialRecommendations"
          :key="index"
          class="card mb-2 p-2 shadow-sm"
        >
          <div class="d-flex align-items-center">
            <img
              :src="item.logoUrl"
              alt="bank logo"
              width="40"
              height="40"
              class="me-2"
            />
            <div>
              <h6 class="mb-0">{{ item.productName }}</h6>
              <small class="text-muted">{{ item.bankName }}</small>
            </div>
            <span class="ms-auto fw-bold text-success"> {{ item.rate }}% </span>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-muted py-4">
        추천할 금융 상품이 없습니다.
      </div>
    </div>

    <!-- 청년 정책 추천 -->
    <div v-if="currentTab === '청년정책'">
      <policyRecommendTab :user-id="userId" :goal-id="goalId" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import policyRecommendTab from './policyRecommendTab.vue';

const userName = '홍길동'; // 추후 로그인 사용자 이름과 연동

const userId = 1; // 추후 연동
const goalId = 2; // 추후 연동

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
.policy-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 16px 18px 12px 18px;
  margin-bottom: 16px;
  width: 100%;
  position: relative;
}

/* 그라디언트 왼쪽 바 - 투명도 70% */
.policy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #ff0000 0%, #000dff 55%);
  opacity: 0.7;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.policy-icon {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.policy-title {
  font-weight: bold;
  font-size: 14px;
  color: #222;
  flex: 1;
}

.bookmark {
  color: #bdbdbd;
  font-size: 1.2rem;
  margin-left: 8px;
  transition: all 0.2s ease;
}

.bookmark.scraped {
  color: #569fff;

  font-weight: 900;
}

.card-body {
  font-size: 0.97rem;
  color: #444;
  margin-bottom: 8px;
}

.info-section {
  font-size: 12px;
  margin-bottom: 8px;
}

.info-item {
  margin-bottom: 2px;
}

.info-item .label {
  color: #888;
  font-weight: 600;
}

.info-item .value {
  color: #444;
  margin-left: 4px;
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.keywords-section {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.keyword-tag {
  background: #f5f5f5;
  color: #666;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.detail-btn {
  background: #f5f5f5;
  color: #aaa;
  border: none;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 0.85rem;
  min-height: 24px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  line-height: 20px;
  margin-left: 8px;
}
</style>
