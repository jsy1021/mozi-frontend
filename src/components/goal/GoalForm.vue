<template>
  <div class="goal-form-container">
    <div class="page-header">
      <h1 class="page-title">
        {{ presetData?.goalName ? `${presetData.goalName} 설정` : '나의 목표' }}
      </h1>
      <!-- 1억 모우기 프리셋일 때 특별한 아이콘 표시 -->
      <div v-if="presetData?.goalName === '1억 모으기'" class="billion-icon">
        <i class="fas fa-star"></i>
      </div>
    </div>

    <!-- 1억 모으기 안내 메시지 -->
    <div v-if="presetData?.goalName === '1억 모으기'" class="preset-notice">
      <div class="notice-content">
        <i class="fas fa-info-circle"></i>
        <span
          >1억 모으기 도전에 참가하시는군요! 목표를 향해 함께 달려봐요 🎯</span
        >
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="goal-form">
      <!-- 목표명 -->
      <div class="form-group">
        <label for="goalName">목표명</label>
        <input
          id="goalName"
          type="text"
          v-model="form.goalName"
          placeholder="목표명을 입력하세요"
          :readonly="!!presetData?.goalName || (isEdit && isBillionGoal)"
          :class="{ 
            'preset-input': !!presetData?.goalName || (isEdit && isBillionGoal)
          }"
          required
        />
        <!-- 1억 모으기 수정 시 안내 메시지 -->
        <div v-if="isEdit && isBillionGoal" class="preset-info">
          <i class="fas fa-lock"></i>
          <span>1억 모으기 목표명은 변경할 수 없습니다</span>
        </div>
      </div>

        <div class="form-group">
        <label for="targetAmount">목표 금액</label>
        <div class="amount-input">
          <input
            id="targetAmount"
            type="text"
            :value="displayTargetAmount"
            @input="handleAmountInput"
            placeholder="0"
            :readonly="!!presetData?.targetAmount || (isEdit && isBillionGoal)"
            :class="{ 
              'preset-input': !!presetData?.targetAmount || (isEdit && isBillionGoal),
              'no-spinner': true
            }"
            required
          />
          <span class="currency">원</span>
        </div>
        <!-- 프리셋 또는 1억 모으기 수정 시 안내 메시지 -->
         <div v-if="presetData?.targetAmount || (isEdit && isBillionGoal)" class="preset-info">
          <i class="fas fa-lock"></i>
          <span>
            {{ presetData?.targetAmount 
                ? '프리셋으로 설정된 금액입니다' 
                : '1억 모으기 목표 금액은 변경할 수 없습니다' 
            }}
          </span>
        </div>
      </div>

      <!-- 목표 기간 -->
      <div class="form-group">
        <label for="targetDate">목표 기간</label>
        <input id="targetDate" type="date" v-model="form.targetDate" required />
      </div>

      <!-- 목표 키워드 -->
      <div class="form-group">
        <label>목표 키워드</label>
        <div class="keyword-buttons">
          <button
            type="button"
            v-for="keyword in keywords"
            :key="keyword.key"
            :class="[
              'keyword-btn',
              {
                active: form.keyword === keyword.key,
                preset:
                  presetData?.keyword === keyword.key &&
                  form.keyword === keyword.key,
              },
            ]"
            @click="form.keyword = keyword.key"
          >
            # {{ keyword.label }}
          </button>
        </div>
        <div
          v-if="presetData?.keyword && form.keyword === presetData.keyword"
          class="preset-info"
        >
          <i class="fas fa-star"></i>
          <span>추천 키워드가 선택되었습니다</span>
        </div>
      </div>

      <!-- 추가 메모 -->
      <div class="form-group">
        <label for="memo">추가 메모</label>
        <textarea
          id="memo"
          v-model="form.memo"
          :placeholder="
            presetData?.goalName === '1억 모으기'
              ? 'ex. 1억을 모아서 꿈을 이루겠어!'
              : isEdit
              ? form.memo || 'ex. 꼭 집을 사겠어'
              : 'ex. 꼭 집을 사겠어'
          "
          rows="3"
          maxlength="50"
        ></textarea>
        <div class="char-count">{{ form.memo.length }}/50</div>
      </div>

      <!-- 현재 금액 카드는 여기에 하나만 있습니다 -->
      <!-- 현재 금액 정보 카드 (계좌가 선택되었을 때 표시) -->
      <div v-if="form.selectedAccountNumbers.length > 0" class="current-amount-card">
        <div class="current-amount-content">
          <div class="current-amount-header">
            <i class="fas fa-wallet"></i>
            <span class="current-amount-label">현재 모은 금액</span>
           <i class="fas fa-info-circle tooltip-icon" data-tooltip="연결된 계좌 잔액의 합계입니다"></i>
          </div>
          <div class="current-amount-value">
            {{ formatAmount(form.currentAmount) }}
          </div>
        </div>
      </div>

      <!-- 포함된 계좌 -->
      <div class="form-group">
        <label>포함된 계좌</label>
        <div v-if="loading" class="loading-accounts">
          계좌 정보를 불러오는 중...
        </div>
        <div v-else-if="accountList.length === 0" class="no-accounts">
          연결 가능한 계좌가 없습니다.
        </div>
        <div v-else class="account-list">
          <div
            v-for="account in accountList"
            :key="account.accountId"
            :class="[
              'account-item',
              {
                selected: form.selectedAccountNumbers.includes(
                  account.accountNumber
                ),
                'linked-to-other':
                  accountGoalInfo[account.accountNumber] &&
                  !form.selectedAccountNumbers.includes(account.accountNumber),
              },
            ]"
          >
            <label class="checkbox-label">
              <div class="top-row">
                <input
                  type="checkbox"
                  :value="account.accountNumber"
                  v-model="form.selectedAccountNumbers"
                  @change="updateCurrentAmount"
                  :disabled="
                    accountGoalInfo[account.accountNumber] &&
                    !form.selectedAccountNumbers.includes(account.accountNumber)
                  "
                />
                <span class="checkmark"></span>

                <!-- <div class="account-info"> -->
                <span class="bank-name">
                  <!-- {{account.bankName || account.bankCode}} -->
                  <img :src="getBankLogoUrl(account.bankCode)" class="bank-logo" />
                </span>
                <span class="account-name">{{ account.accountName }}</span>
              </div>

              <!-- <div class="bottom-row"> -->
                <span class="account-number">{{ maskAccountNumber(account.accountNumber) }}</span><br></br>
                <span class="balance">{{ formatAmount(account.balance || 0) }}</span>
              <!-- </div> -->

              <!-- 다른 목표에 연결된 계좌 표시 -->
              <div
                v-if="accountGoalInfo[account.accountNumber]"
                class="linked-goal-info"
              >
                <i class="fas fa-link"></i>
                <span>"{{ accountGoalInfo[account.accountNumber].goalName }}"에 연결됨</span>
              </div>

              <!-- </div> -->
            </label>
            <div
              v-if="form.selectedAccountNumbers.includes(account.accountNumber)"
              class="selected-indicator"
            >
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
        <div
          v-if="form.selectedAccountNumbers.length > 0"
          class="selected-summary"
        >
          <i class="fas fa-check-circle"></i>
          <span>{{ form.selectedAccountNumbers.length }}개 계좌 선택됨</span>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="form-actions">
        <button type="button" class="cancel-btn" @click="handleCancel">
          취소
        </button>
        <button
          type="submit"
          :class="[
            'submit-btn',
            { 'billion-submit': presetData?.goalName === '1억 모으기' },
          ]"
          :disabled="loading"
        >
          {{ isEdit ? '수정' : '등록' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';

import { useBankStore } from '@/stores/bank';

const bankStore = useBankStore();
const banks = bankStore.banks;

// 1억 모으기 목표인지 판별하는 computed
const isBillionGoal = computed(() => {
  return props.isEdit && 
         props.goalData?.name === '1억 모으기' && 
         props.goalData?.targetAmount === 100000000;
});
// 은행 로고 이미지
const getBankLogoUrl = (bankCode) => {
  const bank = banks.find((b) => b.code === bankCode);
  return bank?.logo || '/images/financial/default.png';
};

// Props 정의
const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
  goalData: {
    type: Object,
    default: () => ({}),
  },
  presetData: {
    type: Object,
    default: null,
  },
});

