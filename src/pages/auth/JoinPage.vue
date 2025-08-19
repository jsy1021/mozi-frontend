<script setup>
import axios from 'axios';
import { ref, computed, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { authAPI } from '@/api/authApi.js';
import {
  faChevronRight,
  faChevronLeft,
  faXmark,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/stores/auth.js';
import { onUnmounted } from 'vue';

onUnmounted(() => {
  if (countdownTimer.value) clearInterval(countdownTimer.value);
});

const authStore = useAuthStore();

library.add(faChevronRight, faChevronLeft, faXmark, faEye, faEyeSlash);

const router = useRouter();
const route = useRoute();

const agreed = ref({
  all: false,
  service: false,
  personal: false,
});

const showServiceModal = ref(false);
const showPersonalModal = ref(false);
const isJoinPage = ref(false);
const form = reactive({
  email: '',
  password: '',
});

// 화면 전환 함수
function goToJoinForm() {
  isJoinPage.value = true;
}

function goBack() {
  if (isJoinPage.value) {
    // 현재가 회원가입 화면이면 → 약관동의 화면으로 전환
    isJoinPage.value = false;
  } else {
    // 현재가 약관동의 화면이면 → 로그인 페이지로 이동
    router.push({ name: 'loginPage' });
  }
}

watch(isJoinPage, (val) => {
  document.body.style.overflow = val ? 'auto' : 'hidden';
});

const resendCooldown = ref(0);
const countdownTimer = ref(null);

const emailButtonLabel = computed(() =>
  resendCooldown.value > 0 ? `재전송` : '인증'
);
const isSendingEmail = computed(() => resendCooldown.value > 0);

// 회원가입 입력값
const formData = ref({
  name: '',
  phone1: '010',
  phone2: '',
  phone3: '',
  userId: '',
  password: '',
  confirmPassword: '',
  email: '',
  birth: '',
  verificationCode: '', //사용자가 입력한 코드
});

const idCheckMessage = ref('');
const isIdAvailable = ref(false);

const correctCode = ref(''); // 서버에서 보낸 코드 저장
const emailError = ref('');
const emailMessage = ref('');
const sentCode = ref(''); // 서버에서 발송한 인증 코드
const isEmailVerified = ref(false);
const showVerificationInput = ref(false);

// 현재 이메일 저장 상태
const lastSentEmail = ref('');

async function checkUserId() {
  try {
    const isAvailable = await authStore.checkUsername(formData.value.userId);

    if (isAvailable) {
      idCheckMessage.value = '✔ 사용 가능한 아이디입니다.';
      isIdAvailable.value = true;

      // 아이디가 사용 가능하면 이메일 인증 자동 요청
      if (isEmailValid.value && !isEmailVerified.value) {
        await sendVerificationCode(); // 인증 코드 자동 발송
      }
    } else {
      idCheckMessage.value = '✖ 이미 사용 중인 아이디입니다.';
      isIdAvailable.value = false;
    }
  } catch (error) {
    console.error('아이디 중복 확인 중 오류:', error);
    idCheckMessage.value = '아이디 확인에 실패했습니다. 다시 시도해주세요.';
    isIdAvailable.value = false;
  }
}

// 이메일 인증번호 발송 함수
async function sendVerificationCode() {
  const email = formData.value.email.trim().toLowerCase();

  if (!isEmailValid.value) {
    emailError.value = '올바른 이메일을 입력해주세요.';
    emailMessage.value = '';
    return;
  }

  // 이메일이 변경되었으면 타이머 초기화
  if (email !== lastSentEmail.value) {
    resendCooldown.value = 0;
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }
  }

  try {
    const res = await axios.post('/api/users/signup/send-email-code', null, {
      params: { email },
    });
    console.log('[이메일 인증 응답]', res.data); // 응답 로그
    // 응답값 유효성 체크
    if (res.data?.isSuccess === true || res.data?.isSuccess === 'true') {
      // 성공 처리
      isEmailVerified.value = false;
      emailError.value = '';
      emailMessage.value = '인증 코드가 이메일로 전송되었습니다.';
      lastSentEmail.value = email;
      showVerificationInput.value = true;
      startCooldown();
    } else {
      // 실패 처리
      emailError.value = res.data?.message || '이메일 인증 요청 실패';
      emailMessage.value = '';
      console.warn('[이메일 인증 실패]', res.data); // 실패 로그
    }
  } catch (err) {
    console.error('이메일 인증 요청 실패:', err);

    //실패 (중복 이메일)
    console.error('[이메일 인증 요청 에러]', err); // 에러 로그
    emailError.value = err.response?.data?.message || '이메일 인증 요청 실패';
    emailMessage.value = '';
  }
}

watch(
  () => formData.value.email,
  (newVal) => {
    if (newVal !== lastSentEmail.value) {
      resendCooldown.value = 0; // 버튼 바로 활성화
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
      }
    }
  }
);

