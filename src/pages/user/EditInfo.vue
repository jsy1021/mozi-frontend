<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { onUnmounted } from 'vue';

const router = useRouter();
const form = ref({
  username: '',
  loginId: '',
  password: '',
  email: '',
  phoneNumber: '',
});

const loading = ref(false);
const error = ref('');

const emailVerificationCode = ref('');
const sentCode = ref('');
const isEmailVerified = ref(false);
const emailError = ref('');
const verificationMessage = ref('');
const verifyStep = ref(0);
const verificationCode = ref('');
const verificationError = ref('');

// 상태 변수
const showPassword = ref(false);

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

const passwordError = ref('');

const resendCooldown = ref(0);
let countdownTimer = null;

function validatePassword() {
  if (!form.value.password) {
    passwordError.value = '';
    return;
  }

  if (!isLengthOk.value || !isCompositionOk.value || !isNoTripleNumber.value) {
    passwordError.value = '비밀번호 조건을 확인해주세요.';
  } else {
    passwordError.value = '';
  }
}

// 비밀번호 조건
const isLengthOk = computed(() => form.value.password.length >= 10);

const isCompositionOk = computed(() => {
  const pwd = form.value.password;
  let count = 0;
  if (/[a-zA-Z]/.test(pwd)) count++;
  if (/\d/.test(pwd)) count++;
  if (/[\W_]/.test(pwd)) count++;
  return count >= 2;
});

const isNoTripleNumber = computed(() => !/(\d)\1\1/.test(form.value.password));