// Emits 정의
const emit = defineEmits(['submit', 'cancel']);

// API 임포트
import goalApi from '@/api/goalApi';
import { getAccountList, getAccountsByGoal } from '@/api/accountApi';

// 계좌 목록 상태
const accountList = ref([]);
const loading = ref(false);
const accountGoalInfo = ref({}); // 계좌별 목표 연결 정보

// 키워드 목록 - goalApi의 getKeywordLabel 메서드와 매칭
const keywords = [
  { key: 'MARRIAGE', label: '결혼' },
  { key: 'EMPLOYMENT', label: '취업' },
  { key: 'HOME_PURCHASE', label: '내집마련' },
  { key: 'TRAVEL', label: '여행' },
  { key: 'EDUCATION_FUND', label: '학자금' },
  { key: 'HOBBY', label: '취미' },
];

// 폼 데이터
const form = reactive({
  goalName: '',
  targetAmount: '',
  currentAmount: 0,
  targetDate: '',
  keyword: '',
  memo: '',
  selectedAccountNumbers: [], //변경: accountId 대신 accountNumber 사용
});

//  선택된 계좌들의 잔액 합계 계산
const updateCurrentAmount = () => {
  const selectedAccounts = accountList.value.filter((account) =>
    form.selectedAccountNumbers.includes(account.accountNumber)
  );
  form.currentAmount = selectedAccounts.reduce(
    (sum, account) => sum + (account.balance || 0),
    0
  );
};

