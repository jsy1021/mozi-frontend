<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

library.add(faEye, faEyeSlash);
const router = useRouter();

const id = ref('');
const passwd = ref('');
const showPassword = ref(false);

const canSubmit = computed(() => id.value.trim() && passwd.value.trim());

function toggleShow() {
  showPassword.value = !showPassword.value;
}

// 인증 처리 함수
function login() {
  const correctId = 'IEbbuda';
  const correctPass = 'qwerqwer123';

  if (id.value === correctId && passwd.value === correctPass) {
    router.push({ name: 'mainPage' });
  } else {
    error.value = '아이디 또는 비밀번호가 틀렸습니다.';
  }
}
</script>

<template>
  <h1>MoZi</h1>
  <div class="total-form">
    <form class="login-form" @submit.prevent="login">
      <div class="login">
        <input type="text" v-model="id" placeholder="아이디" />
        <br />
        <div class="passwd-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="passwd"
            placeholder="비밀번호"
            class="passwd-input" />
          <FontAwesomeIcon
            :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
            class="toggle-icon"
            @click="toggleShow" />
        </div>
      </div>
      <div class="find">
        <router-link to="/find-id">아이디 찾기</router-link>
        |
        <router-link to="/find-passwd">비밀번호 찾기</router-link>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <button type="submit" :disabled="!canSubmit" :class="{ 'active-btn': canSubmit, 'inactive-btn': !canSubmit }">
        로그인
      </button>
      <div class="join">
        회원이 아니신가요?
        <a href="/join">회원가입</a>
      </div>
    </form>
  </div>
</template>

<style scoped>
.total-form {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45vh;
  transform: translate(0%, 0%);
}
h1 {
  text-align: center;
  margin-top: 4rem;
  font-size: 48px;
  color: #36c18c;
  transform: translateY(0%);
  transform: translateX(0%);
}
.login-form {
  max-width: 320px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login input {
  display: flex;
  flex-direction: column;
  padding-right: 2.5rem;
  font-size: 20px;
  border-radius: 5px;
  padding: 5px;
  border: 1px solid #d9d9d9;
}
.passwd-wrapper {
  position: relative;
}
.find {
  font-size: 12px;
  display: flex;
  justify-content: right;
  gap: 5px;
}
.find a {
  color: #000;
  font-weight: bold;
}
.join {
  display: flex;
  justify-content: center;
  font-size: 12px;
  gap: 5px;
  color: #757575;
}
.join a {
  color: #000;
  font-weight: bold;
}
.login-form button {
  border-radius: 5px;
  padding: 5px;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.inactive-btn {
  background-color: #f2f4f6;
  color: #b0b8c1;
  cursor: not-allowed;
}
.active-btn {
  background-color: #36c18c;
  color: #ffffff;
}
.toggle-icon {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  cursor: pointer;
  color: #000;
  font-size: 1.1rem;
}
.error {
  color: red;
  font-size: 14px;
  margin-top: -10px;
}
</style>
