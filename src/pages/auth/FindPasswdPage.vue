<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// faEye/faEyeSlash는 안 쓰면 삭제해도 됨
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { authAPI } from '@/api/authApi';

library.add(faChevronLeft);

const router = useRouter();

const userId = ref('');
const email = ref('');
const errors = reactive<{
  userId: string;
  email: string;
  verificationCode: string;
}>({
  userId: '',
  email: '',
  verificationCode: '',
});
const loading = ref(false);
const submitError = ref('');
const verificationCode = ref('');

const sentCode = ref(false);
const isEmailVerified = ref(false);

const cooldownSeconds = ref(0);
let cooldownTimer: number | null = null;
const lastSentEmail = ref('');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = computed(() => emailRe.test(email.value));

const cooldownText = computed(() => {
  const m = Math.floor(cooldownSeconds.value / 60)
    .toString()
    .padStart(2, '0');
  const s = (cooldownSeconds.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

function startCooldown(seconds = 300) {
  clearCooldown();
  cooldownSeconds.value = seconds;
  cooldownTimer = window.setInterval(() => {
    cooldownSeconds.value -= 1;
    if (cooldownSeconds.value <= 0) clearCooldown();
  }, 1000);
}
function clearCooldown() {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  cooldownSeconds.value = 0;
}

onUnmounted(() => clearCooldown());

watch([email, userId], () => {
  clearCooldown();
  sentCode.value = false;
  isEmailVerified.value = false;
  errors.email = '';
  errors.userId = '';
});

function goBack() {
  router.back();
}

function validateUserId() {
  errors.userId = userId.value.trim()
    ? ''
    : '가입 시 등록한 아이디를 입력해주세요';
}
function validateEmail() {
  if (!email.value.trim())
    errors.email = '가입 시 등록한 이메일을 입력해 주세요';
  else if (!emailRe.test(email.value))
    errors.email = '유효하지 않은 이메일입니다';
  else errors.email = '';
}

async function sendVerificationCode() {
  if (!userId.value.trim()) {
    errors.userId = '아이디를 입력해주세요';
    return;
  }
  if (!isEmailValid.value) {
    validateEmail();
    return;
  }
  if (cooldownSeconds.value > 0) return;

  loading.value = true;
  try {
    const response = await authAPI.sendPasswordResetCode(email.value);
    if (response?.isSuccess === true || response?.code === 200) {
      sentCode.value = true;
      errors.email = '';
      lastSentEmail.value = email.value;
      startCooldown(300);
    } else {
      errors.email =
        response?.message ||
        '인증 코드 발송에 실패했습니다. 다시 시도해주세요.';
    }
  } catch (err: any) {
    console.error('이메일 발송 실패:', err);
    errors.email =
      err?.response?.data?.message ||
      '인증 코드 발송에 실패했습니다. 다시 시도해주세요.';
    sentCode.value = false;
    isEmailVerified.value = false;
  } finally {
    loading.value = false;
  }
}

async function verifyCode() {
  if (!verificationCode.value.trim()) {
    errors.verificationCode = '인증 코드를 입력해주세요.';
    return;
  }
  try {
    const response = await authAPI.verifyPasswordResetCode({
      email: email.value,
      verificationCode: verificationCode.value,
    });

    if (response.isSuccess || response.code === 200) {
      isEmailVerified.value = true;
      errors.verificationCode = '';

      const verifyRes = await authAPI.verifyAccount({
        loginId: userId.value,
        email: email.value,
      });

      const token = verifyRes.result ?? null;
      if (!token) {
        isEmailVerified.value = false;
        submitError.value =
          verifyRes.message || '아이디/이메일이 일치하지 않습니다.';
        return;
      }
      await router.push({ name: 'ResetPasswdPage', query: { token } });
    } else {
      isEmailVerified.value = false;
      errors.verificationCode =
        response.message || '인증 코드가 일치하지 않습니다.';
    }
  } catch (err: any) {
    console.error('이메일 인증 실패:', err);
    isEmailVerified.value = false;
    errors.verificationCode =
      err?.response?.data?.message || '인증 코드가 일치하지 않습니다.';
  }
}

const canSubmit = computed(
  () =>
    userId.value.trim() &&
    email.value.trim() &&
    !errors.userId &&
    !errors.email &&
    isEmailVerified.value
);

async function handleSubmit() {
  validateUserId();
  validateEmail();
  submitError.value = '';
  if (!canSubmit.value) return;

  loading.value = true;
  try {
    const response = await authAPI.verifyAccount({
      loginId: userId.value,
      email: email.value,
    });
    if (response.isSuccess || response.code === 200 || response.result) {
      const token = response.result;
      if (!token) {
        submitError.value =
          response.message || '아이디 또는 이메일이 일치하지 않습니다';
        return;
      }
      await router.push({ name: 'ResetPasswdPage', query: { token } });
    } else {
      submitError.value =
        response.message || '아이디 또는 이메일이 일치하지 않습니다';
    }
  } catch (err: any) {
    console.error('계정 확인 실패:', err);
    submitError.value =
      err?.response?.data?.message ||
      '요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="header">
    <FontAwesomeIcon
      :icon="['fas', 'chevron-left']"
      class="backIcon"
      @click="goBack"
    />
    <h1 class="logo">MoZi</h1>
  </div>
  <div class="title">비밀번호 찾기</div>

  <div class="form-wrapper">
    <form @submit.prevent="handleSubmit" class="form-container">
      <section class="writeID section-field">
        <label> 아이디</label>
        <input
          name="userId"
          type="text"
          v-model="userId"
          placeholder="아이디를 입력하세요"
          @blur="validateUserId"
        />
        <span v-if="errors.userId" class="error">{{ errors.userId }}</span>
      </section>

      <div class="certification">
        <!-- 이메일 -->
        <section class="section-field">
          <label for="email">이메일</label>

          <div class="email-row">
            <input
              id="email"
              name="email"
              type="email"
              v-model="email"
              @input="
                isEmailVerified = false;
                sentCode = false;
                errors.email = '';
              "
              placeholder="이메일을 입력하세요"
              @blur="validateEmail"
              :readonly="isEmailVerified"
            />
            <button
              type="button"
              class="btn"
              @click="sendVerificationCode"
              :disabled="
                loading ||
                !userId.trim() ||
                !isEmailValid ||
                isEmailVerified ||
                cooldownSeconds > 0
              "
            >
              {{ sentCode ? '재전송' : '인증' }}
            </button>
          </div>

          <div
            class="verify-row"
            v-if="errors.email || sentCode || cooldownSeconds > 0"
          >
            <p
              class="msg"
              :class="{
                error: !!errors.email,
                success: !errors.email && sentCode,
              }"
            >
              {{
                errors.email ||
                (sentCode ? '인증 코드가 이메일로 전송되었습니다.' : '')
              }}
            </p>

            <span v-if="cooldownSeconds > 0" class="cooldown">
              {{ cooldownText }} 후 재전송
            </span>
          </div>
        </section>

        <!-- 인증 코드 -->
        <section v-if="sentCode" class="section-field">
          <label for="code">인증 코드</label>
          <div class="row-append">
            <input
              id="code"
              name="verificationCode"
              type="text"
              v-model="verificationCode"
              placeholder="인증 코드를 입력하세요"
              maxlength="6"
            />
            <button
              type="button"
              class="btn"
              @click="verifyCode"
              :disabled="verificationCode.length !== 6"
            >
              확인
            </button>
          </div>
          <p v-if="errors.verificationCode" class="msg error">
            {{ errors.verificationCode }}
          </p>
          <p v-if="isEmailVerified" class="msg success">
            ✔ 이메일 인증이 완료되었습니다.
          </p>
        </section>
      </div>

      <button
        type="submit"
        :disabled="!canSubmit || loading"
        :class="{
          'active-btn': canSubmit && !loading,
          'inactive-btn': !canSubmit || loading,
        }"
      >
        {{ loading ? '처리중...' : '확인' }}
      </button>

      <div v-if="loading" class="loading-message">요청중입니다...</div>
      <div v-if="submitError" class="error submit-error">{{ submitError }}</div>
    </form>
  </div>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  overflow-x: hidden;
}

#page {
  display: flex;
  justify-content: center; /* 가로 중앙 */
  align-items: flex-start; /* 세로는 위쪽 정렬 */
  min-height: 850px; /* 세로 스크롤 방지 */
  padding-top: 1rem; /* 화면 상단에서 여백 */
  box-sizing: border-box;
}
.header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  margin-top: 5rem;
}

