<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();
const form = ref({ username: '', loginId: '', password: '', email: '', phoneNumber: '' });
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
    const res = await axios.post('/api/email/send', { email: form.value.email });
    sentCode.value = res.data.result; // 서버에서 전송된 코드 (실제 앱에서는 사용자에게만 이메일 발송)
    verificationMessage.value = '인증 코드가 이메일로 전송되었습니다.';
    verifyStep.value = 1; // 인증 단계 전환
    emailError.value = '';
  } catch (err) {
    emailError.value = '이메일 인증 요청 실패';
  }
}

// 인증코드 확인
async function verifyCode() {
  if (!verificationCode.value.trim()) {
    emailError.value = '인증 코드를 입력해주세요.';
    return;
  }

  try {
    const res = await axios.post('/api/email/verify', {
      email: form.value.email,
      code: verificationCode.value,
    });

    if (res.data.isSuccess) {
      isEmailVerified.value = true;
      verificationMessage.value = '이메일 인증이 완료되었습니다.';
      emailError.value = '';
    } else {
      emailError.value = '인증 코드가 일치하지 않습니다.';
    }
  } catch (err) {
    emailError.value = '이메일 인증 확인 중 오류 발생';
  }
}

// GET /api/mypage/edit → 기존 정보 불러오기
onMounted(async () => {
  try {
    const res = await axios.get('/api/mypage/edit', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    const data = res.data.result;

    form.value.username = data.username;
    form.value.loginId = data.loginId;
    form.value.email = data.email;
    form.value.phoneNumber = data.phoneNumber;
    // password는 사용자가 직접 입력
  } catch (err) {
    error.value = '사용자 정보를 불러오는 데 실패했습니다.';
  }
});

// PUT /api/mypage/edit → 저장
async function onSave() {
  const updatePayload = {};
  if (form.value.password) updatePayload.password = form.value.password;
  if (form.value.email) updatePayload.email = form.value.email;
  if (form.value.phoneNumber) updatePayload.phoneNumber = form.value.phoneNumber;

  if (Object.keys(updatePayload).length === 0) {
    error.value = '변경된 항목이 없습니다.';
    return;
  }

  try {
    loading.value = true;
    await axios.put('/api/mypage/edit', updatePayload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    alert('정보가 수정되었습니다.');
    router.push({ name: 'myPage', query: { updated: 'true' } });
  } catch (err) {
    error.value = '정보 저장에 실패했습니다.';
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
        placeholder="비밀번호 입력"
        @blur="validatePassword" />
      <FontAwesomeIcon :icon="showPassword ? faEyeSlash : faEye" @click="toggleShowPassword" class="eye-icon" />
    </div>
    <div v-if="passwordError" class="error-msg">{{ passwordError }}</div>

    <!-- 비밀번호 조건-->
    <ul class="password-conditions">
      <li :class="{ fail: !isLengthOk }">
        {{ isLengthOk ? '✔ 10자 이상 입력' : '✖ 10자 이상 입력' }}
      </li>
      <li :class="{ fail: !isCompositionOk }">
        {{ isCompositionOk ? '✔ 영문/숫자/특수문자 중 2개 이상 조합' : '✖ 영문/숫자/특수문자 중 2개 이상 조합' }}
      </li>
      <li :class="{ fail: !isNoTripleNumber }">
        {{ isNoTripleNumber ? '✔ 동일한 숫자 3개 이상 연속 불가' : '✖ 동일한 숫자 3개 이상 연속 불가' }}
      </li>
    </ul>

    <label>이메일</label>
    <div class="email-row">
      <input v-model="form.email" :readonly="isEmailVerified" placeholder="이메일 입력" class="email-input" />
      <button class="email-btn" @click="sendVerificationCode" v-if="verifyStep === 0">인증</button>
    </div>

    <div v-if="verifyStep === 1">
      <label>인증 코드</label>
      <div class="input-row">
        <input v-model="verificationCode" placeholder="인증 코드 입력" />
        <button @click="verifyCode">확인</button>
      </div>
      <div v-if="verificationError" class="error-text">{{ verificationError }}</div>
    </div>

    <label>전화번호</label>
    <input v-model="form.phoneNumber" placeholder="전화번호 입력" />

    <div v-if="error" class="error-msg">{{ error }}</div>

    <button :disabled="loading" @click="onSave">{{ loading ? '저장 중...' : '저장' }}</button>
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
  padding: 8px 36px 8px 8px; /* 오른쪽 아이콘 공간 확보 */
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

button {
  margin-top: 24px;
  padding: 12px 0;
  width: 100%;
  background: #36c18c;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

button.small {
  width: 80px;
  padding: 8px;
  margin-top: 4px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.error-msg,
.error-text {
  color: red;
  font-size: 13px;
  margin-top: 4px;
}
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
}

.email-btn {
  width: 64px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  background-color: #36c18c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  padding: 0;
  margin-top: 3px;
}
</style>
