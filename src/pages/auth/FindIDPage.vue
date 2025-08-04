<script setup>
import { ref, reactive } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

library.add(faChevronLeft);

const name = ref('');
const email = ref('');
const error = reactive({ name: '', email: '' });
const foundId = ref('');
const isSubmitted = ref(false);

function validate() {
  error.name = name.value.trim() ? '' : '가입 시 등록한 이름을 입력해 주세요';
  error.email = email.value.trim()
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
      ? ''
      : '정확한 이메일을 입력해 주세요'
    : '정확한 이메일을 입력해 주세요';
}

async function handleSubmit() {
  validate();
  if (error.name || error.email) return;

  try {
    const response = await axios.post('/api/auth/find-id', {
      name: name.value,
      email: email.value,
    });

    if (response.data && response.data.userId) {
      foundId.value = response.data.userId;
    } else {
      foundId.value = '';
      alert('일치하는 정보가 없습니다.');
    }
  } catch (err) {
    console.error(err);
    alert('아이디 찾기 중 오류가 발생했습니다.');
  }

  isSubmitted.value = true;
}
</script>

<template>
  <div class="header">
    <font-awesome-icon icon="fa-solid fa-chevron-left" class="backIcon" />
    <h1 class="logo">MoZi</h1>
  </div>
  <div class="title">아이디 찾기</div>

  <div class="find-id-page">
    <div v-if="!isSubmitted">
      <div class="form-group">
        <label>이름</label>
        <input type="text" v-model="name" placeholder="이름을 입력해주세요" />
        <p v-if="error.name" class="error">{{ error.name }}</p>
      </div>

      <div class="form-group email-group">
        <label>이메일</label>
        <input type="email" v-model="email" placeholder="이메일을 입력해주세요" />
        <p v-if="error.email" class="error">{{ error.email }}</p>
      </div>

      <button @click="handleSubmit" class="submit-btn">확인</button>
    </div>

    <div v-else class="result">
      <p v-if="foundId">
        {{ name }}님의 아이디는 <strong>{{ foundId }}</strong> 입니다.
      </p>
      <p v-else>일치하는 정보가 없습니다.</p>
      <button @click="isSubmitted = false" class="submit-btn">확인</button>
    </div>
  </div>
</template>

<style>
.header {
  position: relative;
  display: flex;
  justify-content: center; /* 로고는 가운데 */
  align-items: center; /* 세로 중앙 */
  width: 100%;
  height: 60px;
  margin-top: 2rem;
}
/* 로고 중앙 */
.logo {
  font-size: 48px;
  color: #36c18c;
  margin: 0;
}
.backIcon {
  position: absolute;
  left: 10px;
  top: 60%;
  transform: translateY(-50%);
  font-size: 30px;
  color: black;
  cursor: pointer;
}
/* 타이틀 */
.title {
  font-size: 24px;
  color: #776e6e;
  text-align: center;
  margin-top: 1rem;
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
.email-group {
  margin-top: 2rem;
}
input {
  padding: 0.6rem;
  border: 1px solid #ccc;
  margin-top: 0.5rem;
  border-radius: 4px;
}
.error {
  color: red;
  font-size: 0.8rem;
  margin-top: 4px;
  margin-left: 0;
  text-align: left;
}
.submit-btn {
  width: 100%;
  padding: 0.8rem;
  background: #ccc;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 1rem;
}
.result {
  text-align: center;
}
</style>
