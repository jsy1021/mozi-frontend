<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RecommendSection from '@/components/goal/RecommendSection.vue';
import GoalCompletePopup from '@/components/goal/GoalCompletePopup.vue';
import ProgressBar from '@/components/goal/ProgressBar.vue';

import { useGoalStore } from '@/stores/goalStore';
import goalApi from '@/api/goalApi';
import { getAccountsByGoal, getAccountList } from '@/api/accountApi';

import { getBankSummary } from '@/api/accountApi';
import { useBankStore } from '@/stores/bank';

const bankStore = useBankStore();
const banks = bankStore.banks;

// 은행 로고 이미지
const getBankLogoUrl = (bankCode) => {
  const bank = banks.find((b) => b.code === bankCode);
  return bank?.logo || '/images/financial/default.png';
};

//
const route = useRoute();
const router = useRouter();

// route에서 goalId 가져오기
const goalId = route.params.goalId;

// pinia store
const goalStore = useGoalStore();

// store의 selectedGoal을 computed로 가져옴
const goal = computed(() => goalStore.selectedGoal);

// 로딩 상태 추가
const loading = ref(true);

// 삭제 모달
const showDeleteModal = ref(false);

// 목표 달성시 팝업
const showCompletePopup = ref(false);

// 목표 달성 여부 (goal_status === false가 '달성 완료')
// computed로 목표 달성 여부도 수정
const goalAchieved = computed(() => {
  if (!goal.value) return false;
  const targetAmount = goal.value.targetAmount || goal.value.target_amount || 0;
  return currentAmount.value >= targetAmount && targetAmount > 0;
});

// 예상 달성일
const expectedDate = ref(null);

// 연결된 계좌 리스트
const linkedAccounts = ref([]);

// 전체 계좌 리스트
const allAccounts = ref([]);

// 계좌 총합
const currentAmount = ref(0);

// 계좌 목록 로드 (에러 처리 강화)
const loadAccounts = async (goalId) => {
  try {
    // 1. 연결된 계좌 목록
    const linkedData = await getAccountsByGoal(goalId);
    linkedAccounts.value = linkedData.accountList || [];
  } catch (error) {
    console.error('연결된 계좌 조회 실패:', error);
    linkedAccounts.value = [];
  }

  try {
    // 2. 전체 계좌 목록
    const allData = await getAccountList();
    allAccounts.value = allData || [];
  } catch (error) {
    console.error('전체 계좌 조회 실패:', error);
    allAccounts.value = [];
  }
};

// goalId가 변경될 때마다 API에서 goal 가져오기 (에러 처리 강화)
const loadGoal = async (id) => {
  try {
    loading.value = true;
    const numericId = Number(id);

    await goalStore.getGoal(numericId);
    if (!goal.value) return;

    // if (!goal.value) {
    //   console.error('목표 데이터가 없습니다');
    //   return;
    // }

    // 예상 달성일 (에러가 발생해도 계속 진행)
    try {
      const monthlyAmount = 1000000;
      const data = await goalApi.getExpectedDate(numericId, monthlyAmount);
      console.log('예상 달성일 API 응답:', data);
      expectedDate.value =
        typeof data === 'string' ? data : data?.expectedDate || null;
    } catch (error) {
      console.error('예상 달성일 조회 실패:', error);
      expectedDate.value = null;
    }

    // 계좌 목록 (에러가 발생해도 계속 진행)
    await loadAccounts(numericId);

    try {
      currentAmount.value = await goalApi.getCurrentAmountByGoal(numericId);
    } catch (error) {
      console.error('현재 금액 조회 실패:', error);
      currentAmount.value = 0;
    }

    const targetAmount =
      goal.value.targetAmount || goal.value.target_amount || 0;
    const currentGoalStatus = goal.value.goalStatus;
    const shouldBeCompleted =
      currentAmount.value >= targetAmount && targetAmount > 0;

    // Case 1: 목표 달성했는데 아직 미완료 상태 → 완료로 변경
    if (shouldBeCompleted && currentGoalStatus === true) {
      try {
        console.log('🎯 목표 달성! false로 변경');
        await goalStore.updateGoalStatus(numericId, false);
        goal.value.goalStatus = false;

        // 매번 팝업 표시 (localStorage 체크 제거)
        showCompletePopup.value = true;
      } catch (error) {
        console.error('목표 상태 업데이트 실패:', error);
      }
    }

    // Case 2: 목표 미달성인데 완료 상태 → 미완료로 변경
    else if (!shouldBeCompleted && currentGoalStatus === false) {
      try {
        console.log('📉 목표 미달성! true로 변경');
        await goalStore.updateGoalStatus(numericId, true);
        goal.value.goalStatus = true;
      } catch (error) {
        console.error('목표 상태 업데이트 실패:', error);
      }
    }

    // Case 3: 이미 달성된 목표 - 매번 팝업 표시
    else if (shouldBeCompleted && currentGoalStatus === false) {
      showCompletePopup.value = true;
    }
  } catch (error) {
    console.error('목표 로딩 실패:', error);
  } finally {
    loading.value = false;
  }
};

