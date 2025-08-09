<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">내 스크랩</h4>

    <!-- 카테고리 탭 (mozi-tabs 적용) -->
    <ul class="nav mozi-tabs mb-2 small">
      <li v-for="tab in ['정책', '금융']" :key="tab" class="nav-item">
        <button
          type="button"
          class="nav-link"
          :class="{
            active: activeTab === (tab === '정책' ? 'policy' : 'finance')
          }"
          @click="changeTab(tab === '정책' ? 'policy' : 'finance')"
        >
          {{ tab }}
        </button>
      </li>
    </ul>

    <!-- 탭 콘텐츠 (슬라이드-페이드 전환) -->
    <transition name="slide-fade" mode="out-in">
      <div :key="activeTab">
        <!-- 정책 스크랩 리스트 -->
        <div v-if="activeTab === 'policy'">
          <policyCard
            v-for="policy in policyScraps || []"
            :key="policy.policyId"
            :policy="policy"
            :isScrapped="true"
          />
          <div
            v-if="policyScraps && policyScraps.length === 0"
            class="text-muted text-center"
          >
            스크랩한 정책이 없습니다 🥲
          </div>
        </div>

        <!-- 금융 스크랩 리스트 -->
        <div v-else>
          <financialCard
            v-for="product in financeScraps"
            :key="product.savingId || product.depositId"
            :deposit="product"
            :productType="product.productType"
            sourceTab="asset"
          />
          <div v-if="financeScraps.length === 0" class="text-muted text-center">
            스크랩한 금융 상품이 없습니다 🥲
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import policyCard from '../search/policySearch/policyCard.vue';
import financialCard from '../search/financialSearch/financialCard.vue';
import { getScrappedPolicies } from '@/api/scrapApi';
import api from '@/api';

const route = useRoute();
const router = useRouter();
const activeTab = ref(route.query.tab || 'policy');

const policyScraps = ref([]);
const financeScraps = ref([]);

const fetchFinanceScraps = async () => {
  try {
    const response = await api.get('/scrap/finance');
    const scrapDetails = response.map((scrap) => {
      const product = scrap.product;
      return {
        ...(scrap.productType === 'SAVING'
          ? { savingId: product.savingId }
          : { depositId: product.depositId }),
        productName: product.productName,
        bankName: product.bankName,
        bankCode: product.bankCode,
        target: product.joinMember,
        joinWay: product.joinWay,
        options: product.options,
        productType: scrap.productType === 'SAVING' ? '적금' : '예금',
        createdAt: scrap.createdAt,
      };
    });
    scrapDetails.sort((a, b) => {
      const dateA = new Date(
        a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2],
        a.createdAt[3], a.createdAt[4], a.createdAt[5]
      );
      const dateB = new Date(
        b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2],
        b.createdAt[3], b.createdAt[4], b.createdAt[5]
      );
      return dateB - dateA;
    });
    financeScraps.value = scrapDetails;
  } catch (error) {
    console.error('금융 스크랩 데이터 가져오기 실패:', error);
    financeScraps.value = [];
  }
};

onMounted(async () => {
  const scrapped = await getScrappedPolicies();
  policyScraps.value = scrapped;
  if (activeTab.value === 'finance') {
    await fetchFinanceScraps();
  }
});

const changeTab = async (tab) => {
  activeTab.value = tab;
  await router.replace({ query: { ...route.query, tab } });
  if (tab === 'finance') {
    await fetchFinanceScraps();
  }
};
</script>

<style scoped>

h4.fw-bold {
  text-align: center;
}
/* mozi-tabs 공용 스타일 */
.mozi-tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ddd;
}
.mozi-tabs .nav-item {
  flex: 1;
  text-align: center;
}
.mozi-tabs .nav-link {
  width: 100%;
  text-align: center;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  background: transparent !important;
  color: #6b7684 !important;
  font-weight: 500;
  padding: 6px 4px;
  transition: color .18s ease, border-bottom-color .18s ease, background-color .18s ease;
  cursor: pointer;
}
.mozi-tabs .nav-link.active {
  border-bottom: 2px solid #36C18C !important;
  color: #6b7684 !important;
}

/* 탭 콘텐츠 전환 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
