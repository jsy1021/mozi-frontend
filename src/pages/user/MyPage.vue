<script setup>
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const router = useRouter();
const personalForm = ref(null);
const canSubmit = computed(() => passwordInput.value.trim() !== '');

library.add(faCircleUser, faXmark);

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

// 퍼스널 정보
const savePersonalInfo = () => {
  router.push('/personal');
};

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

      console.log('📦 personalForm:', personalForm.value);
    } else {
      console.error('마이페이지 조회 실패:', res.data.message);
    }
  } catch (e) {
    console.error('마이페이지 요청 오류:', e);
  }
});
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

      <!-- 퍼스널 정보 카드 -->
      <div class="personal-card">
        <template v-if="personalForm">
          <h3>퍼스널 정보</h3>
          <div class="grid">
            <div class="item">
              <span class="label">관심지역</span>
              <span class="value">{{ personalForm.region }}</span>
            </div>
            <div class="item">
              <span class="label">연령</span>
              <span class="value">{{ personalForm.age }}</span>
            </div>
            <div class="item">
              <span class="label">혼인여부</span>
              <span class="value">{{ personalForm.marital_status }}</span>
            </div>
            <div class="item">
              <span class="label">연소득</span>
              <span class="value">{{ personalForm.annual_income }} 만원</span>
            </div>
            <div class="item">
              <span class="label">학력</span>
              <span class="value">{{ personalForm.education_level }}</span>
            </div>
            <div class="item">
              <span class="label">취업상태</span>
              <span class="value">{{ personalForm.employment_status }}</span>
            </div>
            <div class="item">
              <span class="label">전공</span>
              <span class="value">{{ personalForm.major }}</span>
            </div>
            <div class="item">
              <span class="label">특화분야</span>
              <span class="value">{{ personalForm.specialty }}</span>
            </div>
          </div>
          <button class="edit-btn" @click="router.push('/user/personal')">퍼스널 정보 수정</button>
        </template>
        <template v-else>
          <h3>퍼스널 정보</h3>
          <p class="desc">설정하신 개인정보 및 관심사항을 기반으로<br />맞춤 정책을 제공합니다.</p>
          <button class="save-btn" @click="router.push('/user/personal')">퍼스널 정보 입력</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}

.modal {
  background: #fff;
  padding: 90px 24px 24px;
  border-radius: 10px;
  width: 320px;
  max-height: 40vh;
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
  margin-top: 0;
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
  margin-top: 8px;
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
  margin-top: 40px;
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
  margin-top: 12px;
}

/* 퍼스널 정보 카드 */
.personal-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}
.personal-card h3 {
  margin-bottom: 16px;
  color: #36c18c;
  font-size: 1.2rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
}
.label {
  font-weight: bold;
  color: #555;
  margin-right: 8px;
  width: 90px;
}
.value {
  flex: 1;
  color: #333;
}
</style>