// 이메일 인증 요청
async function sendVerificationCode() {
  if (!form.value.email || !form.value.email.includes('@')) {
    emailError.value = '올바른 이메일을 입력해주세요.';
    return;
  }

  try {
    emailError.value = '';
    verificationMessage.value = '';

    const res = await axios.post('/api/mypage/send-email-code', null, {
      params: { email: form.value.email },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    verificationMessage.value = '인증번호가 이메일로 전송되었습니다.';
    verifyStep.value = 1;
    emailError.value = '';

    startCooldown();
  } catch (err) {
    console.error('이메일 인증 요청 실패:', err);

    if (err.response?.data?.message) {
      emailError.value = err.response.data.message;
    } else if (err.response?.data && typeof err.response.data === 'string') {
      emailError.value = err.response.data;
    } else if (err.response?.status === 409) {
      emailError.value = '이미 사용 중인 이메일입니다.';
    } else if (err.response?.status === 400) {
      emailError.value = '잘못된 이메일 형식입니다.';
    } else {
      emailError.value = '이메일 인증 요청에 실패했습니다.';
    }

    verificationMessage.value = '';
  }
}

function startCooldown() {
  resendCooldown.value = 300; // 5분 = 300초

  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    resendCooldown.value -= 1;

    if (resendCooldown.value <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});

// 인증번호 확인
async function verifyCode() {
  if (!verificationCode.value.trim()) {
    emailError.value = '인증번호를 입력해주세요.';
    return;
  }

  try {
    emailError.value = '';
    verificationMessage.value = '';

    const res = await axios.post(
      '/api/mypage/verify-email-code',
      {
        email: form.value.email,
        verificationCode: verificationCode.value,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );

    if (res.data.isSuccess) {
      isEmailVerified.value = true;
      verificationMessage.value = '이메일 인증이 완료되었습니다.';
      emailError.value = '';
    } else {
      emailError.value = res.data.message || '인증번호가 일치하지 않습니다.';
    }
  } catch (err) {
    console.error('인증번호 확인 실패:', err);

    if (err.response?.data?.message) {
      emailError.value = err.response.data.message;
    } else if (err.response?.data && typeof err.response.data === 'string') {
      emailError.value = err.response.data;
    } else if (err.response?.status === 400) {
      emailError.value = '인증번호가 올바르지 않습니다.';
    } else if (err.response?.status === 408) {
      emailError.value = '인증번호가 만료되었습니다. 다시 요청해주세요.';
    } else {
      emailError.value = '인증번호 확인 중 오류가 발생했습니다.';
    }

    verificationMessage.value = '';
  }
}

// GET /api/mypage/edit → 기존 정보 불러오기
onMounted(async () => {
  try {
    const res = await axios.get('/api/mypage/edit', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    const data = res.data.result;

    form.value.username = data.username;
    form.value.loginId = data.login_id;
    form.value.email = '';
    form.value.phoneNumber = data.phone_number;
  } catch (err) {
    error.value = '사용자 정보를 불러오는 데 실패했습니다.';
  }
});

// PUT /api/mypage/edit → 저장
async function onSave() {
  try {
    const updatePayload = {};

    // 비밀번호 변경 (새로 입력된 경우만)
    if (form.value.password && form.value.password.trim()) {
      if (
        !isLengthOk.value ||
        !isCompositionOk.value ||
        !isNoTripleNumber.value
      ) {
        error.value = '비밀번호 조건을 만족해주세요.';
        return;
      }
      updatePayload.password = form.value.password;
    }

    // 이메일 변경 (입력된 경우만)
    if (form.value.email && form.value.email.trim()) {
      if (!isEmailVerified.value) {
        error.value = '이메일을 변경하려면 먼저 인증을 완료해주세요.';
        return;
      }
      updatePayload.email = form.value.email;
    }

    if (Object.keys(updatePayload).length === 0) {
      error.value = '변경된 항목이 없습니다.';
      return;
    }

    loading.value = true;
    error.value = '';

    const response = await axios.put('/api/mypage/edit', updatePayload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    console.log('서버 응답:', response.data);

    // 서버 응답이 성공이면
    if (response.data.isSuccess === true) {
      alert('정보가 수정되었습니다.');

      // 라우터 이동을 별도로 처리
      try {
        await router.push('/user/mypage');
      } catch (routerErr) {
        // 라우터 에러가 발생해도 강제로 페이지 이동
        console.log('라우터 에러 발생, 강제 이동:', routerErr);
        window.location.href = '/user/mypage';
      }
      return;
    } else {
      error.value = response.data.message || '정보 저장에 실패했습니다.';
    }
  } catch (err) {
    console.error('서버 요청 에러:', err);

    // 서버 응답이 성공인지 확인
    if (err.response?.data?.isSuccess === true) {
      alert('정보가 수정되었습니다.');
      window.location.href = '/user/mypage';
      return;
    }

    // 실제 서버 에러인 경우에만 에러 표시
    error.value = err.response?.data?.message || '정보 저장에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container form-edit">
    <h2>기본 정보 수정</h2>

    <label>이름</label>
    <div class="readonly-field">{{ form.username }}</div>

    <label>아이디</label>
    <div class="readonly-field">{{ form.loginId }}</div>

    <label>새 비밀번호</label>
    <div class="input-wrapper">
      <input
        :type="showPassword ? 'text' : 'password'"
        v-model="form.password"
        placeholder="변경할 비밀번호를 입력하세요 (선택사항)"
        @blur="validatePassword"
      />
      <FontAwesomeIcon
        :icon="showPassword ? faEyeSlash : faEye"
        @click="toggleShowPassword"
        class="eye-icon"
      />
    </div>
    <div v-if="passwordError" class="error-msg">{{ passwordError }}</div>

    <!-- 비밀번호 조건 (비밀번호 입력 시에만 표시) -->
    <ul v-if="form.password" class="password-conditions">
      <li :class="{ fail: !isLengthOk }">
        {{ isLengthOk ? '✔ 10자 이상 입력' : '✖ 10자 이상 입력' }}
      </li>
      <li :class="{ fail: !isCompositionOk }">
        {{
          isCompositionOk
            ? '✔ 영문/숫자/특수문자 중 2개 이상 조합'
            : '✖ 영문/숫자/특수문자 중 2개 이상 조합'
        }}
      </li>
      <li :class="{ fail: !isNoTripleNumber }">
        {{
          isNoTripleNumber
            ? '✔ 동일한 숫자 3개 이상 연속 불가'
            : '✖ 동일한 숫자 3개 이상 연속 불가'
        }}
      </li>
    </ul>

    <label>이메일</label>
    <div class="email-row">
      <input
        v-model="form.email"
        :readonly="isEmailVerified"
        placeholder="이메일 입력"
        class="email-input"
      />
      <button
        class="email-btn"
        @click="sendVerificationCode"
        :disabled="resendCooldown > 0 || isEmailVerified"
      >
        {{
          isEmailVerified ? '인증완료' : verifyStep === 0 ? '인증' : '재전송'
        }}
      </button>
    </div>

    <!-- 메시지 표시 -->
    <div v-if="verificationMessage" class="success-msg">
      {{ verificationMessage }}
    </div>
    <div v-if="emailError" class="error-msg">{{ emailError }}</div>

    <div v-if="verifyStep === 1 && !isEmailVerified" class="verify-section">
      <!-- 남은 시간 텍스트 표시 -->
      <div v-if="resendCooldown > 0" class="cooldown-text">
        {{ Math.floor(resendCooldown / 60) }}:{{
          (resendCooldown % 60).toString().padStart(2, '0')
        }}
        뒤에 재시도 가능
      </div>

      <label>인증번호</label>
      <div class="input-row">
        <input
          v-model="verificationCode"
          placeholder="인증번호 6자리 입력"
          class="verification-input"
          maxlength="6"
        />
        <button @click="verifyCode" class="confirm-btn">확인</button>
      </div>
    </div>

    <!-- 전화번호 (읽기 전용) -->
    <label>전화번호</label>
    <div class="readonly-field">{{ form.phoneNumber }}</div>

    <!-- 에러 메시지 -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- 저장 버튼 -->
    <div class="button-wrapper">
      <button :disabled="loading" @click="onSave">
        {{ loading ? '저장 중...' : '저장' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.container.form-edit {
  max-width: 400px;
  margin: 40px auto;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

label {
  display: block;
  margin-top: 16px;
  font-weight: 500;
  font-size: 14px;
}

.readonly-field {
  margin-top: 4px;
  font-size: 15px;
  font-weight: 500;
  padding: 8px;
  height: 40px;
  line-height: 24px;
  background: #f4f4f4;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
}

input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 8px 36px 8px 8px;
  box-sizing: border-box;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.eye-icon {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
  font-size: 18px;
}

/* 비밀번호 조건 메시지 스타일 */
.password-conditions {
  list-style: none;
  padding-left: 8px;
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
  text-align: left;
}

.password-conditions li {
  margin-top: 2px;
  color: green;
}

.password-conditions li.fail {
  color: red;
}

/* 이메일 인증 버튼 영역 */
.email-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.email-input {
  flex: 1;
  height: 40px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 0;
}

.email-btn {
  width: 70px;
  height: 40px;
  font-size: 13px;
  font-weight: 600;
  background-color: #36c18c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  padding: 0;
  margin-top: 0;
  flex-shrink: 0;
}

.email-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 인증번호 확인 영역 */
.input-row {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.verification-input {
  flex: 1;
  height: 40px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 0;
}

.confirm-btn {
  width: 70px;
  height: 40px;
  font-size: 13px;
  font-weight: 600;
  background-color: #36c18c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0;
  flex-shrink: 0;
}

/* 인증번호 영역 전체 스타일 */
.verify-section {
  margin-top: 12px;
}

.verify-section label {
  margin-top: 12px;
}

/* 타이머 텍스트 */
.cooldown-text {
  font-size: 13px;
  color: #36c18c;
  margin-bottom: 8px;
  margin-top: 8px;
}

/* flex 컨테이너 내의 input은 margin 제거 */
.email-row input,
.input-row input {
  margin-top: 0;
}

/* 메시지 스타일 */
.error-msg {
  color: red;
  font-size: 13px;
  margin-top: 4px;
}

.success-msg {
  color: #36c18c;
  font-size: 13px;
  margin-top: 4px;
}

/* 저장 버튼 */
.button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.button-wrapper button {
  width: 100%;
  max-width: 400px;
  padding: 12px 0;
  background: #36c18c;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-top: 0;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