// 타이머 함수
function startCooldown() {
  resendCooldown.value = 300;
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }

  countdownTimer.value = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }
  }, 1000);
}

async function verifyCode() {
  const email = formData.value.email.trim().toLowerCase();
  const verificationCode = formData.value.verificationCode.trim();

  if (!isEmailValid.value) {
    emailError.value = '유효한 이메일을 입력해주세요.';
    return;
  }

  if (!isVerificationCodeSixDigits.value) {
    emailError.value = '인증번호는 6자리 숫자여야 합니다.';
    return;
  }

  console.log('[인증번호 확인 요청]', { email, verificationCode }); // 요청 로그

  try {
    const res = await axios.post('/api/users/signup/verify-email-code', {
      email,
      verificationCode,
    });

    console.log('[인증번호 확인 응답]', res.data); // 응답 로그

    if (res.data?.isSuccess === true || res.data?.code === 200) {
      emailError.value = '';
      emailMessage.value = '✔ 이메일 인증 완료';
      isEmailVerified.value = true;

      // 인증 완료 시 타이머 중지
      if (countdownTimer.value) clearInterval(countdownTimer.value);
    } else {
      emailMessage.value = '';
      emailError.value = res.data.message || '✖ 인증번호가 일치하지 않습니다.';
      isEmailVerified.value = false;
      console.warn('[인증 실패]', res.data); // 실패 로그
    }
  } catch (error) {
    console.error('[인증번호 확인 에러]', error); // 에러 로그
    emailMessage.value = '';
    emailError.value =
      error.response?.data?.message || '✖ 인증번호가 일치하지 않습니다.';
    isEmailVerified.value = false;
  }
}

// 상태 변수
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

// 비밀번호 조건
const isLengthOk = computed(() => formData.value.password.length >= 10);

const isCompositionOk = computed(() => {
  const pwd = formData.value.password;
  let count = 0;
  if (/[a-zA-Z]/.test(pwd)) count++;
  if (/\d/.test(pwd)) count++;
  if (/[\W_]/.test(pwd)) count++;
  return count >= 2;
});

const isNoTripleNumber = computed(
  () => !/(\d)\1\1/.test(formData.value.password)
);

const isPasswordMatch = computed(() => {
  return (
    formData.value.confirmPassword.length > 0 &&
    formData.value.password === formData.value.confirmPassword
  );
});

const isPasswordMismatch = computed(() => {
  return (
    formData.value.confirmPassword.length > 0 &&
    formData.value.password !== formData.value.confirmPassword
  );
});

//이메일 형식
const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
);

const isVerificationCodeSixDigits = computed(() =>
  /^\d{6}$/.test(formData.value.verificationCode)
);

// 이메일 인증 버튼 활성화 조건
const canSendVerification = computed(() => {
  return isEmailValid.value && resendCooldown.value === 0;
});

//생년월일 형식(YYMMDD, 6자리 숫자)
const isBirthValid = computed(() => {
  if (!/^\d{6}$/.test(formData.value.birth)) return false;

  const year = parseInt(formData.value.birth.substring(0, 2), 10);
  const month = parseInt(formData.value.birth.substring(2, 4), 10);
  const day = parseInt(formData.value.birth.substring(4, 6), 10);

  // 월은 1~12, 일은 1~31 범위 체크
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  return true;
});

//모든 조건 충족
const isFormValid = computed(() => {
  return (
    formData.value.name.trim() &&
    isIdAvailable.value &&
    isLengthOk.value &&
    isCompositionOk.value &&
    isNoTripleNumber.value &&
    formData.value.password === formData.value.confirmPassword &&
    isEmailValid.value &&
    isEmailVerified.value &&
    isBirthValid.value
  );
});

