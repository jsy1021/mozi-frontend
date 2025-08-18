<script setup>
import axios from 'axios';
import { ref, onMounted, watch, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { faXmark, faPen } from '@fortawesome/free-solid-svg-icons';
import { useRoute, useRouter } from 'vue-router';

import {
  REGION_LABELS,
  MARITAL_STATUS_LABELS,
  EDUCATION_LEVEL_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  MAJOR_LABELS,
  SPECIALTY_LABELS,
} from '@/constants/enums';

const route = useRoute();
const router = useRouter();
const personalForm = ref(null);
const canSubmit = computed(() => passwordInput.value.trim() !== '');

library.add(faCircleUser, faXmark, faPen);

// 사용자 정보
const userInfo = ref({
  name: '',
  phone: '',
  email: '',
});

// 모달 상태
const showPasswordModal = ref(false);
const passwordInput = ref('');
const passwordError = ref('');

// 수정 버튼 → 모달 열기
function openPasswordModal() {
  passwordInput.value = '';
  passwordError.value = '';
  showPasswordModal.value = true;
}

// 모달 닫기
function closeModal() {
  showPasswordModal.value = false;
}

// 비밀번호 확인
async function verifyPassword() {
  if (!passwordInput.value.trim()) {
    passwordError.value = '비밀번호를 입력해주세요.';
    return;
  }

  try {
    const res = await axios.post(
      '/api/mypage/confirm-password',
      { password: passwordInput.value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    if (res.data.isSuccess) {
      router.push({ name: 'EditInfo' });
    } else {
      passwordError.value = res.data.message || '비밀번호가 일치하지 않습니다.';
    }
  } catch (e) {
    passwordError.value = '비밀번호 확인 중 오류가 발생했습니다.';
  }
}

// 마이페이지 api 호출
onMounted(async () => {
  try {
    const res = await axios.get('/api/mypage', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (res.data.isSuccess) {
      const result = res.data.result;

      userInfo.value = {
        name: result.username,
        phone: result.phone_number,
        email: result.email,
      };

      personalForm.value = result.has_personal_info ? result.personal_info : null;
    } else {
      console.error('마이페이지 조회 실패:', res.data.message);
    }
  } catch (e) {
    console.error('마이페이지 요청 오류:', e);
  }
});

// 탈퇴 페이지로 이동
function deleteAccount() {
  router.push({ name: 'DeleteInfo' });
}
</script>

<template>
  <div class="mypage-container">
    <!-- 비밀번호 확인 모달 -->
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>비밀번호 확인</h3>
          <font-awesome-icon :icon="['fas', 'xmark']" class="close-icon" @click="closeModal" />
        </div>
        <p class="desc">정보 수정을 위해 비밀번호를 입력해주세요</p>
        <input v-model="passwordInput" type="password" placeholder="비밀번호 입력" class="pw-input" />
        <div v-if="passwordError" class="error-msg">{{ passwordError }}</div>
        <div class="btn-group">
          <button @click="verifyPassword" :disabled="!canSubmit" :class="{ 'disabled-btn': !canSubmit }">확인</button>
        </div>
      </div>
    </div>

    <!-- 마이페이지 화면 -->
    <div class="mypage-content">
      <!-- 기본 정보 카드 -->
      <div class="info-card">
        <div class="info-header">
          <h3>기본 정보</h3>
          <div class="btn-wrapper">
            <font-awesome-icon :icon="['fas', 'pen']" class="icon edit-icon" @click="openPasswordModal" />
          </div>
        </div>
        <div class="user-info-row">
          <div class="avatar">
            <font-awesome-icon :icon="['far', 'circle-user']" size="3x" />
          </div>
          <div class="user-text-info">
            <div class="info-line">
              <span class="label">이름</span>
              <span class="value">{{ userInfo.name }}</span>
            </div>
            <div class="info-line">
              <span class="label">전화번호</span>
              <span class="value">{{ userInfo.phone }}</span>
            </div>
            <div class="info-line">
              <span class="label">이메일</span>
              <span class="value">{{ userInfo.email }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 퍼스널 정보 카드 -->
      <div class="personal-card">
        <template v-if="personalForm">
          <h3>퍼스널 정보</h3>
          <div class="grid">
            <div class="item">
              <span class="label">관심지역</span>
              <span class="value">{{ REGION_LABELS[personalForm.region] || personalForm.region }}</span>
            </div>
            <div class="item">
              <span class="label">연령</span>
              <span class="value">{{ personalForm.age }}</span>
            </div>
            <div class="item">
              <span class="label">혼인여부</span>
              <span class="value">{{ MARITAL_STATUS_LABELS[personalForm.marital_status] || personalForm.marital_status }}</span>
            </div>
            <div class="item">
              <span class="label">연소득</span>
              <span class="value">{{ personalForm.annual_income }} 만원</span>
            </div>
            <div class="item">
              <span class="label">학력</span>
              <span class="value">{{ EDUCATION_LEVEL_LABELS[personalForm.education_level] || personalForm.education_level }}</span>
            </div>
            <div class="item">
              <span class="label">취업상태</span>
              <span class="value">{{ EMPLOYMENT_STATUS_LABELS[personalForm.employment_status] || personalForm.employment_status }}</span>
            </div>
            <div class="item">
              <span class="label">전공</span>
              <span class="value">{{ MAJOR_LABELS[personalForm.major] || personalForm.major }}</span>
            </div>
            <div class="item">
              <span class="label">기타 해당 사항</span>
              <span class="value">{{ SPECIALTY_LABELS[personalForm.specialty] || personalForm.specialty }}</span>
            </div>
          </div>
          <button class="edit-btn" @click="router.push({ name: 'personal' })">퍼스널 정보 수정</button>
        </template>
        <template v-else>
          <h3>퍼스널 정보</h3>
          <p class="desc">설정하신 개인정보 및 관심사항을 기반으로<br />맞춤 정책을 제공합니다.</p>
          <button class="save-btn" @click="router.push('/user/personal')">퍼스널 정보 입력</button>
        </template>
      </div>

      <!-- 회원탈퇴 버튼 -->
      <div class="account-actions">
        <button type="button" class="danger-btn" @click="deleteAccount">회원탈퇴</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
html {
  z-index: -9999;
}
/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80px;
  z-index: 1000;
  padding-inline: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.modal {
  background: #fff;
  padding: 90px 24px 24px;
  border-radius: 10px;
  width: 320px;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.modal-header h3 {
  font-size: 18px;
  margin: 0;
}
.close-icon {
  font-size: 18px;
  cursor: pointer;
  color: #999;
}
.desc {
  font-size: 14px;
  margin-top: 10px;
  color: #555;
}
.pw-input {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.error-msg {
  color: red;
  font-size: 13px;
  margin-top: 8px;
}
.btn-group {
  margin-top: 24px;
}
.btn-group button {
  width: 100%;
  padding: 10px;
  background-color: #36c18c;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* 기본 정보 카드 */
.info-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 12px 10px;
  margin-bottom: 10px;
  width: 100%;
  border: 1px solid #e9ecef;
  flex-shrink: 0;
}

/* 기본 정보 수정 버튼 스타일 */
.btn-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s ease;
  padding: 10px;
  border-radius: 8px;
}

.icon.edit-icon:hover {
  color: #36c18c;
  background-color: #f8f9fa;
}

.icon.delete-icon:hover {
  color: #dc3545;
  background-color: #f8f9fa;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.info-header h3 {
  margin: 0 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #191f28;
  line-height: 1.2;
}

.user-info-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.avatar {
  width: 55px;
  height: 55px;
  background-color: #f8f9fa;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  margin-top: 2px;
  border: 2px solid #e9ecef;
}

.user-text-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-line {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.label {
  color: #6c757d;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 1px;
}

.value {
  color: #191f28;
  font-weight: 600;
  font-size: 13px;
}

/* 퍼스널 카드 */
.personal-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 12px 10px;
  margin-bottom: 10px;
  width: 100%;
  border: 1px solid #e9ecef;
  flex-shrink: 0;
}

.personal-card h3 {
  margin: 12px 0 12px 4px;
  font-size: 16px;
  font-weight: 600;
  color: #191f28;
  line-height: 1.2;
}

/* 퍼스널 정보 미입력 시 */
.personal-card .desc {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.3;
  text-align: center;
  margin-bottom: 16px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn {
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  background-color: #36c18c;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(54, 193, 140, 0.3);
}

.save-btn:hover {
  background-color: #2da471;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(54, 193, 140, 0.4);
}

/* 퍼스널 정보 입력된 경우 그리드 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  margin-bottom: 14px;
}

.item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 10px;
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 60px;
  box-sizing: border-box;
  justify-content: center;
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.item .label {
  font-size: 10px;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 3px;
}

.item .value {
  font-size: 11px;
  font-weight: 600;
  color: #191f28;
}

/* 퍼스널 정보 수정 버튼 */
.personal-card .edit-btn {
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  background-color: #36c18c;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(54, 193, 140, 0.3);
}

.personal-card .edit-btn:hover {
  background-color: #2da471;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(54, 193, 140, 0.4);
}

/* 전체 마이페이지 박스 */
.mypage-container {
  max-width: 380px;
  margin: 0 auto;
  padding: 16px 12px;
  background-color: #f8f9fa;
  height: calc(100vh - 140px);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.mypage-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 16px;
}

.danger-btn {
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  background-color: #f76c6c;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(247, 108, 108, 0.3);
  flex-shrink: 0;
}

.danger-btn:hover {
  background-color: #f04848;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(247, 108, 108, 0.4);
}
</style>
