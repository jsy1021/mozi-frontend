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
  if (accountNumber == null) return '';
  const s = String(accountNumber).trim(); // 숫자나 null 방어, 공백 제거
  const length = s.length;
  if (length <= 4) return s;

  const visible = 4;

  // 길이가 짧아서 앞/뒤 4글자 확보가 안 되는 경우(5..8)
  // => 앞1, 뒤1만 노출하고 가운데는 '-'은 유지하고 나머지는 '*' 처리
  if (length <= visible * 2) {
    const first = s[0];
    const last = s[length - 1];
    const middle = s
      .slice(1, -1)
      .split('')
      .map(ch => (ch === '-' ? '-' : '*'))
      .join('');
    return `${first}${middle}${last}`;
  }

  // 일반적인 경우: 앞 4 / 뒤 4 고정
  const firstPart = s.slice(0, visible);
  const lastPart = s.slice(-visible);
  const middleLength = Math.max(0, length - visible * 2);

  // 이 부분은 원하신 대로 '*.repeat(...)' 구조 사용
  let middlePart = '*'.repeat(middleLength).split('');

  // 원본 문자열의 해당 위치가 '-'이면 그대로 '-'로 덮어쓰기
  for (let i = 0; i < middleLength; i++) {
    if (s[visible + i] === '-') {
      middlePart[i] = '-';
    }
  }

  return `${firstPart}${middlePart.join('')}${lastPart}`;
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

// 1. <script setup> 섹션에 추가할 코드

// 은행별 자산관리 정보 (기존 은행 관련 코드 아래에 추가)
const bankAssetManagement = {
  '0004': {
    // 국민은행
    name: 'KB국민은행',
    hasAssetManagement: true,
    services: [
      {
        name: 'KBot SAM\n케이봇쌤',
        url: 'https://omoney.kbstar.com/quics?page=C056123',
        icon: 'fa-solid fa-chart-line',
        description: 'AI 자산관리 상담',
      },
      {
        name: '연금 관리\n\n',
        url: 'https://omoney.kbstar.com/quics?page=C055442',
        icon: 'fa-solid fa-piggy-bank',
        description: '연금 통합관리',
      },
      {
        name: 'KB종합\n자산관리',
        url: 'https://omoney.kbstar.com/quics?page=C065350',
        icon: 'fa-solid fa-hand-holding-dollar',
        description: '종합 자산관리',
      },
    ],
  },
  '0020': {
    // 우리은행
    name: '우리은행',
    hasAssetManagement: true,
    services: [
      {
        name: '자산 관리\n\n',
        url: 'https://spot.wooribank.com/pot/Dream?withyou=wa',
        icon: 'fa-solid fa-chart-line',
        description: '우리은행 My자산 진단',
      },
      {
        name: '펀드\n포트폴리오',
        url: 'https://spot.wooribank.com/pot/Dream?withyou=WAFND0014',
        icon: 'fa-solid fa-chart-pie',
        description: '우리은행 펀드 포트폴리오',
      },
      {
        name: '미래 설계\n\n',
        url: 'https://spot.wooribank.com/pot/Dream?withyou=WAAPL0011',
        icon: 'fa-solid fa-mobile-alt',
        description: '우리은행 미래설계',
      },
    ],
  },
  // 자산관리 서비스가 없는 은행들
  '0003': {
    name: '기업은행',
    hasAssetManagement: false,
    homepage: 'https://www.ibk.co.kr/',
  },
  '0011': {
    name: '농협은행',
    hasAssetManagement: false,
    homepage: 'https://banking.nonghyup.com/nhbank.html',
  },
  '0023': {
    name: 'SC제일은행',
    hasAssetManagement: false,
    homepage: 'https://www.standardchartered.co.kr/np/kr/Intro.jsp',
  },
  '0027': {
    name: '씨티은행',
    hasAssetManagement: false,
    homepage: 'https://www.citibank.co.kr/ComMainCnts0100.act',
  },
  '0031': {
    name: '대구은행',
    hasAssetManagement: false,
    homepage: 'https://www.imbank.co.kr/dgb_ebz_main.jsp',
  },
  '0037': {
    name: '전북은행',
    hasAssetManagement: false,
    homepage: 'https://www.jbbank.co.kr/',
  },
  '0039': {
    name: '경남은행',
    hasAssetManagement: false,
    homepage: 'https://www.knbank.co.kr/ib20/mnu/BHP000000000001',
  },
  '0045': {
    name: '새마을금고',
    hasAssetManagement: false,
    homepage: 'https://www.kfcc.co.kr/',
  },
  '0071': {
    name: '우체국',
    hasAssetManagement: false,
    homepage: 'https://www.epostbank.go.kr/IHDMDM0000.do',
  },
  '0081': {
    name: 'KEB하나은행',
    hasAssetManagement: false,
    homepage: 'https://www.kebhana.com/',
  },
  '0088': {
    name: '신한은행',
    hasAssetManagement: false,
    homepage: 'https://www.shinhan.com/index.jsp',
  },
};