function closeServiceModal() {
  showServiceModal.value = false;
}
function closePersonalModal() {
  showPersonalModal.value = false;
}

const checkedList = computed({
  get() {
    return agreed.value.service && agreed.value.personal;
  },
  set(val) {
    agreed.value.all = val;
    agreed.value.service = val;
    agreed.value.personal = val;
  },
});

function updateAllState() {
  agreed.value.all = agreed.value.service && agreed.value.personal;
}

const canNext = computed(() => agreed.value.service && agreed.value.personal);

function agreeService() {
  agreed.value.service = true;
  updateAllState();
  showServiceModal.value = false;
}

function agreePersonal() {
  agreed.value.personal = true;
  updateAllState();
  showPersonalModal.value = false;
}

// 다음 버튼 클릭 -> 회원가입
function goJoinPage() {
  if (!canNext.value) {
    alert('필수 항목에 모두 동의해주세요.');
    return;
  }
  isJoinPage.value = true;
}

// 회원가입 버튼 클릭
async function submitJoin() {
  if (!formData.value.name.trim()) {
    alert('이름을 입력해주세요.');
    return;
  }
  if (!formData.value.phone2.trim() || !formData.value.phone3.trim()) {
    alert('전화번호를 입력해주세요.');
    return;
  }
  if (!isIdAvailable.value) {
    alert('아이디 중복 확인을 완료해주세요.');
    return;
  }
  if (!formData.value.password || !formData.value.confirmPassword) {
    alert('비밀번호를 입력해주세요.');
    return;
  }
  if (!isLengthOk.value) {
    alert('비밀번호는 10자 이상이어야 합니다.');
    return;
  }
  if (!isCompositionOk.value) {
    alert('비밀번호는 영문, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다.');
    return;
  }
  if (/(\d)\1\1/.test(formData.value.password)) {
    alert('비밀번호에 동일한 숫자를 3번 이상 연속 사용할 수 없습니다.');
    return;
  }
  if (formData.value.password !== formData.value.confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }
  if (!isEmailValid.value) {
    alert('올바른 이메일 형식을 입력해주세요.');
    return;
  }
  if (!isEmailVerified.value) {
    alert('이메일 인증을 완료해주세요.');
    return;
  }
  if (!isBirthValid.value) {
    alert('올바른 생년월일(YYMMDD)을 입력해주세요.');
    return;
  }

  try {
    await authAPI.signup({
      loginId: formData.value.userId,
      username: formData.value.name,
      password: formData.value.password,
      phoneNumber: `${formData.value.phone1}-${formData.value.phone2}-${formData.value.phone3}`,
      email: formData.value.email,
      birthDate: formData.value.birth,
    });

    alert('회원가입이 완료되었습니다!');
    router.push('/auth/LoginPage');
  } catch (error) {
    alert(
      '회원가입에 실패했습니다: ' +
        (error.response?.data?.message || '알 수 없는 오류')
    );
  }
}
</script>

