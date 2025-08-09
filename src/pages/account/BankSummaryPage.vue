<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBankSummary, refreshAccounts } from '@/api/accountApi';
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

const goBack = () => router.push('/');
const goToDeletePage = () => router.push('/account/BankUnlinkPage');
const goToBankMainSetting = () => router.push('/account/BankMainSettingPage');
const goToConnectPage = () =>
  router.push({ path: '/account/BankConnectPage', query: { from: 'summary' } });

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
    <!-- 상단 헤더: 제목 가운데, 우측에 새로고침 -->
    <div class="header">
      <h4 class="fw-bold mb-3 text-center">자산</h4>
      <span
        v-if="isConnected"
        class="icon-button"
        @click="refreshAccountData"
        aria-label="자산 새로고침"
      >
        <i class="fa-solid fa-rotate"></i>
      </span>
    </div>

    <template v-if="isConnected">
      <!-- ✅ 카드 리스트 컨테이너로 총 자산을 이동 -->
      <div class="card-list">
        <!-- 총 자산 행 -->
        <div class="total-row">
          총 자산<br/> {{ totalBalance.toLocaleString() }}원
        </div>

        <!-- 총 자산과 카드들 사이 구분선 -->
        <hr class="card-divider" v-if="bankSummaryList.length > 0" />

        <!-- 은행 카드들 -->
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
              {{ bank.totalBalance.toLocaleString() }}원
            </div>
            <div class="bank-account">
              <template v-if="bank.accountCount === 0">계좌 0개</template>
              <template v-else>
                <span class="account-name-ellipsis">
                  {{ bank.representativeAccountName }}
                </span>
                <span class="account-etc">외 {{ bank.accountCount - 1 }}개</span>
              </template>
            </div>
          </div>

          <div class="icon-arrow-wrap">
            <i class="fa-solid fa-angle-right bank-arrow"></i>
          </div>
        </div>

        <!-- 은행 연동 추가 버튼 -->
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
          src="/images/accountEmpty.png"
          alt="데이터 없음"
          class="no-data-image"
        />
        <h6>아직 계좌가 없어요</h6>
        <p class="no-data-text">
          계좌를 연동하면 더 많은 서비스를 <br />받을 수 있어요!
        </p>
        <button class="card-btn" @click="goToConnectPage">계좌 연결하기</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ========== 레이아웃 기본 ========== */
.wrapper {
  position: relative;
  padding: 16px;
  background-color: #fff;
  min-height: 100vh;
}

/* ========== 상단 헤더(제목 중앙, 좌측 뒤로가기, 우측 새로고침) ========== */
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center; /* 제목 중앙 정렬 */
  margin-bottom: 16px;
}

.back-btn {
  position: absolute;
  left: 0;
  cursor: pointer;
  font-size: 1.2rem;
  color: #333;
  padding: 4px 8px; /* 클릭 범위 확보 */
}
.back-btn:hover { color: #222; }

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 우측 새로고침 버튼 */
.icon-button {
  position: absolute;
  right: 0;
  font-size: 17px;
  color: #6b7684;
  cursor: pointer;
  padding: 4px 8px;
  transition: color .15s ease, transform .1s ease;
}
.icon-button:hover { color: #4b5563; }
.icon-button:active { transform: scale(0.96); }

/* ========== 총 자산(카드 리스트 상단 행) ========== */
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 8px 8px;
  font-size: 15px;
  color: #2f423f;
  font-weight: 700;
}

/* 카드 구분선 (총자산과 은행카드 사이) */
.card-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 6px 0 8px;
  border: 0;
}

/* ========== 카드 리스트 컨테이너 ========== */
.card-list {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 2px 10px 10px;
  margin-bottom: 16px;
  max-height: 320px;
  overflow-y: auto;
}

/* ========== 은행 카드 ========== */
.bank-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  background-color: #fff;
  cursor: pointer;
  min-height: 75px; /* 카드 높이 일정 */
  transition: all 0.15s ease;
  border-bottom: 1px solid #eee;
}
.bank-card:first-child { border-top: none; }
.bank-card.no-border { border-bottom: none; }
.bank-card:active {
  background-color: #f2f4f6;
  transform: scale(0.98);
}

/* 메인은행(별) */
.icon-star-wrap {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 2;
}
.bank-star {
  font-size: 14px;
  color: #ffd43b;
}

/* 우측 화살표 */
.icon-arrow-wrap {
  position: absolute;
  top: 50%;
  right: 3px;
  transform: translateY(-50%);
}
.bank-arrow {
  font-size: 14px;
  color: #bbb;
}

/* 은행 로고/텍스트 */
.bank-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-right: 12px;
}
.bank-text { flex: 1; display: flex; flex-direction: column; }
.bank-amount {
  font-weight: bold;
  font-size: 14px;
}
.bank-account {
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 계좌명만 말줄임 */
.account-name-ellipsis {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 70%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
}
/* "외 N개" 고정 폭 */
.account-etc { flex-shrink: 0; white-space: nowrap; }

/* ========== 연동 추가 버튼 ========== */
.connect-btn-full {
  margin: 10px auto 0;
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
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.connect-btn-full:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
}

/* ========== 하단 링크들 ========== */
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
.link-item i { margin-left: 4px; }

/* ========== 로딩 오버레이 ========== */
.loading-overlay {
  position: absolute;
  inset: 0;
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
  width: 50px; height: 50px;
  animation: spin 1.5s linear infinite;
}
.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ========== 빈 상태 뷰(계좌 없음) ========== */
.fixed-center-box {
  position: absolute;
  top: 38%;
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
  background: #36c18c;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  transition: background-color .2s;
  border: none;
}
.card-btn:hover { background: #2ea67a; }
</style>
