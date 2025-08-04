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
  <div style="display: flex">
    <p style="margin: 10px 10px 5px 25px; color: #6b7684; font-weight: bolder">
      나의 계좌
    </p>
    <i
      class="fa-solid fa-angle-right fa-sm"
      @click="goToTotalPage"
      style="color: #d9d9d9; cursor: pointer; margin: 23px 0 5px 0"
    ></i>
  </div>
  <div>
    <!-- 연동 안 됐을 때 -->
    <div v-if="isUnlinked" class="card">
      <div style="font-size: 10px">연동시 더 많은 기능을</div>
      <div style="font-size: 10px">이용할 수 있어요!</div>
      <button
        class="card-btn"
        @click="goToAccountAuth"
        style="position: relative; bottom: 7px"
      >
        <div style="font-size: 10px; color: #6b7684">계좌연동</div>
      </button>
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
          style="height: 64px; margin: 0 0 0 0px; align-self: flex-start"
        />
        <div style="text-align: left; margin: 10px 0 25px -80px">
          <div style="font-size: 16px; font-weight: 500; margin-bottom: -3px">
            {{
              bankSummaryList.totalBalance
                ? bankSummaryList.totalBalance.toLocaleString()
                : '0'
            }}원
          </div>
          <div style="font-size: 12px; color: #555">
            {{ bankSummaryList.representativeAccountName }}외
            {{ bankSummaryList.accountCount - 1 }}개 계좌
          </div>
        </div>
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
            <i
              class="fa-solid fa-star"
              style="color: #ffd43b; position: relative; top: -30px; left: 8px"
            ></i>
          </span>
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
  width: 350px;
  height: 80px;
  margin: auto;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #fff;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.card-btn {
  display: block;
  width: 200px;
  height: 30px; /* 높이 증가 */
  margin: 10px auto 0 auto; /* 가운데 정렬 및 상단 여백 */
  padding: 6px 0;
  border-radius: 8px;
  border: 1.5px solid #f2f4f6;
  background: #f2f4f6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  font-size: 14px;
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