// 계좌별 연결된 목표 정보 조회
const loadAccountGoalInfo = async () => {
  try {
    // 모든 목표 조회
    const goalsResponse = await goalApi.getGoals();
    const goals = goalsResponse || [];

    const goalInfo = {};

    // 각 목표별로 연결된 계좌 조회
    for (const goal of goals) {
      try {
        const linkedResponse = await getAccountsByGoal(goal.goalId);
        const linkedAccounts = linkedResponse.accountList || [];

        // 각 계좌에 목표 정보 매핑
        linkedAccounts.forEach((account) => {
          if (goal.goalId !== props.goalData?.id) {
            // 현재 수정 중인 목표 제외
            goalInfo[account.accountNumber] = {
              goalId: goal.goalId,
              goalName: goal.goalName,
            };
          }
        });
      } catch (error) {
        console.error(`목표 ${goal.goalId}의 계좌 조회 실패:`, error);
      }
    }

    accountGoalInfo.value = goalInfo;
  } catch (error) {
    console.error('계좌-목표 연결 정보 조회 실패:', error);
  }
};

// 계좌 목록 로드 함수
const loadAccounts = async () => {
  loading.value = true;
  try {
    const response = await getAccountList();
    accountList.value = response.accountList || [];

    // 계좌별 목표 연결 정보 로드
    await loadAccountGoalInfo();

    // 수정 모드이고 goalId가 있으면 연결된 계좌 정보 가져오기
    if (props.isEdit && props.goalData?.id) {
      const linkedResponse = await getAccountsByGoal(props.goalData.id);
      const linkedAccounts = linkedResponse.accountList || [];

      // 연결된 계좌번호 목록 설정
      form.selectedAccountNumbers = linkedAccounts.map(
        (acc) => acc.accountNumber
      );

      // 현재 금액 업데이트
      updateCurrentAmount();
    }
  } catch (error) {
    console.error('계좌 목록 로드 실패:', error);
    accountList.value = [];
  } finally {
    loading.value = false;
  }
};

// 날짜 포맷 변환 함수 (LocalDateTime -> yyyy-MM-dd)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';

  // "2024-12-31 23:59:59" 또는 "2024-12-31T23:59:59" 형식을 "2024-12-31"로 변환
  return dateString.split(' ')[0].split('T')[0];
};

// 취소
const handleCancel = () => {
  emit('cancel');
};

// props 변경 감지
watch(
  () => props.presetData,
  () => {
    initializeForm();
  },
  { immediate: true }
);

// goalApi의 금액 포맷팅 사용
const formatAmount = (amount) => {
  return goalApi.formatAmount(amount);
};

// 키워드 한글 라벨 가져오기
const getKeywordLabel = (keywordKey) => {
  return goalApi.getKeywordLabel(keywordKey);
};

// 계좌번호 마스킹 처리 함수
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

