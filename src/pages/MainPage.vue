<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getMainBankSummary } from '@/api/accountApi';
import { useBankStore } from '@/stores/bank';

const router = useRouter();
const route = useRoute();

const bankSummaryList = ref(null);
const isUnlinked = ref(false);
const mainBankCode = ref(null); // :별: 추가

const bankStore = useBankStore();
const banks = bankStore.banks;

function goToAccountAuth() {
  router.push('/account/AccountAgreementPage');
}

function goToTotalPage() {
  router.push('/account/BankSummaryPage');
}

// 은행 로고 경로 계산
const bankLogoUrl = computed(() => {
  const bank = banks.find((b) => b.code === bankSummaryList.value?.bankCode);
  return bank?.logo || '/images/financial/default.png';
});

// 메인 은행 요약 정보 불러오기
const loadSummary = async () => {
  try {
    const response = await getMainBankSummary();
    if (!response.success) {
      isUnlinked.value = true;
      return;
    }
    bankSummaryList.value = response.mainBankSummary ?? [];
    isUnlinked.value = false;
    if (response.mainBankCode) {
      mainBankCode.value = true;
      return;
    }
    mainBankCode.value = false; // :별: 추가
  } catch (e) {
    isUnlinked.value = true;
    console.error('계좌 조회 실패:', e);
  }
};

// 최초 로딩
onMounted(loadSummary);

// 특정 쿼리로 새로고침될 경우 다시 로딩
watch(
  () => route.query.refresh,
  (val) => {
    if (val === 'true') {
      loadSummary();
    }
  }
);
</script>
<template>
  <div>
    <!-- 연동 안 됐을 때 -->
    <div v-if="isUnlinked" class="card">
      <p>연동시 더 많은 기능을</p>
      <p>이용할 수 있어요</p>
      <button class="card-btn" @click="goToAccountAuth">계좌연결</button>
    </div>

    <!-- 연동된 경우 -->
    <div v-else-if="bankSummaryList" class="card">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >
        <img
          :src="bankLogoUrl"
          alt="은행 로고"
          style="height: 64px; margin-right: 0.5rem"
        />
        <ul style="text-align: left; padding: 0 1rem; margin-top: 8px">
          총 :
          {{
            bankSummaryList.totalBalance
              ? bankSummaryList.totalBalance.toLocaleString()
              : '0'
          }}원
          <br />
          <span style="font-size: 8px; color: #555">
            <!-- {{ bankSummaryList.accountCount }}개 계좌 -->
            {{ bankSummaryList.representativeAccountName }}외
            {{ bankSummaryList.accountCount - 1 }}개 계좌
          </span>
        </ul>
        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
          "
        >
          <span v-if="mainBankCode === true">
            <i class="fa-solid fa-star" style="color: #ffd43b"></i>
          </span>

          <i
            class="fa-solid fa-angle-right"
            @click="goToTotalPage"
            style="cursor: pointer"
          ></i>
        </div>
      </div>
    </div>

    <!-- 로딩 중 or 빈 상태 -->
    <div v-else class="card">
      <p>로딩 중...</p>
    </div>
  </div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
  <div>MainPage</div>
</template>
<style scoped>
.card {
  width: 300px;
  height: 100px;
  margin: auto;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #fff;
  text-align: center;
  border: 1px solid #e0e0e0;
}

/* 카드 스타일 버튼 */
.card-btn {
  display: block;
  width: 100%;
  margin: 16px 0 0 0;
  padding: 16px 0;
  border-radius: 8px;
  border: 1.5px solid #bdbdbd;
  background: #fafafa;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  font-size: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.card-btn:active {
  box-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.12);
  background: #e0e0e0;
  transform: scale(0.98);
  transition: box-shadow 0.1s, background 0.1s, transform 0.1s;
}
</style>
