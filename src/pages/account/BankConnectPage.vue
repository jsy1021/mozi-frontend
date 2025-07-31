<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBankStore } from '@/stores/bank';
import BankLoginModal from '@/pages/account/BankLoginModal.vue';
console.log('진입');
const router = useRouter();
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
  modalBank.value = bank;
  showModal.value = true;
}

function handleAgree() {
  console.log('버튼 클릭');
  if (hasConnectedBank.value) {
    console.log('넘어가기');
    router.push({ name: 'homePage', query: { refresh: 'true' } });
  } else {
    alert('최소 하나 이상의 은행을 연동해주세요.');
  }
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="wrapper">
    <div class="content">
      <!-- Header -->
      <div class="header-row">
        <div class="back-btn" @click="goBack">
          <i class="fa-solid fa-angle-left"></i>
        </div>
        <p class="title">계좌 연동</p>
      </div>

      <p class="section-title">불러올 계좌 선택하기</p>
      <p class="section-subtitle">은행</p>

      <!-- 은행 리스트 -->
      <div class="bank-list">
        <div
          v-for="bank in banks"
          :key="bank.code"
          class="bank-card"
          @click="selectBank(bank.code)"
        >
          <div class="bank-info">
            <img :src="bank.logo" class="bank-logo" />
            <span>{{ bank.name }}</span>
          </div>
          <button
            class="badge-link"
            @click.stop="handleConnect(bank)"
            :style="
              bank.connected
                ? 'background-color: #d9d9d9; color: white;'
                : 'background-color: #776e6e; color: white;'
            "
          >
            {{ bank.connected ? '완료' : '연동' }}
          </button>
        </div>
      </div>

      <!-- 동의하기 버튼 -->
      <button
        class="agree-btn"
        :disabled="!hasConnectedBank"
        :style="{ backgroundColor: hasConnectedBank ? '#4CAF50' : '#d9d9d9' }"
        @click="handleAgree"
      >
        동의하기
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
/* 기존 스타일 유지 + 선택 시 강조 */
.wrapper {
  display: flex;
  justify-content: center;
  min-height: 700px;

  background-color: #f8f8f8;
  /* padding-bottom: 20px; */
}
.content {
  width: 300px;
  text-align: center;
}
.header-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px 0 20px 0;
}
.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.title {
  font-size: 18px;
  font-weight: 550;
  color: #585858;
}
.section-title,
.section-subtitle {
  text-align: left;
  font-size: 14px;
  font-weight: 550;
  color: #585858;
  margin-left: 5px;
  margin-bottom: 4px;
}
.bank-list {
  display: flex;
  flex-direction: column;
}
.bank-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 10px;
  margin: 0;
  cursor: pointer;
  border-radius: 6px;
}
.bank-card.selected {
  background-color: #e0f7fa;
  border: 2px solid #00acc1;
}
.bank-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bank-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.badge-link {
  background-color: #776e6e;
  color: white;
  padding: 2px 6px;
  width: 40px;
  border-radius: 5px;
  font-size: 8px;
  font-weight: 500;
  border: 0 solid white;
  white-space: nowrap;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.2s;
}
.badge-link:active {
  transform: scale(0.95); /* 살짝 눌리는 효과 */
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2); /* 그림자 약하게 */
  background-color: #5a5353; /* 약간 어두운 배경으로 변경 */
}

.agree-btn {
  display: block;
  width: 100%;
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 10px 0;
  border-radius: 4px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.4);
  transition: 0.2s;
}
.agree-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
}
</style>