<template>
  <!-- 약관동의 -->
  <div class="join-wrapper">
    <div
      v-if="!isJoinPage"
      id="page"
      :style="{
        overflow: isJoinPage ? 'auto' : 'hidden',
        height: isJoinPage ? 'auto' : '100vh',
      }"
    >
      <div class="terms-container">
        <div class="header">
          <font-awesome-icon
            icon="fa-solid fa-chevron-left"
            class="backIcon"
            @click="goBack"
          />
          <h1 class="logo">MoZi</h1>
        </div>
        <div class="title">약관동의</div>
        <div class="terms-wrapper">
          <label class="checkbox">
            <input type="checkbox" v-model="checkedList" />
            <span>약관 전체동의</span>
          </label>
          <div class="checkbox-wrapper">
            <label class="checkbox">
              <input
                type="checkbox"
                v-model="agreed.service"
                @change="updateAllState"
              />
              <span>이용약관 동의(필수)</span>
            </label>
            <font-awesome-icon
              icon="fa-solid fa-chevron-right"
              class="arrow"
              @click.stop="showServiceModal = true"
            />
          </div>
          <div class="checkbox-wrapper">
            <label class="checkbox">
              <input
                type="checkbox"
                v-model="agreed.personal"
                @change="updateAllState"
              />
              <span>개인정보 수집 및 이용 동의(필수)</span>
            </label>
            <font-awesome-icon
              icon="fa-solid fa-chevron-right"
              class="arrow"
              @click.stop="showPersonalModal = true"
            />
          </div>
          <button
            :disabled="!canNext"
            @click="goJoinPage"
            :class="{ active: canNext }"
          >
            다음
          </button>
        </div>
      </div>
    </div>
    <!-- 이용약관 -->
    <div v-if="showServiceModal" class="modal-overlay">
      <div class="modal">
        <!-- 닫기 버튼 -->
        <font-awesome-icon
          icon="fa-solid fa-xmark"
          class="close-icon"
          @click="closeServiceModal"
        />
        <h2>서비스 이용약관</h2>
        <div class="modal-content">
          <p>
            ■ 제 1 조 (목적)<br />
            본 약관은 [회사명](이하 “회사”라 함)이 제공하는 [서비스명](이하
            “서비스”라 함)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및
            책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.<br /><br />
            ■ 제 2 조 (용어의 정의)<br />
            1. "서비스"란 회사가 제공하는 온라인 플랫폼 및 이와 관련된 제반
            서비스를 의미합니다.<br />
            2. "회원"이란 본 약관에 동의하고 회원가입을 한 자로서, 회사가
            제공하는 서비스를 이용할 수 있는 자를 말합니다.<br />
            3. "아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고
            회사가 승인한 문자와 숫자의 조합을 말합니다.<br />
            4. "비밀번호"란 회원의 동일성 확인과 회원의 권익 및 비밀 보호를
            위하여 회원이 설정한 문자 및 숫자의 조합을 말합니다.<br /><br />
            ■ 제 3 조 (약관의 효력 및 변경)<br />
            1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게
            공지함으로써 효력이 발생합니다.<br />
            2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을
            변경할 수 있습니다.<br />
            3. 변경된 약관은 적용일자 및 개정사유를 명시하여 공지사항으로
            게시하며, 회원에게 불리한 변경의 경우 7일 이상의 사전 유예기간을
            두고 공지합니다.<br />
            4. 회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고
            탈퇴할 수 있으며, 변경된 약관의 효력 발생일 이후에도 서비스를 계속
            이용하는 경우 변경된 약관에 동의한 것으로 간주합니다.<br /><br />
            ■ 제 4 조 (회원가입 및 계약의 성립)<br />
            1. 회원가입은 이용자가 약관에 동의하고 회사가 정한 절차에 따라
            회원가입 신청을 완료함으로써 성립합니다.<br />
            2. 회사는 다음 각 호에 해당하는 경우 회원가입 신청을 승낙하지 않을
            수 있습니다.<br />
            (1) 타인의 명의로 신청한 경우<br />
            (2) 허위 정보를 기재하거나 필수 정보를 누락한 경우<br />
            (3) 기타 회사가 정한 기준에 부합하지 않는 경우<br /><br />
            ■ 제 5 조 (서비스의 제공 및 변경)<br />
            1. 회사는 회원에게 아래와 같은 서비스를 제공합니다.<br />
            (1) [서비스 주요 기능 명시]<br />
            (2) 기타 회사가 정하는 서비스<br />
            2. 회사는 서비스의 품질 향상을 위하여 서비스의 내용, 운영상 또는
            기술상 사항 등을 변경할 수 있습니다.<br /><br />
            ■ 제 6 조 (회원의 의무)<br />
            1. 회원은 다음 행위를 하여서는 안 됩니다.<br />
            (1) 타인의 개인정보를 도용하거나 허위 정보를 입력하는 행위<br />
            (2) 회사 또는 제3자의 지적재산권을 침해하는 행위<br />
            (3) 서비스 운영을 방해하거나 시스템에 해를 끼치는 행위<br />
            2. 회원은 관계 법령, 약관의 규정, 회사의 이용안내 및 주의사항 등
            회사가 통지하는 사항을 준수하여야 합니다.<br /><br />
            ■ 제 7 조 (개인정보보호)<br />
            회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해
            노력합니다. 회원의 개인정보 보호 및 사용에 대해서는 회사의
            개인정보처리방침이 적용됩니다.<br /><br />
            ■ 제 8 조 (서비스의 중단)<br />
            1. 회사는 다음 각 호에 해당하는 경우 서비스의 제공을 일시적으로
            중단할 수 있습니다.<br />
            (1) 시스템 점검, 보수, 교체 등의 경우<br />
            (2) 천재지변, 전쟁, 정전 등 불가항력적 사유가 있는 경우<br />
            2. 회사는 본 조에 따른 서비스 중단으로 발생한 손해에 대하여 책임을
            지지 않습니다.<br /><br />
            ■ 제 9 조 (계약 해지 및 이용제한)<br />
            1. 회원은 언제든지 서비스 내의 회원탈퇴 절차를 통하여 이용계약을
            해지할 수 있습니다.<br />
            2. 회사는 회원이 약관을 위반하거나 서비스 운영을 방해하는 경우 사전
            통지 없이 이용을 제한하거나 계약을 해지할 수 있습니다.<br /><br />
            ■ 제 10 조 (면책조항)<br />
            1. 회사는 천재지변, 불가항력적 사유로 인한 서비스 제공 불가에 대해
            책임을 지지 않습니다.<br />
            2. 회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을
            지지 않습니다.<br /><br />
            ■ 제 11 조 (준거법 및 관할법원)<br />
            본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련하여
            회사와 회원 간에 발생한 분쟁에 대하여는 회사의 본사 소재지를
            관할하는 법원을 제1심 관할법원으로 합니다.<br /><br />
            부칙<br />
            1. 본 약관은 2025년 7월 16일부터 시행합니다.
          </p>
        </div>
        <button class="agree-btn" @click="agreeService">동의</button>
      </div>
    </div>
    <!-- 개인정보  -->
    <div v-if="showPersonalModal" class="modal-overlay">
      <div class="modal">
        <font-awesome-icon
          icon="fa-solid fa-xmark"
          class="close-icon"
          @click="closePersonalModal"
        />
        <h2>개인정보 수집 및 이용 동의</h2>
        <div class="modal-content">
          <p>
            [서비스명]은 회원가입 및 서비스 제공을 위해 아래와 같이 개인정보를
            수집·이용합니다.<br /><br />
            ━━━━━━━━━━━━━━━━━━━━━━━━━━<br />
            ■ 개인정보의 수집 및 이용 목적<br />
            1. 회원관리: 본인 확인, 회원제 서비스 제공, 불량회원의 부정 이용
            방지<br />
            2. 서비스 제공: 콘텐츠 제공, 맞춤형 서비스 제공<br />
            3. 민원 처리: 문의사항 처리, 공지사항 전달<br />
            ━━━━━━━━━━━━━━━━━━━━━━━━━━<br />
            ■ 수집하는 개인정보 항목<br />
            1. 필수항목: 이름, 아이디, 비밀번호, 이메일 주소, 휴대전화번호<br />
            2. 선택항목: 생년월일, 성별, 주소<br />
            ━━━━━━━━━━━━━━━━━━━━━━━━━━<br />
            ■ 개인정보의 보유 및 이용기간<br />
            - 회원 탈퇴 시 즉시 파기<br />
            - 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관<br />
            &nbsp;&nbsp;&nbsp;&nbsp;(예: 전자상거래법에 의한 계약·청약철회 기록
            5년 등)<br />
            ━━━━━━━━━━━━━━━━━━━━━━━━━━<br />
            ■ 동의 거부 권리 및 불이익<br />
            회원은 개인정보 수집 및 이용에 대한 동의를 거부할 권리가
            있습니다.<br />
            다만, 필수 항목에 대한 동의를 거부할 경우 서비스 가입 및 이용이
            제한될 수 있습니다.
          </p>
        </div>
        <button class="agree-btn" @click="agreePersonal">동의</button>
      </div>
    </div>
    <!-- 회원가입 -->
    <div v-else class="join-container" style="overflow-y: auto">
      <div class="header">
        <font-awesome-icon
          icon="fa-solid fa-chevron-left"
          class="backIcon"
          @click="goBack"
        />
        <h1 class="logo">MoZi</h1>
      </div>
      <div class="title">회원가입</div>
      <p>정보를 입력해주세요</p>
      <form class="join-form">
        <!-- 이름 -->
        <input type="text" v-model="formData.name" placeholder="이름" />
        <!-- 전화번호 -->
        <div class="phone-inputs">
          <input type="text" value="010" readonly />
          <input type="text" v-model="formData.phone2" placeholder="0000" />
          <input type="text" v-model="formData.phone3" placeholder="0000" />
        </div>
        <!-- 아이디 -->
        <div class="id-wrapper">
          <input type="text" v-model="formData.userId" placeholder="아이디" />
          <button type="button" @click="checkUserId">확인</button>
        </div>
        <p class="message" :style="{ color: isIdAvailable ? 'green' : 'red' }">
          {{ idCheckMessage }}
        </p>
        <!-- 비밀번호 -->
        <div class="passwd-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.password"
            placeholder="비밀번호"
          />
          <font-awesome-icon
            :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
            class="toggle-icon"
            @click="showPassword = !showPassword"
          />
        </div>
        <!-- 비밀번호 조건-->
        <ul class="conditions">
          <li :class="{ ok: isLengthOk, fail: !isLengthOk }">
            {{ isLengthOk ? '✔ 10자 이상 입력' : '✖ 10자 이상 입력' }}
          </li>
          <li :class="{ ok: isCompositionOk, fail: !isCompositionOk }">
            {{
              isCompositionOk
                ? '✔ 영문/숫자/특수문자 중 2개 이상 조합'
                : '✖ 영문/숫자/특수문자 중 2개 이상 조합'
            }}
          </li>
          <li :class="{ ok: isNoTripleNumber, fail: !isNoTripleNumber }">
            {{
              isNoTripleNumber
                ? '✔ 동일한 숫자 3개 이상 연속 불가'
                : '✖ 동일한 숫자 3개 이상 연속 불가'
            }}
          </li>
        </ul>
        <!-- 비밀번호 확인 -->
        <div class="passwd-wrapper">
          <input
            :type="showPasswordConfirm ? 'text' : 'password'"
            v-model="formData.confirmPassword"
            placeholder="비밀번호 확인"
          />
          <font-awesome-icon
            :icon="showPasswordConfirm ? ['fas', 'eye-slash'] : ['fas', 'eye']"
            class="toggle-icon"
            @click="showPasswordConfirm = !showPasswordConfirm"
          />
        </div>
        <!-- 비밀번호 일치 여부 메시지 -->
        <p
          v-if="isPasswordMatch || isPasswordMismatch"
          :class="{
            'match-msg': isPasswordMatch,
            'mismatch-msg': isPasswordMismatch,
          }"
        >
          {{
            isPasswordMatch
              ? '✔ 비밀번호가 일치합니다.'
              : '✖ 비밀번호가 일치하지 않습니다.'
          }}
        </p>
        <!-- 이메일 입력 & 인증 버튼 -->
        <div class="email-section">
          <input
            type="email"
            v-model="formData.email"
            placeholder="이메일 입력"
            :readonly="isEmailVerified"
            class="email-input"
          />
          <button
            type="button"
            class="email-btn"
            @click="sendVerificationCode"
            :disabled="resendCooldown > 0 || !isEmailValid"
            :class="
              resendCooldown > 0 || !isEmailValid
                ? 'disabled-btn'
                : 'active-btn'
            "
          >
            {{ resendCooldown > 0 ? '재전송' : '인증' }}
          </button>
        </div>
        <!-- 메시지 & 타이머 -->
        <div class="verify-row">
          <p
            class="verify-message"
            :style="{ color: emailError ? 'red' : 'green' }"
          >
            {{ emailError || emailMessage }}
          </p>
          <p v-if="resendCooldown > 0" class="cooldown-timer">
            {{ Math.floor(resendCooldown / 60) }}:{{
              (resendCooldown % 60).toString().padStart(2, '0')
            }}
            후 재전송
          </p>
        </div>
        <!-- 인증번호 입력 -->
        <div v-if="showVerificationInput" class="verification-section">
          <input
            type="text"
            v-model="formData.verificationCode"
            placeholder="인증번호 입력"
            maxlength="6"
            class="verification-input"
          />
          <button
            type="button"
            class="confirm-btn"
            @click="verifyCode"
            :disabled="!isVerificationCodeSixDigits"
            :class="isVerificationCodeSixDigits ? 'active-btn' : 'disabled-btn'"
          >
            확인
          </button>
        </div>
        <!-- 인증 코드 입력 -->
        <!-- <div v-if="verifyStep === 1" class="verify-section">
          <label>인증 코드</label>
          <div class="input-row">
            <input v-model="verificationCode" placeholder="인증 코드 입력" class="verification-input" />
            <button @click="verifyCode" class="confirm-btn">확인</button>
          </div>
          <div v-if="verificationError" class="error-text">{{ verificationError }}</div>
          <div v-if="verificationSuccess" class="success-text">✅ 인증이 완료되었습니다.</div>
        </div> -->
        <!-- 생년월일 -->
        <input
          type="text"
          v-model="formData.birth"
          placeholder="생년월일(6자리)"
        />
        <!-- 회원가입 버튼 -->
        <button
          type="button"
          :class="{
            'active-button': isFormValid,
            'inactive-button': !isFormValid,
          }"
          @click="submitJoin"
        >
          회원가입
        </button>
      </form>
    </div>
  </div>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.page-wrapper.no-scroll {
  height: 100vh;
  overflow: hidden;
}

