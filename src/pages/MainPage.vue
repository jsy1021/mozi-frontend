<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getMainBankSummary } from '@/api/accountApi';
import { useBankStore } from '@/stores/bank';
import { useGoalStore } from '@/stores/goalStore';
import PolicyCard from '@/pages/search/policySearch/policyCard.vue';
import FinancialCard from '@/pages/search/financialSearch/financialCard.vue';
import GoalCard from '@/components/goal/GoalCard.vue';
import GoalEmptyCard from '@/components/goal/GoalEmptyCard.vue';
import goalApi from '@/api/goalApi';

import policyApi from '@/api/policyApi';
import recommendCarousel from './recommend/policy/recommendCarousel.vue';
import { getTopSavings, getTopDeposits } from '@/api/financialApi';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const router = useRouter();
const route = useRoute();
const goalStore = useGoalStore();
const bankStore = useBankStore();

const bankSummaryList = ref(null);
const isUnlinked = ref(false);
const isMainBank = ref(false);
const isLoading = ref(true);
const products = ref([]);

const banks = bankStore.banks;

const deadlinePolicies = ref([]);

function goToAccountAuth() {
  router.push('/account/AccountAgreementPage');
}

function goToTotalPage() {
  router.push('/account/BankSummaryPage');
}

function goToGoalPage() {
  router.push('/goal');
}
function goToFinancialPage() {
  router.push('/financialSearch/FinancialSearchPage');
}
function goToPolicyPage() {
  router.push('/policySearch/PolicySearchPage');
}

