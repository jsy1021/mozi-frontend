<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBankStore } from '@/stores/bank';
import BankLoginModal from '@/pages/account/BankLoginModal.vue';
import { getConnectedBanks } from '@/api/accountApi';

const router = useRouter();
const route = useRoute();
const bankStore = useBankStore();

const selectedBankCode = ref('');
const showModal = ref(false);
const modalBank = ref(null);

const banks = bankStore.banks;

// 추가
const mode = computed(() => String(route.query.mode || 'first'));
const redirect = computed(() =>
  String(route.query.redirect || '/account/BankSummaryPage')
);

const connectedCount = computed(() => banks.filter((b) => b.connected).length);
const hasConnected = computed(() => connectedCount.value > 0);

// 처음(first): 1개 이상 연동되면 활성화
// 추가(add): 항상 활성화 (원하면 조건 바꿔도 됨)
const canProceed = computed(() =>
  mode.value === 'first' ? hasConnected.value : true
);

function handleNext() {
  if (!canProceed.value) return;
  router.replace(redirect.value);
}

function selectBank(code) {
  selectedBankCode.value = code;
}

function handleConnect(bank) {
  if (bank.connected) return; // 이미 연결된 은행은 모달 열지 않음
  modalBank.value = bank;
  showModal.value = true;
}

function goBack() {
  router.back();
}

onMounted(async () => {
  try {
    const res = await getConnectedBanks();
    const connectedCodes = res.bankCodeList || [];
    bankStore.initializeConnectedBanks(connectedCodes);
  } catch (e) {
    console.error('연결된 은행 조회 실패:', e);
  }
});
</script>

<template>
  <div class="wrapper">
    <div class="content">
      <!-- 헤더 -->
      <div class="header-row">
        <button class="back-btn" @click="goBack" aria-label="뒤로가기">
          <i class="fa-solid fa-angle-left"></i>
        </button>
        <p class="title">계좌 연동</p>
      </div>
      <p class="subtitle">연동할 은행을 선택해주세요</p>
      <!-- 은행 그리드 (항상 3열) -->
      <div class="bank-grid">
        <button
          v-for="bank in banks"
          :key="bank.code"
          class="bank-card"
          :class="{
            selected: selectedBankCode === bank.code,
            connected: bank.connected,
          }"
          @click="
            selectBank(bank.code);
            handleConnect(bank);
          "
        >
          <!-- 우상단 배지: 연결 전 '+', 연결 후 체크 -->
          <span
            class="badge"
            :class="bank.connected ? 'badge-checked' : 'badge-plus'"
            @click.stop="handleConnect(bank)"
            aria-hidden="true"
          >
            <i v-if="bank.connected" class="fa-solid fa-check"></i>
            <i v-else class="fa-solid fa-plus"></i>
          </span>

          <!-- 로고 + 은행명 -->
          <img :src="bank.logo" :alt="bank.name" class="bank-logo" />
          <span class="bank-name">{{ bank.name }}</span>
        </button>
      </div>
      <button
        class="Agreecard-btn"
        :style="{ backgroundColor: canProceed ? '#36C18C' : '#36C18C80' }"
        :disabled="!canProceed"
        @click="handleNext"
      >
        다음
      </button>
    </div>

    <!-- 모달 -->
    <BankLoginModal
      v-if="showModal"
      :bank="modalBank"
      @close="showModal = false"
    />
  </div>
</template>

<style scoped>
/* 레이아웃 */
.wrapper {
  display: flex;
  justify-content: center;
  min-height: 700px;
  background-color: #fff;
}

.content {
  width: 100%;
  max-width: 300px; /* 모바일 기준 폭, 필요하면 340~400 조절 */
  text-align: center;
  padding: 0 0 24px;
}

/* 헤더 */
.header-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32px 0 50px;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
  font-size: 18px;
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #757575;
  margin: 0;
}

.subtitle {
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #6b7684;
  margin: 4px 0 20px 2px; /* 위/아래 여백과 살짝 왼쪽 들여쓰기 */
}

/* ====== 카드 그리드 (항상 3열) ====== */
.bank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 고정 3열 */
  gap: 12px;
}

/* 카드 스타일: 이미지 예시처럼 라운드 + 보더 + 약한 그림자 */
.bank-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px 12px;
  min-height: 92px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e8ecef;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.bank-card:active {
  transform: scale(0.98);
}

.bank-card.selected {
  border-color: #b6e7f3; /* 선택시 미세 하이라이트 */
  background: #f9feff;
}

/* 연결된 카드(완료)는 은은하게 구분 */
.bank-card.connected {
  border-color: #e2f3ec;
  background: #fbfefc;
}

/* 우상단 배지 (+ 또는 체크) */
.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 미연동: 연한 회색 원 배경 + 회색 플러스 */
.badge-plus {
  background: #f2f4f6;
  color: #9aa4b2;
}

/* 연동 완료: 초록 배경 + 흰 체크 */
.badge-checked {
  background: #36c18c;
  color: #ffffff;
}

/* 로고/텍스트 */
.bank-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.bank-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #3d434b;
  line-height: 1.2;
  word-break: keep-all;
}

.Agreecard-btn {
  display: block;
  width: 100%;
  margin: 65px 0 0;
  padding: 10px 0;
  border-radius: 4px;
  border: 0 solid white;
  color: #ffffff;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.4);
  font-size: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.Agreecard-btn:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
  background: #bdbdbd;
  transform: scale(0.98);
  transition: box-shadow 0.1s, background 0.1s, transform 0.1s;
}
</style>
