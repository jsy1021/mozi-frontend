<script setup>
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useRouter } from 'vue-router';

const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const confirmError = ref('');
const router = useRouter();

//✖✔ 조건//
const isLengthOk = computed(() => newPassword.value.length >= 10);
const isCompositionOk = computed(() => {
  const pwd = newPassword.value;
  let count = 0;
  if (/[a-zA-Z]/.test(pwd)) count++; // 영문
  if (/\d/.test(pwd)) count++; // 숫자
  if (/[\W_]/.test(pwd)) count++; // 특수문자
  return count >= 2;
});
const isNoTripleNumber = computed(() => !/(\d)\1\1/.test(newPassword.value));

const isFormValid = computed(() => {
  return newPassword.value && confirmPassword.value && !passwordError.value && !confirmError.value;
});
function validatePassword() {
  const pwd = newPassword.value;

  if (pwd.length < 10) {
    passwordError.value = '*10자 이상 입력해주세요.';
  } else if (!isCompositionOk.value) {
    passwordError.value = '*영문/숫자/특수문자 중 2가지 이상 사용해야 합니다.';
  } else if (!isNoTripleNumber.value) {
    passwordError.value = '동일한 숫자 3개 이상 연속 사용은 불가해요.';
  } else {
    passwordError.value = '';
  }
}

function validateConfirmPassword() {
  confirmError.value = newPassword.value !== confirmPassword.value ? '동일한 비밀번호를 입력해주세요.' : '';
}

function handleSubmit() {
  validatePassword();
  validateConfirmPassword();

  if (!passwordError.value && !confirmError.value) {
    router.push('/reset-complete');
    // 실제 비밀번호 변경 요청 로직은 여기에 추가
  }
}
</script>

<template>
  <div class="reset-page">
    <div class="header">
      <font-awesome-icon icon="fa-solid fa-chevron-left" class="backIcon" />
      <h1 class="logo">MoZi</h1>
    </div>
    <div class="title">비밀번호 재설정</div>

    <section class="new-form">
      <div class="form">
        <div class="input-group">
          <label>새 비밀번호 등록</label>
          <input
            type="password"
            v-model="newPassword"
            placeholder="새 비밀번호를 입력해주세요"
            @input="validatePassword" />
          <p class="error" v-if="passwordError">{{ passwordError }}</p>
          <ul class="guide">
            <li :class="{ valid: isLengthOk, invalid: !isLengthOk }">{{ isLengthOk ? '✔' : '✖' }} 10자 이상 입력</li>
            <li :class="{ valid: isCompositionOk, invalid: !isCompositionOk }">
              {{ isCompositionOk ? '✔' : '✖' }} 영문/숫자/특수문자 중 2개 이상 조합
            </li>
            <li :class="{ valid: isNoTripleNumber, invalid: !isNoTripleNumber }">
              {{ isNoTripleNumber ? '✔' : '✖' }} 동일한 숫자 3개 연속 사용 불가
            </li>
          </ul>
        </div>
        <div class="input-group">
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="비밀번호 확인"
            @input="validateConfirmPassword" />
          <p class="error" v-if="confirmError">{{ confirmError }}</p>
        </div>
      </div>
      <button class="submit-btn" :disabled="!isFormValid" @click="handleSubmit">확인</button>
    </section>
  </div>
</template>

<style scoped>
.reset-page {
  padding: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  height: 60px;
  position: relative;
}
.logo {
  font-size: 48px;
  color: #4fa2a0;
  /* margin: 0; */
  /* padding-left: -10px; */
  /* top: 50%;
  transform: translateY(0%);
  transform: translateX(0%); */
}
.backIcon {
  font-size: 30px;
  left: 10px;
  color: black;
  cursor: pointer;
  position: absolute;
  transform: translateY(10%);
}
.title {
  font-size: 24px;
  color: #776e6e;
  text-align: center;
  margin-top: 1rem;
}
.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 300px;
}
.form .input-group {
  margin-bottom: 2.5rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  box-sizing: border-box;
}
.error {
  color: red;
  font-size: 13px;
  margin-top: 0.5rem;
}
.guide {
  list-style: none;
  padding-left: 0;
  margin-top: 0.5rem;
}
.guide li {
  font-size: 12px;
  margin-bottom: 0.25rem;
}
.guide li.valid {
  color: #2e8b57; /* 초록색 */
}
.guide li.invalid {
  color: #ba3637; /* 빨간색 */
}

.submit-btn {
  max-width: 300px;
  width: 100%;
  padding: 12px;
  font-size: 18px;
  background-color: #9cd5cb;
  color: #fff;
  border: none;
  border-radius: 8px;
}
.submit-btn:disabled {
  background-color: #9cd5cb;
  color: #fff;
  cursor: not-allowed;
}
.submit-btn:enabled {
  background-color: #428b92;
  cursor: pointer;
}
.new-form {
  margin-top: 4rem;
  margin-left: 1rem;
}
</style>
