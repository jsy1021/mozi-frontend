<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBankSummary } from '@/api/accountApi';
import { useBankStore } from '@/stores/bank';

const router = useRouter();
const totalBalance = ref(0);
const bankSummaryList = ref([]);
const mainBankCode = ref('');
const isConnected = ref(false);
const isLoading = ref(false);
const bankStore = useBankStore();
const banks = bankStore.banks;

const getBankLogoUrl = (bankCode) => {
  const bank = banks.find((b) => b.code === bankCode);
  return bank?.logo || '/images/financial/default.png';
};

const goBack = () => router.back();
const goToDeletePage = () => router.push('/account/BankUnlinkPage');
const goToBankMainSetting = () => router.push('/account/BankMainSettingPage');

const refreshAccountData = async () => {
  try {
    isLoading.value = true;
    const response = await getBankSummary();
    totalBalance.value = response.totalBalance;
    bankSummaryList.value = response.BankSummaryList;
    isConnected.value = response.isConnected;
    mainBankCode.value = response.mainBankCode || '';
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
    mainBankCode.value = response.mainBankCode || '';
  } catch (error) {
    console.error('계좌 요약 조회 실패:', error);
    isConnected.value = false;
  }
});
</script>

<template>
  <div class="wrapper">
    <!-- 공통 헤더 -->
    <div class="header">
      <span class="back-btn" @click="goBack">
        <i class="fa-solid fa-angle-left"></i>
      </span>
      <div class="header-title">전체 은행</div>
      <template v-if="isConnected">
        <span class="icon-button" @click="goToDeletePage">
          <i class="fa-solid fa-trash"></i>
        </span>
      </template>
      <template v-else>
        <div style="width: 24px"></div>
      </template>
    </div>

    <!-- 연동된 경우 -->
    <template v-if="isConnected">
      <div class="total-box">
        총 자산: {{ totalBalance.toLocaleString() }}원
      </div>

      <div class="card-list" v-if="bankSummaryList.length > 0">
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
          <span v-if="mainBankCode === bank.bankCode">
            <i class="fa-solid fa-star" style="color: #ffd43b"></i>
          </span>
        </div>
      </div>

      <div v-else class="no-data-box">
        <img
          src="/images/financial/bnkbank.png"
          alt="데이터 없음"
          class="no-data-image"
        />
        <p>표시할 은행 계좌가 없습니다</p>
      </div>

      <div class="main-bank-button" @click="goToBankMainSetting">
        주거래 은행 설정 <i class="fa-solid fa-angle-right"></i>
      </div>

      <button
        class="refresh-button"
        @click="refreshAccountData"
        :disabled="isLoading"
      >
        새로 고침
      </button>

      <div v-if="isLoading" class="loading">불러오는 중...</div>
    </template>

    <!-- 연동 안된 경우 -->
    <template v-else>
      <!-- wrapper 안에서 중앙에 고정되는 박스 -->
      <div class="fixed-center-box">
        <img
          src="/images/accountEmpty.png"
          alt="데이터 없음"
          class="no-data-image"
        />
         <h6>아직 계좌가 없어요</h6>
        <p class="no-data-text">계좌를 연동하면 더 많은 서비스를 <br></br>
          받을 수 있어요!</p><br></br>
        <button
          class="card-btn"
          @click="router.push('/account/AccountAgreementPage')"
        >
          계좌 연결하기
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative; /* 자식의 absolute 기준 */
  height: 600px; /* wrapper 높이 지정 필요 */
  padding: 16px;
  background-color: #fff; /* 임의 배경 (필요시) */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.back-btn {
  font-size: 24px;
  cursor: pointer;
  user-select: none;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #757575;
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
  max-height: 300px;
  overflow-y: auto;
}

.bank-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  flex: 1;
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

/* wrapper 안에서 고정 중앙 박스 */
.fixed-center-box {
  position: absolute;
  top: 60%;
  left: 50%;
  width: 320px;
  padding: 24px;
  text-align: center;
  transform: translate(-50%, -50%);
  user-select: none;
}

.no-data-image {
  width: 200px;
  height: 200px;
  margin-bottom: 12px;
  opacity: 0.7;
}

.no-data-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.card-btn {
  display: block;
  width: 100%;
  height: 40px;
  padding: 8px 0;
  border-radius: 8px;
  border: 1.5px;
  background: #36c18c;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  font-size: 16px;
  color: white;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
</style>
