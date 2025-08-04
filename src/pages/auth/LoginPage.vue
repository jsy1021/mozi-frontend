<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { authAPI } from '@/api/auth.js';
import { useAuthStore } from '@/stores/auth.js';

library.add(faEye, faEyeSlash);
const router = useRouter();
const authStore = useAuthStore();

const id = ref('');
const passwd = ref('');
const showPassword = ref(false);

const canSubmit = computed(() => id.value.trim() && passwd.value.trim());

function toggleShow() {
  showPassword.value = !showPassword.value;
}
// 기존 하드코딩된 로그인 함수를 API 호출로 변경
async function login() {
  const result = await authStore.login({
    loginId: id.value.trim(),
    password: passwd.value.trim(),
  });

  if (result.success) {
    await router.push({ name: 'mainPage' });
  } else {
    error.value = result.message;
  }
}

function loginWithKakao() {
  alert('카카오 로그인 시도');
}

function loginWithNaver() {
  alert('네이버 로그인 시도');
}

function loginWithGoogle() {
  alert('구글 로그인 시도');
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
            class="passwd-input"
          />
          <FontAwesomeIcon
            :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
            class="toggle-icon"
            @click="toggleShow"
          />
        </div>
      </div>
      <div class="find">
        <router-link to="/find-id">아이디 찾기</router-link>
        |
        <router-link to="/find-passwd">비밀번호 찾기</router-link>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <button
        type="submit"
        :disabled="!canSubmit"
        :class="{ 'active-btn': canSubmit, 'inactive-btn': !canSubmit }"
      >
        로그인
      </button>
      <div class="join">
        회원이 아니신가요?
        <a href="/join">회원가입</a>
      </div>
      <!-- ✅ 소셜 로그인 -->
      <div class="social-login">
        <p class="social-title">또는 소셜 계정으로 로그인</p>

        <!-- 카카오 -->
        <button type="button" class="kakao-btn" @click="loginWithKakao">
          <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              fill="#3c1e1e"
              d="M12 2C6.48 2 2 5.91 2 10.5c0 3.11 2.4 5.82 5.86 7.12L6.5 22l5.31-3.07c.06 0 .13.01.19.01 5.52 0 10-3.91 10-8.5S17.52 2 12 2z" />
          </svg>
          카카오로 로그인
        </button>

        <!-- 네이버 -->
        <button type="button" class="naver-btn" @click="loginWithNaver">
          <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="white" d="M4 4h4l4 7V4h4v16h-4l-4-7v7H4z" />
          </svg>
          네이버로 로그인
        </button>

        <!-- 구글 -->
        <button type="button" class="google-btn" @click="loginWithGoogle">
          <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.4-5.8 7.5-11.3 7.5-6.9 0-12.5-5.6-12.5-12.5S17.1 10.5 24 10.5c3.1 0 5.9 1.1 8.1 3.1l5.7-5.7C34.5 4.4 29.6 2.5 24 2.5 12.4 2.5 3 11.9 3 23.5S12.4 44.5 24 44.5c11.6 0 21-9.4 21-21 0-1.5-.2-3-.4-4.5z" />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8c1.8-4.4 5.9-7.5 11.1-7.5 3.1 0 5.9 1.1 8.1 3.1l5.7-5.7C34.5 4.4 29.6 2.5 24 2.5 15.2 2.5 7.5 7.8 3.6 15.1z" />
            <path
              fill="#4CAF50"
              d="M24 44.5c5.4 0 10.3-2.1 14-5.5l-6.5-5.4c-2.1 1.5-4.8 2.4-7.5 2.4-5.5 0-10.2-3.6-11.8-8.5H6.3c2.4 7.1 9.2 12 17.7 12z" />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.7 2-1.9 3.8-3.4 5.2l.1.1 6.5 5.4c-1.8 1.7-4 3-6.4 3.8l.3.3c7-6.4 11.1-15.2 11.1-25.3 0-1.5-.2-3-.4-4.5z" />
          </svg>
          구글로 로그인
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.total-form {
  display: flex;
  flex-direction: column;
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
  margin-top: 90%;
  max-width: 320px;
  margin-bottom: 4rem;
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
  margin-bottom: 2rem;
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
/* 소셜로그인 */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.social-title {
  font-size: 11px;
  color: #999999;
  margin-bottom: 4px;
  text-align: left; /* 왼쪽 정렬 */
  margin-left: 4px; /* 버튼과 살짝 들여쓰기 */
}

.social-login button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.social-icon {
  width: 20px;
  height: 20px;
}

.kakao-btn {
  background-color: #fee500;
  color: #3c1e1e;
}

.naver-btn {
  background-color: #03c75a;
  color: white;
}

.google-btn {
  background-color: white;
  border: 1px solid #d9d9d9;
  color: #333;
}
</style>