#page {
  display: flex;
  justify-content: center; /* 가로 중앙 */
  align-items: flex-start; /* 세로는 위쪽 정렬 */
  height: 852px;
  box-sizing: border-box;
  overflow: hidden;
}

.terms-screen,
.join-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: white; /* 배경 설정 꼭 해줘야 겹쳐 보이지 않음 */
}

.terms-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 340px;
  background: white;
  box-sizing: border-box;
}

/* 헤더 중앙 */
.header {
  position: relative;
  display: flex;
  justify-content: center; /* 로고는 가운데 */
  align-items: center; /* 세로 중앙 */
  width: 100%;
  height: 60px;
  margin-top: 5rem;
}

.backIcon {
  position: absolute;
  left: 0px;
  top: 60%;
  transform: translateY(-50%);
  font-size: 30px;
  color: black;
  cursor: pointer;
}

/* 로고 중앙 */
.logo {
  font-size: 48px;
  color: #36c18c;
  margin: 0;
}

/* 타이틀 */
.title {
  font-size: 24px;
  color: #776e6e;
  text-align: center;
  margin-top: 1rem;
}

/* 약관 영역 */
.terms-wrapper {
  padding: 3rem 1rem;
  width: 100%;
  box-sizing: border-box;
  margin-top: 3rem;
  height: 600px;
}