// 줄바꿈 처리
function formatName(name) {
  return name.replace(/\n/g, '<br>');
}

// 주거래 은행 판단 함수 (기존 openAssetManagement 함수 위에 추가)
const getPrimaryBank = (linkedAccounts) => {
  if (!linkedAccounts || linkedAccounts.length === 0) {
    return null;
  }

  const bankBalances = {};

  linkedAccounts.forEach((account) => {
    const bankCode = account.bankCode;
    if (!bankBalances[bankCode]) {
      bankBalances[bankCode] = {
        totalBalance: 0,
        accountCount: 0,
        bankCode: bankCode,
      };
    }
    bankBalances[bankCode].totalBalance += account.balance || 0;
    bankBalances[bankCode].accountCount += 1;
  });

  const sortedBanks = Object.values(bankBalances).sort(
    (a, b) => b.totalBalance - a.totalBalance
  );

  return sortedBanks[0]?.bankCode || null;
};

// 자산관리 데이터 생성 함수 (getPrimaryBank 함수 아래에 추가)
const getAssetManagementData = (linkedAccounts) => {
  const primaryBankCode = getPrimaryBank(linkedAccounts);
  const primaryBank = bankAssetManagement[primaryBankCode];

  if (!primaryBank) {
    return {
      bankName: 'KB국민은행',
      title: '🎉 목표 달성!',
      subtitle: '자산 성장 모드 ON',
      description: 'KB 자산관리센터 (기본 추천)',
      services: bankAssetManagement['0004'].services,
      isPrimary: false,
    };
  }

  if (primaryBank.hasAssetManagement) {
    return {
      bankName: primaryBank.name,
      title: '🎉 목표 달성!',
      subtitle: '자산 성장 모드 ON',
      description: `${primaryBank.name} 자산관리센터`,
      services: primaryBank.services,
      isPrimary: true,
    };
  } else {
    return {
      bankName: primaryBank.name,
      title: '🎉 목표 달성!',
      subtitle: '자산 성장 모드 ON',
      description: `${primaryBank.name}에서는 자산관리 서비스를 제공하지 않아 KB 자산관리센터를 추천합니다`,
      services: bankAssetManagement['0004'].services,
      isPrimary: false,
      primaryBankHomepage: primaryBank.homepage,
    };
  }
};

// computed 속성 추가 (기존 guideMessage computed 아래에 추가)
const assetManagementData = computed(() => {
  return getAssetManagementData(linkedAccounts.value);
});

// 주거래 은행 홈페이지 열기 함수 (기존 openAssetManagement 함수 아래에 추가)
const openPrimaryBankHomepage = () => {
  const data = assetManagementData.value;
  if (data.primaryBankHomepage) {
    window.open(data.primaryBankHomepage, '_blank');
  }
};

