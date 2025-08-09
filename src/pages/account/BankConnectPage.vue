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
const hasConnectedBank = computed(() => banks.some((b) => b.connected));

function selectBank(code) {
  selectedBankCode.value = code;
}

function handleConnect(bank) {
  if (bank.connected) return;      // 이미 연결된 은행은 모달 열지 않음
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
            connected: bank.connected
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
  background-color: #f8f8f8;
}

.content {
  width: 100%;
  max-width: 360px;        /* 모바일 기준 폭, 필요하면 340~400 조절 */
  text-align: center;
  padding: 0 8px 24px;
}

/* 헤더 */
.header-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 22px 0 16px;
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
  color: #565e6c;
  margin: 0;
}

.subtitle {
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #6b7684;
  margin: 4px 0 10px 2px; /* 위/아래 여백과 살짝 왼쪽 들여쓰기 */
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
  transition: transform 0.08s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.bank-card:active {
  transform: scale(0.98);
}

.bank-card.selected {
  border-color: #b6e7f3;          /* 선택시 미세 하이라이트 */
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
</style>