// 날짜 포맷팅
function formatDate(dateStr) {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0]; // "yyyy-mm-dd"
  const d = new Date(clean);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

// 토글
const isExpanded = ref(false);
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;

  // nextTick(() => {
  //   // 강제 리플로우: scrollTop 읽기 같은 방법으로
  //   document.body.scrollTop = document.body.scrollTop;
  // });
};

// 삭제
const confirmDelete = async () => {
  if (!goal.value) return;
  await goalStore.deleteGoal(goal.value.goalId);
  showDeleteModal.value = false;
  router.push('/goal');
};

// 팝업 닫기 함수도 수정 (localStorage 플래그 고려)
const closePopup = () => {
  showCompletePopup.value = false;
  // 필요한 경우 여기서 목표 상태를 완료로 업데이트하는 API 호출 가능
};

// 계좌 연결 해제
const unlinkAccount = async (accountId) => {
  try {
    await goalApi.unlinkAccountFromGoal(accountId);
    await loadAccounts(goalId);
  } catch (error) {
    console.error('계좌 연결 해제 실패:', error);
    alert('계좌 연결 해제에 실패했습니다.');
  }
};

// 계좌 연결
const linkAccount = async (accountId) => {
  try {
    await goalApi.linkAccountsToGoal(goalId, [accountId]);
    await loadAccounts(goalId);
  } catch (error) {
    console.error('계좌 연결 실패:', error);
    alert('계좌 연결에 실패했습니다.');
  }
};

// 안전한 숫자 포맷팅 함수
const safeToLocaleString = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0' : num.toLocaleString();
};

// 계좌 번호 *표시
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  const front = accountNumber.slice(0, 4);
  const back = accountNumber.slice(-4);
  const middleLength = accountNumber.length - 8;
  const middle = '*'.repeat(Math.max(0, middleLength));
  return `${front}${middle}${back}`;
};

// 키워드
const keywords = [
  { key: 'MARRIAGE', label: '결혼' },
  { key: 'EMPLOYMENT', label: '취업' },
  { key: 'HOME_PURCHASE', label: '내집마련' },
  { key: 'TRAVEL', label: '여행' },
  { key: 'EDUCATION_FUND', label: '학자금' },
  { key: 'HOBBY', label: '취미' },
];

function keywordToKorean(keyword) {
  const match = keywords.find((k) => k.key === keyword);
  return match ? match.label : keyword;
}

// 목표 달성 가이드
const achievementRate = computed(() => {
  if (!goal.value || !goal.value.targetAmount) return 0;
  return (currentAmount.value / goal.value.targetAmount) * 100;
});

const guideMessage = computed(() => {
  const rate = achievementRate.value;
  if (rate >= 100) return '축하해요! 목표를 달성했어요 🎉';
  if (rate >= 76) return '눈앞에 있어요! 끝까지!';
  if (rate >= 51) return '거의 다 왔어요! 조금만 더!';
  if (rate >= 26) return '절반 도달! 아주 좋아요';
  return '시작이 반! 꾸준히 해봐요';
});

// 🎯 개선 1: 뒤로가기 로직 개선
const goBack = () => {
  // 쿼리 파라미터에서 from 값을 확인
  const from = route.query.from;

  if (from === 'main') {
    // 메인페이지에서 온 경우 메인페이지로
    router.push('/');
  } else {
    // 그 외의 경우는 목표 페이지로 (기본값)
    router.push('/goal');
  }
};

