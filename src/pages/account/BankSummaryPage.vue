<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBankSummary, refreshAccounts } from '@/api/accountApi';
import { useBankStore } from '@/stores/bank';

const router = useRouter();

const totalBalance = ref(0);
const bankSummaryList = ref([]);
const isConnected = ref(false);
const isLoading = ref(false);

const bankStore = useBankStore();
const banks = bankStore.banks;

// 은행 로고 가져오기
const getBankLogoUrl = (bankCode) => {
  const bank = banks.find((b) => b.code === bankCode);
  return bank?.logo || '/images/financial/default.png';
};

const goBack = () => router.back();
const goToDeletePage = () => router.push('/account/BankUnlinkPage');
const goToSelectMainBank = () => router.push('/MainBankPage');
const goToBankMainSetting = () => router.push('/account/BankMainSettingPage');

const refreshAccountData = async () => {
  try {
    isLoading.value = true;
    await refreshAccounts(); // 계좌 정보 최신화
    const response = await getBankSummary();
    totalBalance.value = response.totalBalance;
    bankSummaryList.value = response.BankSummaryList;
    isConnected.value = response.isConnected;
  } catch (error) {
    console.error('새로 고침 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await getBankSummary();
    totalBalance.value = response.totalBalance;
    bankSummaryList.value = response.BankSummaryList;
    isConnected.value = response.isConnected;
  } catch (error) {
    console.error('계좌 요약 조회 실패:', error);
    isConnected.value = false;
  }
});
</script>

<template>
  <div class="wrapper">
    <!-- 헤더 -->
    <div class="header">
      <span class="icon-button" @click="goBack">＜</span>
      <h2 class="title">전체 은행</h2>
      <span class="icon-button" @click="goToDeletePage">🗑</span>
    </div>

    <!-- 총 자산 카드 -->
    <div class="total-box">총 자산: {{ totalBalance.toLocaleString() }}원</div>

    <!-- 은행 리스트 카드 -->
    <div class="card-list">
      <div
        class="bank-card"
        v-for="bank in bankSummaryList"
        :key="bank.bankCode"
        @click="router.push(`/account/BankAccountListPage/${bank.bankCode}`)"
      >
        <img :src="getBankLogoUrl(bank.bankCode)" class="bank-logo" />
        <div class="bank-text">
          <div class="bank-amount">
            총: {{ bank.totalBalance.toLocaleString() }}원
          </div>
          <div class="bank-account">
            <template v-if="bank.accountCount === 0">계좌 0개</template>
            <template v-else>
              {{ bank.representativeAccountName }} 외
              {{ bank.accountCount - 1 }}개
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 주거래 버튼 -->
    <div class="main-bank-button" @click="goToBankMainSetting">
      주거래 은행 설정 &gt;
    </div>

    <!-- 새로 고침 버튼 -->
    <button
      class="refresh-button"
      @click="refreshAccountData"
      :disabled="isLoading"
    >
      새로 고침
    </button>
    <div v-if="isLoading" class="loading">불러오는 중...</div>
  </div>
</template>

<style scoped>
.wrapper {
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.icon-button {
  font-size: 20px;
  cursor: pointer;
}

.total-box {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.card-list {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.bank-card {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 10px 0;
  border-top: 1px solid #eee;
}

.bank-card:first-child {
  border-top: none;
}

.bank-card:hover {
  background-color: #f9f9f9;
  border-radius: 6px;
}

.bank-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-right: 12px;
}

.bank-text {
  display: flex;
  flex-direction: column;
}

.bank-amount {
  font-weight: bold;
  font-size: 14px;
}

.bank-account {
  font-size: 13px;
  color: #555;
}

.main-bank-button {
  text-align: left;
  margin-top: 20px;
  font-size: 15px;
  font-weight: bold;
  color: #1a73e8;
  cursor: pointer;
  padding-left: 4px;
}

.refresh-button {
  margin-top: 12px;
  width: 100%;
  padding: 12px;
  background-color: #3d6c6c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.refresh-button:disabled {
  background-color: #9bb0af;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  color: #888;
  margin-top: 8px;
}
</style>
