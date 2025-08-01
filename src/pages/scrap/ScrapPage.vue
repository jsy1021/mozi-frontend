<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">내 스크랩</h4>

    <!-- 탭 -->
    <div class="d-flex justify-content-around mb-3">
      <button @click="activeTab = 'policy'" :class="btnClass('policy')">
        정책
      </button>
      <button @click="activeTab = 'finance'" :class="btnClass('finance')">
        금융
      </button>
    </div>

    <!-- 정책 스크랩 리스트 -->
    <div v-if="activeTab === 'policy'">
      <policyCard
        v-for="policy in policyScraps"
        :key="policy.policyId"
        :policy="policy"
        :isScrapped="true"
      />
      <div v-if="policyScraps.length === 0" class="text-muted text-center">
        스크랩한 정책이 없습니다 🥲
      </div>
    </div>

    <!-- 금융 스크랩 리스트 -->
    <div v-else>
      <financialCard
        v-for="product in financeScraps"
        :key="product.financeId"
        :product="product"
      />
      <div v-if="financialCard.length === 0" class="text-muted text-center">
        스크랩한 정책이 없습니다 🥲
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import policyCard from '../search/policySearch/policyCard.vue';
import financialCard from '../search/financialSearch/financialCard.vue';
import { getScrappedPolicies } from '@/api/scrapApi';

const activeTab = ref('policy');
const userId = 1;

const policyScraps = ref([]);

onMounted(async () => {
  policyScraps.value = await getScrappedPolicies(userId);
});

const btnClass = (tab) => {
  return activeTab.value === tab
    ? 'btn btn-primary'
    : 'btn btn-outline-primary';
};
</script>