// 🎯 개선 2: 자산관리 링크 클릭 핸들러
const openAssetManagement = (url) => {
  window.open(url, '_blank');
};

// 초기 로드와 goalId 변경 감지
onMounted(() => loadGoal(goalId));

watch(
  () => route.params.goalId,
  (newId) => {
    loadGoal(newId);
  }
);

// watch(() => showDeleteModal, (val) => {
//   if (val) {
//     document.body.style.overflow = 'hidden';
//   } else {
//     document.body.style.overflow = '';
//   }
// });
</script>

<template>
  <!-- 상단-->
  <div class="top">
    <!-- 뒤로가기 -->
    <div class="top-backbtn">
      <!-- 🎯 개선: 고정된 링크 대신 함수 호출 -->
      <button @click="goBack" class="back-btn">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    </div>
    <!-- 제목 -->
    <div class="top-title">
      <p>목표 상세보기</p>
    </div>
  </div>

  <!-- 로딩 중 -->
  <div v-if="loading" class="loading">
    <p>목표 정보를 불러오는 중...</p>
  </div>

  <!-- 내용 시작 -->
  <div v-else-if="goal" class="goal-detail">
    <!-- 목표 정보 영역 -->
    <div class="goal-info">
      <div class="goal-top">
        <div class="mygoal">
          <p class="goalName">
            나의 목표 : {{ goal.goalName || '목표명 없음' }}
          </p>
        </div>

        <div class="icon">
          <!-- 수정 -->
          <router-link :to="`/goal/${goalId}/edit`">
            <i class="fa-solid fa-pen-to-square update"></i>
          </router-link>

          <!-- 삭제 -->
          <button
            class="delete-btn"
            @click.stop="showDeleteModal = true"
            aria-label="목표 삭제"
          >
            <i class="fas fa-trash"></i>
          </button>

          <!-- 삭제 확인 모달 -->
          <div
            v-if="showDeleteModal"
            class="modal-overlay"
            @click="showDeleteModal = false"
          >
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>목표 삭제</h3>
              </div>

              <div class="modal-body">
                <p>'{{ goal.goalName }}' 목표를 정말 삭제하시겠습니까?</p>
                <p class="warning-text">삭제된 목표는 복구할 수 없습니다.</p>
              </div>

              <div class="modal-footer">
                <button class="cancel-btn" @click="showDeleteModal = false">
                  취소
                </button>
                <button class="confirm-btn" @click="confirmDelete">삭제</button>
              </div>
            </div>
          </div>
          <!-- end modal-overlay -->
        </div>
        <!-- end icon -->
      </div>
      <!-- end goal-top -->

      <!-- 진행률 바 -->
      <ProgressBar
        style="width: 270px"
        :current="currentAmount || 0"
        :target="goal.targetAmount || goal.target_amount || 0"
      />

      <!-- 계좌 총액 / 목표 금액 형식 -->
      <p
        class="account-sum"
        style="margin-top: 8px; font-weight: 500; font-size: 14px"
      >
        {{ safeToLocaleString(currentAmount) }}
        /
        {{ safeToLocaleString(goal.targetAmount || goal.target_amount) }} 원
      </p>

      <!-- 키워드 -->
      <div class="goal-keyword">
        <!-- <p>#{{ goal.keyword || '키워드 없음' }}</p> -->
        <p>#{{ keywordToKorean(goal.keyword) || '키워드 없음' }}</p>
      </div>

      <!-- 목표 달성 여부에 따라 다른 안내 메시지 -->
      <!-- 달성o : 축하 메세지 -->
      <div v-if="goalAchieved" class="goal-complete">
        <p>🎉 목표를 모두 달성했어요!</p>
      </div>
      <!-- 달성x : 목표 달성 가이드 -->
      <div v-else class="goal-guide">
        <p class="guide">💡목표 달성 가이드</p>
        <p class="comment">
          <!-- 조금씩 꾸준히, 목표 자산에 가까워지고 있어요. 오늘도 한 발짝! -->
          {{ guideMessage }}
        </p>
      </div>

      <!-- 토글 버튼 (펼치기)-->
      <div v-if="!isExpanded" class="toggle-arrow" @click="toggleExpand">
        <i class="fa-solid fa-chevron-down"></i>
      </div>

      <!-- 토글 아래 부분 -->
      <div class="toggle-down" v-show="isExpanded">
        <!-- 날짜 -->
        <div class="goal-date">
          <div class="goal-date-target">
            <p><span class="label">목표 달성일</span></p>
            <p>{{ formatDate(goal.goalDate) || '날짜 없음' }}</p>
          </div>
          <div class="goal-date-expect">
            <p><span class="label">예상 달성일</span></p>
            <p>
              {{ expectedDate ? formatDate(expectedDate) : '계산 중...' }}
            </p>
          </div>
        </div>

        <!-- 메모 -->
        <div class="goal-memo">
          <p><span class="label">메모</span></p>
          <p>{{ goal.memo || '메모가 없습니다.' }}</p>
        </div>

        <!-- 포함된 계좌 -->
        <div class="goal-account">
          <p><span class="label">포함된 계좌</span></p>

          <div v-if="linkedAccounts.length > 0" style="margin-bottom: 20px">
            <div
              v-for="acc in linkedAccounts"
              :key="acc.accountId"
              style="
                margin-bottom: 10px;
                display: flex;
                justify-content: flex-start;
                gap: 0;
                align-items: center;
              "
            >
              <!-- <input
                type="text"
                checked
                @change="unlinkAccount(acc.accountId)"
              /> -->
              <div style="flex: 0 0 auto; padding: 0; margin-left: 5px">
                <img :src="getBankLogoUrl(acc.bankCode)" class="bank-logo" />
              </div>
              <div style="flex: 1; padding: 0; margin: 0">
                <span class="account-name">{{ acc.accountName }}</span><br />
                <span class="account-number">{{ maskAccountNumber(acc.accountNumber)}}</span>
              </div>
              <div style="margin-top: 25px; flex: 0 0 auto; margin: 0; padding: 0;  margin-right: 5px;">
                <span class="account-balance">{{ safeToLocaleString(acc.balance) }}원</span
                >
              </div>
            </div>
          </div>
          <div v-else>
            <p>연결된 계좌가 없습니다.</p>
          </div>

          <!-- <hr />

          <p style="margin-top: 10px">
            <span class="label">연결 가능한 계좌</span>
          </p>
          <div v-if="allAccounts.length > 0">
            <div
              v-for="acc in allAccounts.filter(
                (a) => !linkedAccounts.some((l) => l.accountId === a.accountId)
              )"
              :key="acc.accountId"
              style="margin-bottom: 10px"
            >
              <input type="checkbox" @change="linkAccount(acc.accountId)" />
              {{ acc.bankName || '은행명 없음' }}<br />
              ****-****-{{ (acc.accountNumber || '').slice(-4) }}<br />
              {{ safeToLocaleString(acc.balance) }}원
            </div>
          </div>
          <div v-else>
            <p>연결 가능한 계좌가 없습니다.</p>
          </div> -->
        </div>

        <!-- 토글 버튼 (접기)-->
        <div class="toggle-arrow" @click="toggleExpand">
          <i class="fa-solid fa-chevron-up"></i>
        </div>
      </div>
      <!-- end toggle-down -->
    </div>
    <!-- end goal-info -->

    <!-- 목표 달성 여부에 따라 다른 추천 영역 -->
    <!-- 달성o : 자산관리 사이트 -->
    <div v-if="goalAchieved" class="asset-management">
      <div class="asset-header">
        <p class="asset-title">🎉 목표 달성!</p>
        <p class="asset-subtitle">자산 성장 모드 ON</p>
        <p class="asset-description">KB 자산관리센터</p>
      </div>

      <div class="asset-url-box">
        <!-- 🎯 개선: 아이콘과 텍스트 모두 클릭 가능하도록 수정 -->
        <div
          class="asset-manage-url"
          @click="
            openAssetManagement('https://omoney.kbstar.com/quics?page=C056123')
          "
        >
          <div class="asset-icon">
            <i class="fa-solid fa-chart-line"></i>
          </div>
          <p class="asset-link">KBot SAM<br />케이봇쌤</p>
        </div>

        <div
          class="asset-manage-url"
          @click="
            openAssetManagement('https://omoney.kbstar.com/quics?page=C055442')
          "
        >
          <div class="asset-icon">
            <i class="fa-solid fa-piggy-bank"></i>
          </div>
          <p class="asset-link">연금관리</p>
        </div>

        <div
          class="asset-manage-url"
          @click="
            openAssetManagement('https://omoney.kbstar.com/quics?page=C065350')
          "
        >
          <div class="asset-icon">
            <i class="fa-solid fa-hand-holding-dollar"></i>
          </div>
          <p class="asset-link">KB종합<br />자산관리</p>
        </div>
      </div>
    </div>
    <!-- 달성x : 맞춤형 추천 영역-->
    <div v-else>
      <RecommendSection />
    </div>

    <!-- 목표달성팝업 -->
    <GoalCompletePopup v-if="showCompletePopup" @close="closePopup" />
  </div>
  <!-- section -->

  <!-- 목표 데이터 찾을 수 없을 때 -->
  <div v-else class="error-message">
    <p class="text-red-500">목표를 찾을 수 없습니다.</p>
  </div>
