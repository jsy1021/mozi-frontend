<template>
  <div class="header">
    <font-awesome-icon
      icon="fa-solid fa-chevron-left"
      class="backIcon"
      @click="goBack"
    />
    <h1 class="logo">MoZi</h1>
  </div>

  <div class="title">아이디 찾기</div>

  <div class="find-id-page">
    <div v-if="!isSubmitted">
      <div class="form-group">
        <label>이름</label>
        <input
          type="text"
          v-model="form.name"
          placeholder="이름을 입력해주세요"
          @keyup.enter="handleSubmit"
        />
        <p v-if="error.name" class="error">{{ error.name }}</p>
      </div>

      <div class="form-group email-group">
        <label>이메일</label>
        <input
          type="email"
          v-model="form.email"
          placeholder="이메일을 입력해주세요"
          @keyup.enter="handleSubmit"
        />
        <p v-if="error.email" class="error">{{ error.email }}</p>
      </div>

      <button
        @click="handleSubmit"
        class="submit-btn"
        :class="{ active: isFormValid }"
        :disabled="loading"
      >
        {{ loading ? '확인 중...' : '확인' }}
      </button>
    </div>

    <div v-else class="result">
      <div class="result-content">
        <div v-if="foundId" class="success-result">
          <h3>아이디를 찾았습니다!</h3>
          <p>{{ form.name }}님의 아이디는</p>
          <div class="found-id">{{ foundId }}</div>
        </div>

        <div v-else class="error-result">
          <h3>아이디를 찾을 수 없습니다</h3>
          <p>
            입력하신 정보와 일치하는 계정이 없습니다.<br />이름과 이메일을 다시
            확인해주세요.
          </p>
        </div>
      </div>

      <div class="result-buttons">
        <button @click="resetForm" class="secondary-btn">다시 찾기</button>
        <button @click="goToLogin" class="submit-btn active">로그인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { authAPI } from '@/api/auth.js';

library.add(faChevronLeft);

const router = useRouter();

// 상태 관리
const form = reactive({
  name: '',
  email: '',
});

const error = reactive({
  name: '',
  email: '',
});

const foundId = ref('');
const isSubmitted = ref(false);
const loading = ref(false);

// 폼 유효성 검사 computed
const isFormValid = computed(
  () =>
    form.name.trim() &&
    form.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
);

// 유효성 검사 함수
function validate() {
  error.name = form.name.trim() ? '' : '가입 시 등록한 이름을 입력해 주세요';
  error.email = form.email.trim()
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? ''
      : '정확한 이메일을 입력해 주세요'
    : '정확한 이메일을 입력해 주세요';
}

// 아이디 찾기 제출
async function handleSubmit() {
  validate();
  if (error.name || error.email) return;

  try {
    loading.value = true;

    const response = await authAPI.findLoginId(form.name, form.email);
    console.log('아이디 찾기 응답:', response);

    if (response && response.result) {
      const result = response.result;

      if (result.found) {
        foundId.value = result.masked_login_id;
      } else {
        foundId.value = '';
      }
    } else {
      foundId.value = '';
    }
  } catch (err) {
    console.error('아이디 찾기 실패:', err);
    foundId.value = '';

    const errorMessage =
      err.response?.data?.message || '아이디 찾기 중 오류가 발생했습니다.';
    alert(errorMessage);
  } finally {
    loading.value = false;
    isSubmitted.value = true;
  }
}

// 폼 초기화
function resetForm() {
  Object.assign(form, { name: '', email: '' });
  Object.assign(error, { name: '', email: '' });
  foundId.value = '';
  isSubmitted.value = false;
}

// 네비게이션 함수들
function goBack() {
  router.go(-1);
}

function goToLogin() {
  router.push({ name: 'loginPage' });
}
</script>

<style scoped>
.header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  margin-top: 2rem;
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

.find-id-page {
  max-width: 320px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 4rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.email-group {
  margin-top: 2rem;
}

input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  margin-top: 0.5rem;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #36c18c;
}

.error {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 4px;
  text-align: left;
}

.submit-btn {
  width: 100%;
  padding: 0.8rem;
  background: #ccc;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 1rem;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn.active {
  background: #36c18c;
  color: white;
}

.submit-btn:disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
}

.secondary-btn {
  width: 48%;
  padding: 0.8rem;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: #e9ecef;
}

/* 결과 화면 스타일 */
.result {
  text-align: center;
  padding: 2rem 0;
}

.result-content {
  margin-bottom: 2rem;
}

.success-result h3 {
  color: #36c18c;
  margin-bottom: 1rem;
}

.success-result p {
  color: #666;
  margin-bottom: 1rem;
}

.found-id {
  background: #f8f9fa;
  border: 2px solid #36c18c;
  border-radius: 8px;
  padding: 1rem;
  font-size: 20px;
  font-weight: bold;
  color: #36c18c;
  letter-spacing: 2px;
}

.error-result h3 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-result p {
  color: #666;
  line-height: 1.4;
}

.result-buttons {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

/* 아래 CSS 코드를 추가 또는 수정해주세요. */
.result-buttons button {
  width: 50%;
  margin-top: 0;
}
</style>