// 컴포넌트 마운트 시 폼 초기화 및 계좌 로드
onMounted(() => {
  initializeForm();
  loadAccounts();
});
// 금액 포맷팅 함수 (콤마 추가)
const formatAmountInput = (value) => {
  if (!value) return '';
  // 숫자만 추출
  const numericValue = value.toString().replace(/[^\d]/g, '');
  // 천단위 콤마 추가
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 금액 입력 이벤트 핸들러
const handleAmountInput = (event) => {
  const input = event.target;
  const cursorPosition = input.selectionStart;
  const originalValue = input.value;
  
  // 숫자만 추출
  const numericValue = originalValue.replace(/[^\d]/g, '');
  
  // 콤마 포맷팅 적용
  const formattedValue = formatAmountInput(numericValue);
  
  // form 데이터에는 숫자만 저장
  form.targetAmount = numericValue;
  
  // input에는 포맷된 값 표시
  input.value = formattedValue;
  
  // 커서 위치 조정 (콤마 추가로 인한 위치 변화 고려)
  const commasBeforeCursor = (originalValue.slice(0, cursorPosition).match(/,/g) || []).length;
  const commasAfterFormat = (formattedValue.slice(0, cursorPosition).match(/,/g) || []).length;
  const newCursorPosition = cursorPosition + (commasAfterFormat - commasBeforeCursor);
  
  setTimeout(() => {
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }, 0);
};

// 폼 초기화 함수 수정 (기존 initializeForm 함수에서 targetAmount 부분만 수정)
const initializeForm = () => {
  // 프리셋 데이터가 있는 경우 (1억 모으기 등)
  if (props.presetData) {
    form.goalName = props.presetData.goalName || '';
    // 콤마 포맷팅 적용
    if (props.presetData.targetAmount) {
      form.targetAmount = props.presetData.targetAmount.toString();
    }
    form.keyword = props.presetData.keyword || '';
    form.memo = props.presetData.memo || '';
  }

  // 수정 모드인 경우 (기존 데이터 우선)
  if (props.isEdit && props.goalData) {
    form.goalName = props.goalData.name || '';
    // 콤마 포맷팅 적용
    if (props.goalData.targetAmount) {
      form.targetAmount = props.goalData.targetAmount.toString();
    }
    form.currentAmount = props.goalData.currentAmount || 0;
    form.targetDate = formatDateForInput(props.goalData.targetDate) || '';
    form.keyword = props.goalData.keyword || '';
    form.memo = props.goalData.memo || '';
  }
};

// computed로 표시용 금액 생성
const displayTargetAmount = computed(() => {
  return formatAmountInput(form.targetAmount);
});

// 폼 제출 시에는 숫자만 전송 (기존 handleSubmit 함수 수정)
const handleSubmit = () => {
  if (!validateForm()) return;

  const formData = goalApi.formatGoalData({
    goalName: form.goalName,
    // 숫자로 변환하여 전송
    targetAmount: parseInt(form.targetAmount.toString().replace(/[^\d]/g, '') || 0),
    currentAmount: props.isEdit ? parseInt(form.currentAmount || 0) : 0,
    goalDate: form.targetDate,
    keyword: form.keyword,
    memo: form.memo,
  });

  const accountData = {
    goalId: props.goalData?.id || null,
    accountNumberList: form.selectedAccountNumbers,
  };

  emit('submit', { ...formData, accountData });
};

// 폼 유효성 검사 함수 수정
const validateForm = () => {
  if (!form.goalName.trim()) {
    alert('목표명을 입력해주세요.');
    return false;
  }
  
  const numericAmount = parseInt(form.targetAmount.toString().replace(/[^\d]/g, '') || 0);
  if (!numericAmount || numericAmount <= 0) {
    alert('올바른 목표 금액을 입력해주세요.');
    return false;
  }
  
  if (!form.targetDate) {
    alert('목표 기간을 설정해주세요.');
    return false;
  }
  if (!form.keyword) {
    alert('목표 키워드를 선택해주세요.');
    return false;
  }
  return true;
};

</script>

<style scoped>
.goal-form-container {
  padding: 20px;
  background-color: #f5f5f7;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.billion-icon {
  color: #2f9b78;
  font-size: 20px;
  animation: sparkle 2s ease-in-out infinite alternate;
}

@keyframes sparkle {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.preset-notice {
  background: #d2f5e9;
  border: 1px solid #2f9b78;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2f9b78;
  font-size: 14px;
  font-weight: 500;
}

.notice-content i {
  color: #2f9b78;
}

.goal-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2f9b78;
}

/* 목표 금액 input의 화살표 제거 */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;  /* 표준 속성 추가 */
}

.preset-input {
  background-color: #d2f5e9 !important;
  border-color: #2f9b78 !important;
  color: #2f9b78 !important;
}

.preset-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #2f9b78;
}

.preset-info i {
  color: #2f9b78;
}

.amount-input {
  position: relative;
}

.currency {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
}