/* 체크박스 */
.checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  cursor: pointer;
  font-size: 16px;
  position: relative;
}

.checkbox input[type='checkbox'] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox span::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 0.75rem;
  border: 2px solid #ccc;
  border-radius: 50%;
  vertical-align: middle;
}

.checkbox input:checked + span::before {
  background-color: #36c18c;
  border-color: #36c18c;
}

.checkbox input:checked + span::after {
  content: '✔';
  position: absolute;
  left: 6px;
  top: 1px;
  width: 10px;
  height: 10px;
  color: white;
  border-radius: 50%;
}
.checkbox-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.arrow {
  cursor: pointer;
  font-size: 18px;
  position: relative;
  top: -10px;
  z-index: 10;

  .close-icon {
    z-index: 1005;
  }
}
/* 구분선 */
.checkbox-wrapper:first-of-type {
  border-top: 1px solid #ddd;
  margin-top: 1rem;
  padding-top: 1rem;
}

/* 버튼 */
button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #b0b8c1;
  background-color: #f2f4f6;
}

button.active {
  background-color: #36c18c;
  color: #fff;
  cursor: pointer;
  margin-top: 0;
}

button:disabled {
  background-color: #f2f4f6;
  color: #b0b8c1;
  cursor: not-allowed;
  margin-top: 0;
}