// 금액 포맷팅 함수
const formatCurrency = (amount) => {
  // amount가 undefined나 null인 경우 처리
  if (amount == null || amount === undefined) {
    return '0원';
  }

  // 숫자가 아닌 경우 처리
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return '0원';
  }

  if (numAmount >= 100000000) {
    return `${(numAmount / 100000000).toFixed(1)}억원`;
  } else if (numAmount >= 10000) {
    return `${(numAmount / 10000).toFixed(0)}만원`;
  } else {
    return `${numAmount.toLocaleString()}원`;
  }
};

// D-Day 계산
function getDDay(dateStr) {
  if (!dateStr) return '';
  const today = new Date();
  const goalDate = new Date(dateStr.split('T')[0]); // "yyyy-mm-dd"

  const diff = goalDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `D-${days}`;
  else if (days === 0) return 'D-DAY';
  else return `D+${Math.abs(days)}`;
}


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
            {{ goal.goalName || '목표명 없음' }}
          </p>
        </div>

        <div class="icon">
          <!-- 수정 -->
          <router-link :to="`/goal/${goalId}/edit`" class="edit-link">
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

      <!-- 키워드와 계좌 총액을 한 줄에 -->
      <div class="keyword-amount-row">
        <!-- 키워드 -->
        <div class="goal-keyword">
          <p>#{{ keywordToKorean(goal.keyword) || '키워드 없음' }}</p>
        </div>

        <!-- 계좌 총액 / 목표 금액 형식 -->
        <p class="account-sum">
          <!-- {{ safeToLocaleString(currentAmount) }} -->
            {{ formatCurrency(currentAmount) }}
          /
          <!-- {{ safeToLocaleString(goal.targetAmount || goal.target_amount) }} 원 -->
            {{ formatCurrency(goal.targetAmount) }}
        </p>
      </div>

      <!-- 토글 버튼 (펼치기)-->
      <div v-if="!isExpanded" class="toggle-arrow" @click="toggleExpand">
        <i class="fa-solid fa-chevron-down"></i>
      </div>

      <!-- 토글 아래 부분 -->
      <div class="toggle-down" v-show="isExpanded">
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

        <!-- 날짜 -->
        <!-- <div class="goal-date"> -->
        <div class="goal-date-target">
          <p><span class="label">목표 달성일</span></p>
          <p class="txt">
            {{ formatDate(goal.goalDate) || '날짜 없음' }}
            <span v-if="goal.goalDate" class="d-day">
              {{ getDDay(goal.goalDate) }}
            </span>
          </p>
        </div>

        <!-- 메모 -->
        <div class="goal-memo">
          <p><span class="label">메모</span></p>
          <p class="txt">{{ goal.memo || '메모가 없습니다.' }}</p>
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
              <div style="flex: 0 0 auto; padding: 0; margin-left: 5px">
                <img :src="getBankLogoUrl(acc.bankCode)" class="bank-logo" />
              </div>
              <div style="flex: 1; padding: 0; margin: 0">
                <span class="account-name">{{ acc.accountName }}</span><br />
                <span class="account-number">{{ maskAccountNumber(acc.accountNumber)}}</span>
              </div>
              <div
                style="
                  margin-top: 25px;
                  flex: 0 0 auto;
                  margin: 0;
                  padding: 0;
                  margin-right: 5px;
                "
              >
                <span class="account-balance"
                  >{{ safeToLocaleString(acc.balance) }}원</span
                >
              </div>
            </div>
          </div>
          <div v-else>
            <p>연결된 계좌가 없습니다.</p>
          </div>
        </div>

        <!-- 토글 버튼 (접기)-->
        <div class="toggle-arrow" @click="toggleExpand">
          <i class="fa-solid fa-chevron-up"></i>
        </div>
      </div>
      <!-- end toggle-down -->
    </div>
    <!-- end goal-info -->
    <div v-if="goalAchieved" class="asset-management">
      <div class="asset-header">
        <p class="asset-title">{{ assetManagementData.title }}</p>
        <p class="asset-subtitle">{{ assetManagementData.subtitle }}</p>
        <p class="asset-description">{{ assetManagementData.description }}</p>

        <!-- 주거래 은행에 자산관리 서비스가 없는 경우 안내 -->
        <div
          v-if="
            !assetManagementData.isPrimary &&
            assetManagementData.primaryBankHomepage
          "
          class="primary-bank-notice"
        >
          <p class="notice-text">
            <i class="fa-solid fa-info-circle"></i>
            {{ assetManagementData.bankName }} 홈페이지도 확인해보세요
          </p>
          <button @click="openPrimaryBankHomepage" class="primary-bank-btn">
            {{ assetManagementData.bankName }} 홈페이지
          </button>
        </div>
      </div>

      <div class="asset-url-box">
        <div
          v-for="(service, index) in assetManagementData.services"
          :key="index"
          class="asset-manage-url"
          @click="openAssetManagement(service.url)"
          :title="service.description"
        >
          <div class="asset-icon">
            <i :class="service.icon"></i>
          </div>
          <p class="asset-link">{{ service.name }}</p>
        </div>
      </div>

      <!-- 추천 뱃지 -->
      <div class="recommendation-badge" v-if="!assetManagementData.isPrimary">
        <i class="fa-solid fa-star"></i>
        <span>KB 추천 서비스</span>
      </div>
    </div>

    <!-- 달성x : 맞춤형 추천 영역-->
    <div v-else>
      <!-- <RecommendSection /> -->
      <RecommendSection :goalId="goalId" />
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
  color: #6b7684;
}