// 목표 정렬 (1억 모으기 우선)
const sortedGoals = computed(() => {
  return [...goalStore.goals].sort((a, b) => {
    const aIsBillion =
      a.goalName === '1억 모으기' && a.targetAmount === 100000000;
    const bIsBillion =
      b.goalName === '1억 모으기' && b.targetAmount === 100000000;

    if (aIsBillion && !bIsBillion) return -1;
    if (!aIsBillion && bIsBillion) return 1;

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
});

// 목표 로딩
const loadGoals = async () => {
  try {
    await goalStore.getGoals();

    for (const goal of goalStore.goals) {
      try {
        const currentAmount = await goalApi.getCurrentAmountByGoal(goal.goalId);
        goal.currentAmount = currentAmount;
      } catch (error) {
        console.error(`목표 ${goal.goalId}의 현재 금액 조회 실패:`, error);
        goal.currentAmount = 0;
      }
    }
  } catch (error) {
    console.error('목표 로딩 실패:', error);
  }
};

// GoalCard 형식으로 변환
const transformGoal = (goal) => {
  return {
    id: goal.goalId,
    name: goal.goalName,
    currentAmount: goal.currentAmount || 0,
    targetAmount: goal.targetAmount,
    progress:
      goal.currentAmount && goal.targetAmount
        ? Math.floor((goal.currentAmount / goal.targetAmount) * 100)
        : 0,
    targetDate: goal.goalDate,
    memo: goal.memo,
  };
};

const goToBillionGoalCreate = () => {
  router.push({ name: 'goalCreate', query: { preset: 'billion' } });
};

const handleDeleteGoal = async (goalId) => {
  if (!confirm('정말로 이 목표를 삭제하시겠습니까?')) return;

  try {
    await goalStore.deleteGoal(goalId);
    console.log('목표가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('목표 삭제 실패:', error);
    alert('목표 삭제에 실패했습니다.');
  }
};

// 🎯 개선: 메인페이지에서 목표 상세보기로 이동 시 from=main 쿼리 추가
const goToGoalDetail = (goalId) => {
  router.push({
    path: `/goal/${goalId}`,
    query: { from: 'main' }, // 메인페이지에서 왔다는 정보 추가
  });
};

// 은행 로고
const bankLogoUrl = computed(() => {
  const bank = banks.find((b) => b.code === bankSummaryList.value?.bankCode);
  return bank?.logo || '/images/financial/default.png';
});

// 요약 불러오기
const loadSummary = async () => {
  isLoading.value = true;
  try {
    const response = await getMainBankSummary();
    if (!response.success) {
      isUnlinked.value = true;
      return;
    }
    bankSummaryList.value = response.mainBankSummary ?? null;
    isUnlinked.value = false;
    isMainBank.value = !!response.mainBankCode;
  } catch (e) {
    isUnlinked.value = true;
    console.error('계좌 조회 실패:', e);
  } finally {
    isLoading.value = false;
  }
};

const loadDeadlinePolicies = async () => {
  try {
    const result = await policyApi.getDeadlinePolicies(31);
    console.log('🔥 마감 임박 정책:', result); // ← 이거 찍히는지 확인
    deadlinePolicies.value = result;
  } catch (error) {
    console.error('🔥 마감 임박 정책 로딩 실패:', error);
  }
};

const props = defineProps({
  deadlinePolicies: {
    type: Array,
    required: true,
  },
});

// 샘플 금융상품 데이터 (예시용)
const sampleProductList = ref([
  {
    savingId: 1, // 적금 ID (depositId 대신 savingId 등 명확히)
    productName: '청년 희망 적금',
    bankCode: '0010927', // 은행 코드 (로고 출력용)
    bankName: '국민은행',
    options: [
      {
        intrRate: 3.5, // 기본 금리
        intrRate2: 4.0, // 최고 금리
        saveTrm: 12, // 기간(개월)
      },
    ],
    bookmarked: true,
    target: '청년', // 대상 정보
  },
]);

onMounted(() => {
  loadSummary();
  loadGoals();
  loadDeadlinePolicies();
});

onMounted(async () => {
  try {
    const [depositData, savingData] = await Promise.all([
      getTopDeposits(),
      getTopSavings(),
    ]);

    // 데이터 합치기 (type 필드 추가)
    products.value = [
      ...depositData.map((d) => ({ ...d, type: '예금' })),
      ...savingData.map((s) => ({ ...s, type: '적금' })),
    ];
  } catch (err) {
    console.error('금융 상품 불러오기 실패:', err);
  }
});

watch(
  () => route.query.refresh,
  (val) => {
    if (val === 'true') {
      loadSummary();
      loadGoals();
    }
  }
);
</script>

<template>
  <!-- 목표 리스트 -->
  <div style="display: flex">
    <p
      style="margin: 10px 10px -30px 25px; color: #6b7684; font-weight: bolder"
    >
      나의 목표
    </p>
    <i
      class="fa-solid fa-angle-right fa-sm"
      @click="goToGoalPage"
      style="color: #d9d9d9; cursor: pointer; margin: 23px 0 5px 0"
    ></i>
  </div>

  <div class="goal-main-container">
    <div class="goals-container">
      <!-- 목표가 없을 때: GoalEmptyCard 컴포넌트 사용 -->
      <GoalEmptyCard
        v-if="goalStore.goals.length === 0"
        @click="goToGoalPage"
      />

      <!-- 목표가 있을 때: 기존 GoalCard -->
      <div v-else class="goals-grid">
        <GoalCard
          v-if="sortedGoals.length > 0"
          :goal="transformGoal(sortedGoals[0])"
          @click="goToGoalDetail(sortedGoals[0].goalId)"
          @delete="handleDeleteGoal"
        />
      </div>
    </div>
  </div>

  <!-- 계좌 정보 -->
  <div style="display: flex">
    <p style="margin: 10px 10px 0px 25px; color: #6b7684; font-weight: bolder">
      나의 계좌
    </p>
    <i
      class="fa-solid fa-angle-right fa-sm"
      @click="goToTotalPage"
      style="color: #d9d9d9; cursor: pointer; margin: 23px 0 5px 0"
    ></i>
  </div>

  <div style="margin: 0px 20px; padding-top: 10px">
    <div v-if="isUnlinked" class="card card-unlinked">
      <div class="card-text">연동시 더 많은 기능을 이용할 수 있어요!</div>
      <button class="card-btn" @click="goToAccountAuth">계좌연동</button>
    </div>

    <div v-else-if="bankSummaryList" class="card">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        "
      >
        <img
          :src="bankLogoUrl"
          alt="은행 로고"
          style="height: 47px; margin: 0"
        />
        <div style="text-align: left; margin: 20px 0 25px -80px">
          <div style="font-size: 16px; font-weight: 500; margin-bottom: -3px">
            {{
              bankSummaryList?.totalBalance
                ? bankSummaryList.totalBalance.toLocaleString()
                : '0'
            }}원
          </div>
          <div style="font-size: 12px; color: #555; margin-top: 3px">
            {{ bankSummaryList?.representativeAccountName }}외
            {{ (bankSummaryList?.accountCount || 1) - 1 }}개 계좌
          </div>
        </div>
        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          "
        >
          <span v-if="isMainBank">
            <i
              class="fa-solid fa-star"
              style="color: #ffd43b; position: relative; top: -20px; left: 4px"
            ></i>
          </span>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <p>로딩 중...</p>
    </div>
  </div>

  <!-- 마감임박 정책 -->
  <div style="display: flex; margin-top: 12px">
    <p
      style="margin: 10px 10px -10px 25px; color: #6b7684; font-weight: bolder"
    >
      마감 임박 정책
    </p>
    <i
      class="fa-solid fa-angle-right fa-sm"
      @click="goToPolicyPage"
      style="color: #d9d9d9; cursor: pointer; margin: 23px 0 5px 0"
    ></i>
  </div>
  <!-- 정책 카드뷰 -->
  <div style="margin: 12px 20px 10px 20px">
    <recommendCarousel
      :cards="deadlinePolicies"
      :showDday="true"
      style="padding-bottom: 0px"
    />
  </div>

  <!-- 금융 상품 -->
  <div style="display: flex; margin-top: -16px">
    <p
      style="margin: 10px 10px -10px 25px; color: #6b7684; font-weight: bolder"
    >
      금융 상품
    </p>
    <i
      class="fa-solid fa-angle-right fa-sm"
      @click="goToFinancialPage"
      style="color: #d9d9d9; cursor: pointer; margin: 23px 0 5px 0"
    ></i>
  </div>

  <!-- 예, 적금 우대 금리 상위 2개 상품 출력 -->
  <div style="margin: 2px 20px">
    <Swiper
      v-if="products.length > 0"
      :slides-per-view="'auto'"
      :space-between="16"
      :pagination="{ clickable: true }"
      :modules="[Pagination]"
      class="financial-swiper"
    >
      <SwiperSlide
        v-for="(item, index) in products"
        :key="index"
        class="financial-slide"
      >
        <FinancialCard
          :deposit="item"
          :productType="item.type"
          style="margin-bottom: 5px"
        />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  height: 80px;
  margin: auto;
  padding: 0px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #fff;
  text-align: center;
  border: 1px solid #e0e0e0;
}
.card-unlinked {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80px;
  gap: 8px;
}

.card-text {
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
}
.card-btn {
  background: #f2f4f6;
  color: #6b7684;
  border: 1.5px solid #f2f4f6;
  border-radius: 18px;
  padding: 6px 16px;
  font-size: 11px; /* 목표 버튼과 동일 */
  font-weight: 600;
  width: 105px; /* 목표 버튼 기준 정확히 일치 (or 100%면 wrapper로 통일) */
  height: 25px; /* 명시적 높이 부여 */
  line-height: 1;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-btn:hover {
  transform: translateY(-2px);
  background: #e0e0e0;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-btn:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

.goal-main-container {
  padding: 12px 20px;
}

.goals-container {
  flex: 1;
}

.goals-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.financial-swiper {
  width: 100%;
  padding: 10px 0;
}

.financial-slide {
  width: 100%; /* 화면의 90% 너비 */
}

::v-deep(.financial-swiper .swiper-pagination) {
  position: static !important;
  margin-top: -1px;
  padding-top: 0px;
}
</style>
