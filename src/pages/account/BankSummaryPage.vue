<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getBankSummary, refreshAccounts } from '@/api/accountApi';
import { useBankStore } from '@/stores/bank';

const router = useRouter();
const route = useRoute();

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

const goToDeletePage = () => router.push('/account/BankUnlinkPage');
const goToBankMainSetting = () => router.push('/account/BankMainSettingPage');
const goToConnectPage = () => {
  if (isConnected.value) {
    router.push({
      path: '/account/BankConnectPage',
      query: {
        mode: 'add',
        redirect: '/account/BankSummaryPage', // 고정 복귀 지점
      },
    });
    return;
  } else {
    router.push({
      path: '/account/AccountAgreementPage',
      query: {
        mode: 'first',
        redirect: route.fullPath, // 돌아갈 곳 저장(메인 or 요약)
      },
    });
    return;
  }
};

const refreshAccountData = async () => {
  try {
    isLoading.value = true;
    await refreshAccounts();
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
    <div class="header">
      <div class="header-title">자산</div>
      <span v-if="isConnected" class="icon-button" @click="refreshAccountData">
        <i class="fa-solid fa-rotate"></i>
      </span>
    </div>

    <template v-if="isConnected">
      <!-- ✅ 총 자산 박스 분리 유지 -->
      <div class="total-box">
        총 자산: {{ totalBalance.toLocaleString() }}원
      </div>

      <div class="card-list" v-if="bankSummaryList.length > 0">
        <div
          class="bank-card"
          v-for="(bank, index) in bankSummaryList"
          :key="bank.bankCode"
          @click="router.push(`/account/BankAccountListPage/${bank.bankCode}`)"
          :class="{ 'no-border': index === bankSummaryList.length - 1 }"
        >
          <div class="icon-star-wrap" v-if="mainBankCode === bank.bankCode">
            <i class="fa-solid fa-star bank-star"></i>
          </div>

          <img :src="getBankLogoUrl(bank.bankCode)" class="bank-logo" />

          <div class="bank-text">
            <div class="bank-amount">
              총: {{ bank.totalBalance.toLocaleString() }}원
            </div>

            <div class="bank-account">
              <template v-if="bank.accountCount === 0"> 계좌 0개 </template>
              <template v-else>
                <!-- ✅ 버그 수정: 말줄임 + '외 N개'만 표시 -->
                <span class="account-name-ellipsis">
                  {{ bank.representativeAccountName }}
                </span>
                <span class="account-etc">
                  외 {{ bank.accountCount - 1 }}개
                </span>
              </template>
            </div>
          </div>

          <div class="icon-arrow-wrap">
            <i class="fa-solid fa-angle-right bank-arrow"></i>
          </div>
        </div>

        <button class="connect-btn-full" @click="goToConnectPage">
          은행 연동 추가하기
        </button>
      </div>

      <div class="nav-links">
        <div class="link-item" @click="goToBankMainSetting">
          주거래 은행 설정
          <i class="fa-solid fa-angle-right"></i>
        </div>
        <div class="link-item" @click="goToDeletePage">
          은행 연동 해지
          <i class="fa-solid fa-angle-right"></i>
        </div>
      </div>

      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <div class="loading-text">로딩 중...</div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="fixed-center-box">
        <img
          src="/images/account/accountEmpty.png"
          alt="데이터 없음"
          class="no-data-image"
        />
        <h6>아직 계좌가 없어요</h6>
        <p class="no-data-text">
          계좌를 연동하면 더 많은 서비스를 <br />받을 수 있어요!
        </p>
        <button class="card-btn" @click="goToConnectPage">계좌 연동하기</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  padding: 16px;
  background-color: #fff;
  height: 732px;
}

/* 헤더 */
.header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}
.header-title {
  position: static;
  font-size: 18px;
  font-weight: bold;
  color: #757575;
}
.icon-button {
  font-size: 17px;
  color: #757575;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}
.icon-button:hover {
  color: #757575;
}

/* 총 자산 박스 (분리 유지) */
.total-box {
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #2f423f;
  border: 1px solid #ddd;
}

/* 카드 리스트 */
.card-list {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 2px 10px 10px;
  margin-bottom: 16px;
  overflow-y: auto;
}

.bank-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  background-color: #fff;
  cursor: pointer;
  min-height: 75px;
  transition: all 0.15s ease;
  border-bottom: 1px solid #eee;
}
.bank-card.no-border {
  border-bottom: none;
}
.bank-card:active {
  background-color: #f2f4f6;
  transform: scale(0.98);
}

.icon-star-wrap {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 2;
}
.icon-arrow-wrap {
  position: absolute;
  top: 50%;
  right: 3px;
  transform: translateY(-50%);
}
.bank-star {
  font-size: 14px;
  color: #ffd43b;
}
.bank-arrow {
  font-size: 14px;
  color: #bbb;
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
  min-width: 0;
  padding-right: 30px;
}
.bank-amount {
  font-weight: bold;
  font-size: 14px;
}

/* ✅ 말줄임/외 N개: 중복/상충 CSS 정리 */
.bank-account {
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.account-name-ellipsis {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
}
.account-etc {
  flex-shrink: 0; /* "외 N개"는 줄어들지 않게 */
  white-space: nowrap;
}

/* 연동 추가 버튼 */
.connect-btn-full {
  margin: 0 auto;
  width: 60%;
  padding: 8px 16px;
  background-color: #f5f6f8;
  color: #7b8a99;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.connect-btn-full:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 하단 링크 */
.nav-links {
  margin-top: 23px;
  font-size: 15px;
  font-weight: 600;
  color: #666;
}
.link-item {
  margin-bottom: 15px;
  color: #a0a0a0;
  font-size: 15px;
  cursor: pointer;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(240, 240, 240, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(-40px);
}
.spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #36c18c;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1.5s linear infinite;
}
.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 빈 상태 */
.fixed-center-box {
  position: absolute;
  top: 38%;
  left: 50%;
  width: 320px;
  padding: 24px;
  text-align: center;
  transform: translate(-50%, -50%);
  user-select: none;
  margin-top: 70px;
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
  background: #36c18c;
  font-size: 16px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}
</style>