/* 모달 배경 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 약관 더보기 모달 */
.modal {
  position: relative;
  background: white;
  color: black;
  padding: 2rem;
  width: 90%;

  max-height: 80vh;
  overflow-y: auto;
  border-radius: 10px;
  z-index: 1001;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-content {
  max-height: 700px;
  overflow-y: auto;
  margin: 2rem 0;
}

h2 {
  margin-top: 2rem;
  font-size: 22px;
  text-align: center;
}

.agree-btn {
  width: 100%;
  background: #36c18c;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 0;
}
.close-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 20px;
  cursor: pointer;
}

.join-wrapper {
  width: 100%;
  height: auto;
  overflow-y: visible; /* 스크롤 허용 */
}

.join-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 340px;
  margin: 0 auto;
  padding-bottom: 100px;
}

.title {
  font-size: 24px;
  margin-top: 1rem;
  text-align: center;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  margin-top: 1rem;
}

.join-form input {
  font-size: 16px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #d9d9d9;
  width: 100%;
  box-sizing: border-box;
}

.phone-inputs {
  display: flex;
  gap: 8px;
}

.id-wrapper,
.email-wrapper,
.verify-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}
.id-wrapper input,
.email-wrapper input,
.verify-wrapper input {
  flex: 1; /* 입력창이 남은 공간을 전부 차지 */
  height: 40px;
  padding: 0 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
}