.logo {
  font-size: 48px;
  color: #36c18c;
  margin: 0;
  font-weight: bold;
}

.backIcon {
  position: absolute;
  left: 10px;
  top: 60%;
  transform: translateY(-50%);
  font-size: 30px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.backIcon:hover {
  color: #36c18c;
}

.title {
  font-size: 24px;
  color: #776e6e;
  text-align: center;
  margin-top: 1rem;
  font-weight: 600;
}
/* 폼 외부구조 */
.form-wrapper {
  width: 100%;
  max-width: 100%;
  align-items: center;
  height: 30vh;
  margin-top: 4rem;
}
.form-container {
  max-width: 300px;
  width: 288px;
  height: 300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  font-size: 20px;
  border-radius: 5px;
}
.form-container input {
  height: 48px;
  width: 100%;
  padding: 0.75rem;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-container input:focus {
  outline: none;
  background-color: #fff;
}
.form-container .section-field {
  margin-bottom: 1rem;
}
input {
  font-size: 16px; /* 동일한 폰트 크기 */
  padding: 0.75rem; /* 동일한 내측 여백 */
  box-sizing: border-box; /* 패딩, 보더 포함 고정 높이 유지 */
  height: 48px; /* 통일된 높이 고정 */
  background-color: none;
  margin-bottom: 0px;
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
}
input::placeholder {
  font-size: 16px;
  font-family: inherit;
}
/* 이메일 입력창  */
.writeEmail {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-container input {
  justify-content: center;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-container input {
  width: 100%;
}
/* 인증코드 입력 */
.verificationCode {
  position: relative;
  margin-top: 0.5rem;
}

.error {
  color: red;
  font-size: 12px;
  margin-top: 1rem;
  text-align: center;
}
.error-message {
  visibility: hidden;
  display: block;
  min-height: 1.2em;
  margin-top: -0.3rem;
  color: red;
  font-size: 12px;
}
.error-message.visible {
  visibility: visible;
}
.form-container button {
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  color: whites;
}
.active-btn {
  cursor: pointer;
  background-color: #36c18c;
  color: #fff;
  margin-top: 30px;
}
.active-btn:hover {
  background-color: #2fa876;
}
.inactive-btn {
  background-color: #ccc;
  cursor: not-allowed;
  pointer-events: none;
  margin-top: 30px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  pointer-events: none;
}
.section-field {
  margin-top: 2rem;
}
.section-field label {
  display: block;
  margin-bottom: 0px;
  font-weight: 600;
}
.section-field label > input {
  margin-top: 0.5rem;
}

/* 인증 상태 메시지 */
.verification-success {
  color: #28a745;
  font-size: 14px;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  padding: 8px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}

/* 성공 메시지 */
.success-message {
  color: #28a745;
  font-size: 12px;
  margin-top: 0.5rem;
}

.certification {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.certification section {
  position: relative;
  align-items: center;
  margin-bottom: 0.5rem;
}

/* 인증 메시지 */
.status-msg {
  font-size: 12px;
  margin-top: 4px;
  padding-left: 4px;
}
.status-msg.success {
  color: green;
}
.status-msg.error {
  color: red;
}

.loading-message {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 1rem;
}

.submit-error {
  text-align: center;
  margin-top: 1rem;
}

/* 컨테이너 폭 살짝 키우면 회원가입 화면과 유사 */
.form-container {
  max-width: 340px;
}

/* 공통 섹션 */
.section-field {
  margin-bottom: 1.5rem;
  margin-top: 1rem;
}
.section-field label {
  font-size: 16px;
  display: block;
  margin-bottom: 0.5rem;
}

/* 버튼 + 쿨다운 문구 세로 배치 */
.btn-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 버튼/문구를 오른쪽 정렬 */
}

/* 쿨다운 문구 스타일 */
.btn-col .cooldown {
  margin-top: 4px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
}

.section-field .row input {
  flex: 1;
  height: 48px;
  padding: 0 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.section-field .row .btn {
  height: 48px;
  padding: 0 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background: #36c18c;
  color: #fff;
  white-space: nowrap;
  cursor: pointer;
}
.section-field .row .btn:disabled {
  background: #f2f4f6; /* 비활성 배경 */
  color: #b0b8c1; /* 비활성 텍스트 */
  cursor: not-allowed;
}

.section-field .msg,
.section-field .error {
  /* userId 에러 span도 포함 */
  text-align: left; /* 중앙정렬 해제 */
  padding-left: 6px; /* 살짝 들여쓰기 */
  margin-top: 4px;
  display: block; /* span도 줄바꿈되도록 */
  font-size: 12px;
}
.msg.error {
  color: red;
}
.msg.success {
  color: #28a745;
}
.writeID {
  margin-bottom: 0.75rem; /* 기존 값보다 줄임 (약 12px) */
}
/* 인풋 + 버튼 한 줄 */
.email-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.email-row input {
  flex: 1;
  height: 48px;
  padding: 0 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.email-row .btn {
  height: 48px;
  min-width: 84px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  background: #36c18c;
  color: #fff;
  white-space: nowrap;
  cursor: pointer;
}
.email-row .btn:disabled {
  background: #f2f4f6;
  color: #b0b8c1;
  cursor: not-allowed;
}

/* 메시지 + 쿨다운을 한 줄로 좌/우 배치 */
.verify-row {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 왼쪽: 메시지, 오른쪽: 타이머 */
  gap: 8px;
  margin-top: 6px;
}
.verify-row .msg {
  margin: 0; /* 기존 msg 여백 제거 */
  padding-left: 0; /* 인풋 기준 들여쓰기 제거 (행 내부 정렬 위해) */
  font-size: 12px;
}
.verify-row .msg.success {
  color: #28a745;
}
.verify-row .msg.error {
  color: red;
}
.verify-row .cooldown {
  font-size: 12px;
  color: #777;
  white-space: nowrap;
}
/* 인증코드 입력 줄 인라인 정렬 */
.row-append {
  display: flex;
  align-items: center;
  gap: 12px;
}
.row-append input {
  flex: 1;
  height: 48px;
  padding: 0 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.row-append .btn {
  height: 48px;
  min-width: 84px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  background: #36c18c;
  color: #fff;
  white-space: nowrap;
  cursor: pointer;
}
.row-append .btn:disabled {
  background: #f2f4f6;
  color: #b0b8c1;
  cursor: not-allowed;
}
</style>