</template>

<style scoped>
/* 로딩 및 에러 스타일 */
.loading,
.error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 16px;
  color: #666;
}

/* 상단 */
.top {
  display: flex;
  text-align: center;
  height: 40px;
  margin-top: 1rem;
}
.top-backbtn {
  margin-left: 23px;
  margin-top: 2px;
}

/* 🎯 개선: 뒤로가기 버튼 스타일 */
.back-btn {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font-size: inherit;
}

.back-btn:hover {
  opacity: 0.7;
}

.top-title {
  align-items: center;
  margin-left: 100px;
}
.top-title > p {
  font-size: 20px;
  font-weight: 500;
}

/* 내용 시작 */
.goal-detail {
  margin: 0;
  padding: 0;
}

.goal-info {
  margin: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  text-align: center;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.goal-top {
  display: flex;
  height: 30px;
  margin-top: 10px;
}

.mygoal {
  align-items: center;
  margin-left: 50px;
}
.goalName {
  font-size: 16px;
}

.icon {
  margin-left: 30px;
}
.update {
  margin-right: 10px;
}

/* 키워드 */
.goal-keyword > p {
  display: inline-block;
  padding: 7px;
  background-color: lightgray;
  color: gray;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1;
}

/* 목표 달성 가이드 */
.goal-complete {
  border-radius: 5px;
  padding: 10px 63px;
  /* background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700); */
  margin-bottom: 10px;

  background: linear-gradient(135deg, #d2f5e9 0%, #ffffff 100%);
  border: 2px solid #7bc4a4;
  box-shadow: 0 4px 16px rgba(47, 155, 120, 0.2);
}

/* .goal-complete::before{
    content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2f9b78, #d2f5e9, #2f9b78);
  border-radius: 12px 12px 0 0;
} */

.goal-complete > p {
  font-weight: 500;
}

.goal-guide {
  /* border: 1px solid #d9d9d9; */
  /* border: 2px solid #36C18C; */
  border-radius: 5px;
  width: 310px;
  background-color: #d2f5e9;
  /* background-color: rgba(100, 186, 170, 0.5); */
  margin-bottom: 10px;
}
.guide {
  color: #8e8e93;
}
.comment {
  color: #1a1a1a;
  font-weight: 500;
  padding: 5px;
}

/* 목표 달성 후 자산관리 섹션 개선 */
.asset-management {
  margin: 20px;
  border-radius: 16px;
  text-align: center;

  /* 목표 완료 섹션과 동일한 그라디언트 적용 */
  background: linear-gradient(135deg, #d2f5e9 0%, #ffffff 100%);
  border: 2px solid #7bc4a4;
  box-shadow: 0 6px 20px rgba(47, 155, 120, 0.15);

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
}

/* 상단 빛나는 효과 */
.asset-management::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2f9b78, #d2f5e9, #2f9b78);
  border-radius: 14px 14px 0 0;
}

.asset-header {
  margin-bottom: 20px;
  text-align: center;
}

.asset-title {
  font-size: 20px;
  font-weight: 700;
  color: #2f9b78;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 2px rgba(47, 155, 120, 0.1);
}

.asset-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.asset-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.asset-url-box {
  display: flex !important;
  flex-wrap: nowrap !important;
  flex-direction: row !important;
  gap: 16px; /* 기존 간격 유지 */
  justify-content: center; /* 중앙 정렬 유지 */
  flex-wrap: nowrap; /* 꼭 명시 */
}

.asset-manage-url {
  width: 90px;
  height: 100px;
  border: 2px solid #e8f5f0;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  box-shadow: 0 4px 12px rgba(47, 155, 120, 0.08);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;

  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.asset-manage-url:hover {
  transform: translateY(-4px);
  border-color: #7bc4a4;
  box-shadow: 0 8px 24px rgba(47, 155, 120, 0.15);
  background: linear-gradient(135deg, #f8fffe 0%, #ffffff 100%);
}

.asset-manage-url:active {
  transform: translateY(-2px);
}

.asset-icon {
  margin-bottom: 8px;
  color: #2f9b78;
  font-size: 24px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  border-radius: 12px;
  background: linear-gradient(135deg, #d2f5e9 0%, #e8f5f0 100%);

  transition: all 0.3s ease;
}

.asset-manage-url:hover .asset-icon {
  color: #237a5f;
  transform: scale(1.1);
  background: linear-gradient(135deg, #7bc4a4 0%, #2f9b78 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(47, 155, 120, 0.3);
}

.asset-link {
  margin: 0;
  line-height: 1.3;
  cursor: pointer;
}

.asset-link {
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;

  transition: color 0.3s ease;
}

.asset-manage-url:hover .asset-link {
  color: #2f9b78;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .asset-url-box {
    gap: 12px;
  }

  .asset-manage-url {
    width: 80px;
    height: 90px;
    padding: 10px 6px;
  }

  .asset-icon {
    font-size: 20px;
    width: 36px;
    height: 36px;
  }

  .asset-link {
    font-size: 10px;
  }
}

/* 추가적인 애니메이션 효과 */
@keyframes gentle-glow {
  0%,
  100% {
    box-shadow: 0 6px 20px rgba(47, 155, 120, 0.15);
  }
  50% {
    box-shadow: 0 6px 20px rgba(47, 155, 120, 0.25);
  }
}

.asset-management {
  animation: gentle-glow 4s ease-in-out infinite;
}

/* 호버 시 전체 섹션 효과 */
.asset-management:hover {
  border-color: #2f9b78;
  background: linear-gradient(135deg, #e8f5f0 0%, #ffffff 100%);
}

/* 토글 */
.toggle-arrow {
  cursor: pointer;
  margin: 10px 0;
  font-weight: bold;
  text-align: center;
  color: #666;
  user-select: none;
}

/* 토글 아래 내용 */
.label {
  color: #8e8e93;
  margin-top: 5px;
}

.goal-date-target,
.goal-date-expect,
.goal-memo,
.goal-account {
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.goal-date {
  display: inline-flex;
  margin: 5px;
}
.goal-date-target {
  margin-right: 10px;
  width: 150px;
}
.goal-date-expect {
  width: 150px;
}

.goal-memo {
  width: 310px;
  margin-left: 6px;
}

.goal-account {
  width: 310px;
  margin-bottom: 20px;
  margin-left: 6px;
  margin-top: 5px;
}

/* 은행 로고 이미지 */
.bank-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  /* margin-right: 12px; */
}

.account-name {
  font-size: 16px;
  font-weight: 400;
}
.account-number {
  font-size: 12px;
}
.account-balance {
  font-size: 14px;
  color: #569fff;
}

/* 모달 스타일 (삭제 버튼)*/
.delete-btn {
  border: none;
  background-color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}

.warning-text {
  font-size: 14px !important;
  color: #dc3545 !important;
}

.modal-footer {
  padding: 10px 20px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e9ecef;
}

.confirm-btn {
  background-color: #dc3545;
  color: white;
}

.confirm-btn:hover {
  background-color: #c82333;
}
</style>
