<script setup>
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';

library.add(faCircleUser);

// api로 회원정보 가져오기
const userInfo = ref({
  name: '김케비',
  phone: '010-0000-0000',
  email: 'IEQnek@naver.com',
});

const showPasswordModal = ref(false);
const passwordInput = ref('');
const passwordError = ref('');
const isEditing = ref(false);

// 수정 버튼 클릭 시 모달
function openPasswordModal() {
  passwordInput.value = '';
  passwordError.value = '';
  showPasswordModal.value = true;
}

// 비밀번호 확인
function verifyPassword() {
  const correctPassword = '1234'; //서버에서 확인
  if (passwordInput.value === correctPassword) {
    showPasswordModal.value = false;
    isEditing.value = true;
  } else {
    passwordError.value = '비밀번호가 일치하지 않습니다.';
  }
}
// 정보 저장
function saveUserInfo() {
  //서버에 정보 저장
  isEditing.value = false;
}

// 퍼스널 정보 입력
const personalInfo = ref('');
</script>

<template>
  <div class="mypage-container">
    <!-- 기본 정보 카드 -->
    <div class="info-card">
      <div class="info-header">
        <h3>기본 정보</h3>
        <button class="edit-btn" @click="openPasswordModal">수정</button>
      </div>
      <div class="user-info">
        <div class="avatar">
          <font-awesome-icon :icon="['far', 'circle-user']" size="2x" />
        </div>

        <div class="details">
          <div class="row">
            <span class="label">이름</span>
            <span class="value">{{ userInfo.name }}</span>
          </div>
          <div class="row">
            <span class="label">전화번호</span>
            <span class="value">{{ userInfo.phone }}</span>
          </div>
          <div class="row">
            <span class="label">이메일</span>
            <span class="value">{{ userInfo.email }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 정보 수정 폼 -->
    <div v-if="isEditing" class="edit-form">
      <h3>정보 수정</h3>
      <div class="form-group">
        <label>이름</label>
        <input v-model="userInfo.name" type="text" />
      </div>
      <div class="form-group">
        <label>전화번호</label>
        <input v-model="userInfo.phone" type="text" />
      </div>
      <div class="form-group">
        <label>이메일</label>
        <input v-model="userInfo.email" type="email" />
      </div>
      <button class="save-btn" @click="saveUserInfo">저장</button>
    </div>

    <!-- 비밀번호 입력 모달 -->
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal">
        <h3>비밀번호 확인</h3>
        <input v-model="passwordInput" type="password" placeholder="비밀번호를 입력하세요" />
        <div v-if="passwordError" class="error">{{ passwordError }}</div>
        <div class="modal-actions">
          <button @click="verifyPassword">확인</button>
          <button @click="showPasswordModal = false">취소</button>
        </div>
      </div>
    </div>

    <!-- 퍼스널 정보 입력 -->
    <div class="personal-card">
      <h3>퍼스널 정보</h3>
      <p class="desc">
        설정하신 개인정보 및 관심사항을 기반으로<br />
        맞춤 정책을 제공합니다.
      </p>
      <button class="save-btn" @click="savePersonalInfo">퍼스널 정보 입력</button>
    </div>
  </div>
</template>

<style scoped>
.mypage-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  max-width: 400px;
  margin: 0 auto;
}

/* 기본 정보 카드 */
.info-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-btn {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #36c18c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 12px;
  padding-top: 12px;
}

.avatar {
  width: 60px;
  height: 60px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  width: 70px;
  font-weight: bold;
  color: #666;
  text-align: left;
}

.value {
  flex: 1;
  border-left: 1px solid #ccc;
  padding-left: 10px;
}

/* 퍼스널 정보 카드 */
.personal-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.personal-card .desc {
  font-size: 14px;
  color: #555;
  margin-bottom: 50px;
}

.personal-card textarea {
  width: 100%;
  height: 80px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: none;
  margin-bottom: 10px;
}

.save-btn {
  width: 100%;
  padding: 10px;
  background-color: #36c18c;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
