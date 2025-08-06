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
      <button class="back-btn" @click="goBack">＜</button>
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
          <p class="account-number">계좌번호: {{ acc.accountNumber }}</p>
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
}

.back-btn {
  position: absolute;
  left: 0;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
}

.title {
  margin: 0 auto;
  font-size: 18px;
  font-weight: bold;
}

.bank-code {
  font-size: 16px;
  font-weight: 600;
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
  justify-content: space-between;
  align-items: center;

  /* ✅ 경계선 */
  border: 1px solid #e0e0e0;

  /* ✅ 입체감 주는 그림자 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.account-info {
  display: flex;
  flex-direction: column;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bank-logo {
  width: 24px;
  height: 24px;
}

.account-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.account-number {
  font-size: 13px;
  color: #777;
  margin-top: 4px;
}

.account-balance {
  font-size: 16px;
  font-weight: bold;
  color: #2e8b57;
}

.empty {
  text-align: center;
  color: #999;
  padding: 30px;
}
</style>