/* 상단 */
.top {
  display: flex;
  text-align: center;
  height: 40px;
  margin-top: 1rem;
  margin-bottom: 2px;
}

.top-backbtn {
  margin-left: 23px;
  margin-bottom: 4px;
}

.back-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: #6b7684;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.back-btn:hover {
  background-color: rgba(54, 193, 140, 0.1);
  transform: translateX(-2px);
}

.top-title {
  align-items: center;
  margin-left: 100px;
}

.top-title > p {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* 내용 시작 */
.goal-detail {
  margin: 0;
  padding: 0;
}

.goal-info {
  margin: 0 20px 10px 20px;
  border: 1px solid #e8f5f0;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(54, 193, 140, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  transition: all 0.3s ease;
  min-height: auto;
  padding: 16px 0 8px 0;
}

.goal-info:hover {
  box-shadow: 0 8px 32px rgba(54, 193, 140, 0.12);
}

.goal-top {
  display: flex;
  height: 30px;
  margin-top: 6px;
  margin-bottom: 6px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.mygoal {
  flex: 1;
  text-align: left;
}

.goalName {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.icon {
  display: flex;
  gap: 12px;
  align-items: center;
}

.update {
  color: #6b7684;
  font-size: 14px;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.update:hover {
  background-color: #f2f4f6;
  color: #333;
}

/* 키워드 */
.goal-keyword {
  margin: 0;
  padding: 0;
  text-align: left;
}

.goal-keyword > p {
  display: inline-block;
  padding: 6px 14px;
  background: #f5f5f5;
  color: #aaa;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.2);
}

/* 계좌 총액 표시 */
.account-sum {
  margin: 0;
  padding: 0;
  font-weight: 500;
  font-size: 12px;
  color: #2c3e50;
  text-align: right;
}

/* 목표 달성 완료 */
.goal-complete {
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  background: linear-gradient(135deg, #d2f5e9 0%, #ffffff 100%);
  border: 2px solid #36c18c;
  box-shadow: 0 4px 16px rgba(54, 193, 140, 0.15);
  position: relative;
  overflow: hidden;
}

.goal-complete::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #36c18c, #2f9b78, #36c18c);
  border-radius: 10px 10px 0 0;
}

.goal-complete > p {
  font-weight: 600;
  color: #2f9b78;
  margin: 0;
  font-size: 16px;
}

/* 목표 달성 가이드 */
.goal-guide {
  border-radius: 12px;
  width: 100%;
  max-width: 320px;
  background: linear-gradient(135deg, #f8fffe 0%, #e8f5f0 100%);
  margin: 16px 0;
  padding: 16px;
  border: 1px solid #d2f5e9;
  box-shadow: 0 2px 12px rgba(54, 193, 140, 0.08);
}

.guide {
  color: #6b7684;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.comment {
  color: #2c3e50;
  font-weight: 600;
  font-size: 15px;
  margin: 0;
}

/* 목표 달성 후 자산관리 섹션 */
.asset-management {
  margin: 20px;
  border-radius: 20px;
  text-align: center;
  background: linear-gradient(135deg, #d2f5e9 0%, #ffffff 100%);
  border: 2px solid #36c18c;
  box-shadow: 0 6px 24px rgba(54, 193, 140, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.asset-management::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #36c18c, #2f9b78, #36c18c);
  border-radius: 18px 18px 0 0;
}

.asset-management:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(54, 193, 140, 0.2);
  border-color: #2f9b78;
}

.asset-header {
  margin-bottom: 24px;
  text-align: center;
}

.asset-title {
  font-size: 20px;
  font-weight: 700;
  color: #36c18c;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 2px rgba(54, 193, 140, 0.1);
}

.asset-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.asset-description {
  font-size: 14px;
  color: #6b7684;
  margin: 0;
  font-weight: 500;
}

.asset-url-box {
  display: flex !important;
  flex-wrap: nowrap !important;
  flex-direction: row !important;
  gap: 16px;
  justify-content: center;
}

.asset-manage-url {
  width: 90px;
  height: 100px;
  border: 2px solid #e8f5f0;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  box-shadow: 0 4px 12px rgba(54, 193, 140, 0.08);
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
  border-color: #36c18c;
  box-shadow: 0 8px 24px rgba(54, 193, 140, 0.15);
  background: linear-gradient(135deg, #f8fffe 0%, #ffffff 100%);
}

.asset-manage-url:active {
  transform: translateY(-2px);
}

.asset-icon {
  margin-bottom: 8px;
  color: #36c18c;
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
  color: white;
  transform: scale(1.1);
  background: linear-gradient(135deg, #36c18c 0%, #2f9b78 100%);
  box-shadow: 0 4px 12px rgba(54, 193, 140, 0.3);
}

.asset-link {
  margin: 0;
  line-height: 1.3;
  cursor: pointer;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  color: #2c3e50;
  transition: color 0.3s ease;
  white-space: pre-line; /* 줄바꿈 */
}

.asset-manage-url:hover .asset-link {
  color: #36c18c;
}

/* 토글 */
.toggle-arrow {
  cursor: pointer;
  margin: 0 0;
  font-weight: bold;
  text-align: center;
  color: #6b7684;
  user-select: none;
  padding: 0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.toggle-arrow:hover {
  background-color: rgba(54, 193, 140, 0.1);
  color: #36c18c;
}

/* 토글 아래 내용 */
.toggle-down {
  width: 100%;
  padding: 0 12px 8px 12px;
}

.label {
  color: #6b7684;
  margin-top: 5px;
  font-weight: 500;
  font-size: 14px;
}

.txt{
  font-size: 14px;
}

.goal-date-target,
.goal-memo,
.goal-account {
  border: 1px solid #e8f5f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  margin: 12px 0;
  padding: 16px;
  width: 100%;
  max-width: 320px;
  transition: all 0.2s ease;
}

.goal-date-target:hover,
.goal-memo:hover,
.goal-account:hover {
  border-color: #d2f5e9;
  box-shadow: 0 4px 16px rgba(54, 193, 140, 0.1);
}

.d-day {
  margin-left: 8px;
  border-radius: 5px;
  background: linear-gradient(135deg, #2f9b78, #68e8c7); /* 그라데이션 */
  color: #FFF;
  font-size: 12px;
  padding: 2px 6px;
  display: inline-block;
}


/* 은행 로고 이미지 */
.bank-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.account-name {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.account-number {
  font-size: 12px;
  color: #6b7684;
}

.account-balance {
  font-size: 14px;
  color: #36c18c;
  font-weight: 600;
}

/* 모달 스타일 (삭제 버튼) */
.delete-btn {
  border: none;
  background: none;
  color: #6b7684;
  font-size: 14px;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #f2f4f6;
  color: #333;
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #f8fffe 0%, #ffffff 100%);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 12px;
  font-size: 16px;
  color: #2c3e50;
  line-height: 1.5;
}

.warning-text {
  font-size: 14px !important;
  color: #dc3545 !important;
  font-weight: 500 !important;
}

.modal-footer {
  padding: 16px 20px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f8f9fa;
}

.cancel-btn,
.confirm-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #6b7684;
  border: 1px solid #e9ecef;
}

.cancel-btn:hover {
  background-color: #e9ecef;
  border-color: #d2d6db;
}

.confirm-btn {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  transform: translateY(-1px);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .goal-info {
    margin: 0 16px 16px 16px;
  }

  .asset-management {
    margin: 16px;
    padding: 20px 16px;
  }

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

  .modal-content {
    width: 300px;
  }

  .top-title {
    margin-left: 80px;
  }
}

/* 부드러운 애니메이션 효과 */
@keyframes gentle-pulse {
  0%,
  100% {
    box-shadow: 0 6px 24px rgba(54, 193, 140, 0.15);
  }
  50% {
    box-shadow: 0 6px 24px rgba(54, 193, 140, 0.25);
  }
}

.asset-management {
  animation: gentle-pulse 4s ease-in-out infinite;
}

/* 로딩 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.goal-info,
.asset-management {
  animation: fadeIn 0.6s ease-out;
}

/* 3. <style scoped> 섹션 맨 아래에 추가할 CSS */

/* 주거래 은행 안내 섹션 */
.primary-bank-notice {
  margin: 12px 0;
  padding: 12px;
  background: linear-gradient(135deg, #fff3cd 0%, #fefefe 100%);
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  text-align: center;
}

.notice-text {
  font-size: 13px;
  color: #856404;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.notice-text i {
  margin-right: 6px;
  color: #f39c12;
}

.primary-bank-btn {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.2);
}

.primary-bank-btn:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

/* 추천 뱃지 */
.recommendation-badge {
  margin-top: 16px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #36c18c 0%, #2f9b78 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.2);
}

.recommendation-badge i {
  font-size: 11px;
}

/* 서비스 카드에 툴팁 효과 */
.asset-manage-url {
  position: relative;
}

.asset-manage-url::after {
  content: attr(title);
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;
}

.asset-manage-url:hover::after {
  opacity: 1;
}

/* 자산관리 설명 텍스트 개선 */
.asset-description {
  font-size: 13px;
  color: #6b7684;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
  max-width: 280px;
  margin: 0 auto;
}

/* 애니메이션 개선 */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(20px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) translateY(-5px);
  }
  70% {
    transform: scale(0.9) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.asset-manage-url {
  animation: bounceIn 0.6s ease-out;
}

.asset-manage-url:nth-child(1) {
  animation-delay: 0.1s;
}
.asset-manage-url:nth-child(2) {
  animation-delay: 0.2s;
}
.asset-manage-url:nth-child(3) {
  animation-delay: 0.3s;
}

/* 반응형 개선 */
@media (max-width: 480px) {
  .primary-bank-notice {
    margin: 8px 0;
    padding: 10px;
  }

  .notice-text {
    font-size: 12px;
  }

  .primary-bank-btn {
    font-size: 11px;
    padding: 6px 12px;
  }

  .asset-description {
    font-size: 12px;
    max-width: 250px;
  }

  .recommendation-badge {
    font-size: 11px;
    padding: 6px 12px;
  }
}
.keyword-amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  margin-top: 4px;
  margin-bottom: 2px;
}
.edit-link {
  text-decoration: none;
  color: inherit;
}
</style>