.id-wrapper button,
.email-wrapper button,
.verify-wrapper button {
  flex-shrink: 0; /* 버튼이 줄어들지 않도록 */
  width: 60px; /* 버튼 크기 고정 */
  height: 40px;
  line-height: 40px;
  padding: 0;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  background-color: #36c18c;
  color: white;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}
/* 공통 버튼 스타일 */
.confirm-btn {
  width: 80px; /* ✅ 버튼 너비 고정 */
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap; /* ✅ 줄바꿈 방지 */
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.email-btn {
  width: 72px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: normal; /* line-height 고정 대신 normal */
}

.email-section,
.verification-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.email-input,
.verification-input {
  flex: 1; /* 버튼 제외한 나머지 너비 차지 */
  height: 36px; /* 버튼과 높이 맞추기 */
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.message {
  font-size: 12px;
  color: #777;
  margin-top: -5px;
  margin-bottom: 4px;
  padding-left: 10px;
}

.passwd-wrapper {
  position: relative;
}

.toggle-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #757575;
  font-size: 18px;
}
.active-button {
  background-color: #36c18c;
  color: #ffffff;
  font-size: 16px;
  padding: 0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  height: 48px;
}
.active-btn {
  background-color: #36c18c;
  color: #ffffff;
  font-size: 16px;
  padding: 0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.inactive-btn {
  background-color: #f2f4f6;
  color: #b0b8c1;
  cursor: not-allowed;
}
.warning {
  color: red;
  font-size: 12px;
  margin-top: -6px;
  margin-bottom: 4px;
}
.join-btn {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  margin-top: 8px;
}
.conditions {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  text-align: left;
}

.conditions li {
  margin-bottom: 3px;
  padding-left: 10px;
}

.conditions .ok {
  color: green;
}

.conditions .fail {
  color: red;
}
.cooldown-timer {
  font-size: 12px;
  white-space: nowrap;
}
.email-wrapper button {
  width: 60px;
  height: 40px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.email-section {
  display: flex;
  align-items: center;
  gap: 10px; /* input과 버튼 사이 간격 */
}

.verification-section {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.email-input {
  flex: 1;
  height: 40px;
}

.verification-row {
  display: flex;
  align-items: center; /* 수직 가운데 정렬 */
  gap: 8px;
  margin-top: 8px;
}

.verification-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.confirm-btn {
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  /* 수직 + 수평 중앙 정렬 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-btn {
  background-color: #36c18c;
  color: white;
}

.disabled-btn {
  background-color: #f2f4f6;
  color: #b0b8c1;
  cursor: not-allowed;
}

.match-msg {
  color: green;
  font-size: 12px;
  margin-top: -5px;
  margin-bottom: 6px;
  padding-left: 10px;
}

.mismatch-msg {
  color: red;
  font-size: 12px;
  margin-top: -5px;
  margin-bottom: 6px;
  padding-left: 10px;
}
.verify-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-top: -5px;
  margin-bottom: -4px;
  padding-left: 10px;
}

.verify-message {
  font-size: 12px;
}
</style>