/* 현재 금액 카드 스타일 */
.current-amount-card {
  background: #f8fffe;
  border: 1px solid #2f9b78;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-amount-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  justify-content: space-between;
  width: 100%;
}

.current-amount-header {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.current-amount-header i.fas.fa-wallet {
  color: #2f9b78;
  font-size: 13px;
}

.current-amount-label {
  font-size: 13px;
  font-weight: 500;
  color: #2f9b78;
}

.tooltip-icon {
  color: #a0a6b1;
  font-size: 11px;
  cursor: help;
  margin-left: 6px;
  transition: all 0.3s ease;
  opacity: 0.7;
  background: rgba(107, 118, 132, 0.1);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tooltip-icon:hover {
  color: #2f9b78  !important;    /* !important 추가 */
  opacity: 1;
  background: #d2f5e9;
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(47, 155, 120, 0.4);
}

/* 커스텀 툴팁 스타일 */
.tooltip-icon:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #f8fffe;     /* 현재 모인 금액 카드 배경색 */
  color: #2f9b78;         /* 현재 모인 금액 카드 글자색 */
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(47, 155, 120, 0.2);
  border: 1px solid #2f9b78;  /* 카드와 같은 테두리 추가 */
  animation: tooltipFadeIn 0.2s ease;
}

/* FontAwesome 아이콘이 제대로 표시되도록 강제 */
.tooltip-icon::before {
  font-family: "Font Awesome 6 Free" !important;
  font-weight: 900 !important;
  content: "\f05a" !important;  /* info-circle 아이콘 코드 */
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
.current-amount-value {
  font-size: 14px;
  font-weight: 700;
  color: #2f9b78;
  white-space: nowrap;
}

.keyword-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.keyword-btn:hover {
  border-color: #2f9b78;
  color: #2f9b78;
}

.keyword-btn.active {
  background: #2f9b78;
  border-color: #2f9b78;
  color: white;
}

.keyword-btn.preset {
  background: linear-gradient(135deg, #2f9b78, #d2f5e9);
  border-color: #2f9b78;
  color: #ffffff;
  font-weight: 600;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-accounts,
.no-accounts {
  padding: 20px;
  text-align: center;
  color: #6b7684;
  font-size: 14px;
  background-color: #f2f4f6;
  border-radius: 8px;
}

.account-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  background-color: white;
  position: relative;
}

.account-item:hover {
  border-color: #2f9b78;
  background-color: #d2f5e9;
}

.account-item.selected {
  border-color: #2f9b78;
  background-color: #d2f5e9;
  box-shadow: 0 2px 8px rgba(47, 155, 120, 0.2);
}

.checkbox-label {
  display: flex;
  cursor: pointer;
  flex-direction: column;
  padding: 8px 0;
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: #2f9b78;
}

.top-row{
  display: flex;
  align-items: center;
}

.bank-name {
  font-weight: 500;
  color: #333;
}

/* 은행별 로고 */
.bank-logo{
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-left: 8px;
}

.account-name {
  font-weight: 500;
  color: #333;
  margin-left: 6px;
}

.account-number {
  font-size: 12px;
  color: #666;
  margin-left: 30px;
}

.balance {
  font-size: 13px;
  color: #2f9b78;
  font-weight: 500;
  margin-left: 30px;
}

.account-item.linked-to-other {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  opacity: 0.7;
}

.account-item.linked-to-other .checkbox-label {
  cursor: not-allowed;
}

.account-item.linked-to-other input[type='checkbox'] {
  cursor: not-allowed;
}

.linked-goal-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: #6c757d;
  font-style: italic;
  padding-left: 30px;
}

.linked-goal-info i {
  color: #6c757d;
  font-size: 10px;
}

@keyframes checkAnimation {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.selected-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #d2f5e9;
  border-radius: 6px;
  font-size: 13px;
  color: #2f9b78;
}

.selected-summary i {
  color: #2f9b78;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f2f4f6;
  color: #6b7684;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.submit-btn {
  background: #6b7684;
  color: white;
}

.submit-btn:hover {
  background: #555;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.billion-submit {
  background: linear-gradient(135deg, #2f9b78, #d2f5e9) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
}

.billion-submit:hover {
  background: linear-gradient(135deg, #237a5f, #2f9b78) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 155, 120, 0.3);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .goal-form-container {
    padding: 15px;
  }

  .goal-form {
    padding: 20px;
  }

  .keyword-buttons {
    gap: 6px;
  }

  .keyword-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>