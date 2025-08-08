<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBankStore } from '@/stores/bank';
import { getAccountsByBank } from '@/api/accountApi';

const route = useRoute();
const router = useRouter();

const bankStore = useBankStore();
const bankCode = route.params.bankCode || '';
const accounts = ref([]);

const bankInfo = computed(() =>
  bankStore.banks.find((bank) => bank.code === bankCode)
);

// ✅ 계좌번호 마스킹 함수
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';

  let visibleChars = 0; // 앞뒤 4자리 세기
  return accountNumber
    .split('')
    .map((ch, idx) => {
      if (ch === '-') return '-'; // -는 그대로
      if (idx < 4 || idx >= accountNumber.length - 4) {
        visibleChars++;
        return ch; // 앞뒤 4자리 표시
      }
      return '*'; // 나머지는 마스킹
    })
    .join('');
};

const fetchAccounts = async () => {
  try {
    const res = await getAccountsByBank(bankCode);
    accounts.value = res.accountList || [];
  } catch (error) {
    console.error('계좌 목록 조회 실패:', error);
  }
};

const goBack = () => router.back();

onMounted(fetchAccounts);
</script>

<template>
  <div class="wrapper">
    <div class="header">
      <span class="back-btn" @click="goBack"
        ><i class="fa-solid fa-angle-left"></i
      ></span>
      <p class="title">계좌보기</p>
    </div>

    <h3 class="bank-code">
      {{ bankInfo?.name || bankCode }}
    </h3>

    <div class="account-list">
      <div
        v-for="acc in accounts"
        :key="acc.accountNumber"
        class="account-card"
      >
        <div class="account-info">
          <div class="logo-text">
            <img :src="bankInfo?.logo" alt="logo" class="bank-logo" />
            <p class="account-name">{{ acc.accountName }}</p>
          </div>
          <p class="account-number">
            계좌번호: {{ maskAccountNumber(acc.accountNumber) }}
          </p>
        </div>
        <div class="account-balance">{{ acc.balance?.toLocaleString() }}원</div>
      </div>

      <div v-if="accounts.length === 0" class="empty">
        등록된 계좌가 없습니다.
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  padding: 16px;
  background-color: #fff;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
  color: #757575;
}

.back-btn {
  position: absolute;
  left: 0;
  font-size: 18px; /* 전체 은행과 통일 */
  color: #757575; /* 동일 색상 */
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}
.back-btn:hover {
  color: #555555; /* hover 시 약간 어둡게 */
}

.title {
  margin: 0 auto;
  font-size: 18px;
  font-weight: bold;
  color: #757575; /* 전체 은행 텍스트 색상과 통일 */
}

.bank-code {
  font-size: 16px;
  margin: 16px 0 16px;
  padding-left: 5px;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-card {
  background: #fff; /* 흰 배경 유지 */
  padding: 14px;
  border-radius: 8px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  min-width: 0;

  /* ✅ 경계선 */
  border: 1px solid #e0e0e0;

  /* ✅ 입체감 주는 그림자 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.account-info {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  padding-left: 12px;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.bank-logo {
  width: 36px;
  height: 36px;
}

.account-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: -4px;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.account-number {
  font-size: 13px;
  color: #777;
  margin-top: 5px;
}

.account-balance {
  padding-left: 5px;
  font-weight: 500;
  color: #333;
  padding-right: 5px;
  margin-left: auto;
  flex: 0 0 120px;
  text-align: right;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-all;
  margin-top: auto;
  margin-bottom: auto;
}

.empty {
  text-align: center;
  color: #999;
  padding: 30px;
}
</style>
