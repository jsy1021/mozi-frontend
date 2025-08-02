<script setup>
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const personalForm = ref(null);

library.add(faCircleUser);

// api로 회원정보 가져오기
const userInfo = ref({
  name: '김케비',
  phone: '010-0000-0000',
  email: 'IEQnek@naver.com',
});

//모달 관련
const showPasswordModal = ref(false);
const passwordInput = ref('');
const passwordError = ref('');
const isEditing = ref(false);

// 수정 버튼 클릭 시 모달 오픈
function openPasswordModal() {
  passwordInput.value = '';
  passwordError.value = '';
  showPasswordModal.value = true;
  console.log('모달 상태:', showPasswordModal.value); // 상태 확인
}

// 비밀번호 확인
async function verifyPassword() {
  if (!passwordInput.value.trim()) {
    passwordError.value = '비밀번호를 입력해주세요.';
    return;
  }
  try {
    const res = await axios.post(
      '/api/verify-password',
      { password: passwordInput.value.trim() },
      { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
    );
    showPasswordModal.value = false;
    await router.push({ name: 'EditInfo' });
  } catch (e) {
    passwordError.value = '비밀번호가 일치하지 않아요.';
  }
}

// 퍼스널 정보 입력
const personalInfo = ref('');

const savePersonalInfo = () => {
  router.push('/personal');
};

// 마운트 시 localstorage에서 값 불러오기
onMounted(() => {
  const saved = localStorage.getItem('personalForm');
  if (saved) personalForm.value = JSON.parse(saved);
});

// query.updated 쿼리가 변경됐을 때 다시 갱신
watch(
  () => route.query.updated,
  (val) => {
    if (val === 'true') {
      const saved = localStorage.getItem('personalForm');
      if (saved) personalForm.value = JSON.parse(saved);
      router.replace({ query: {} });
    }
  }
);
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

    <!-- 비밀번호 입력 모달 -->
    <teleport to="body">
      <div v-if="showPasswordModal" class="modal-overlay">
        <div class="modal">
          <h3>비밀번호 확인</h3>
          <input v-model="passwordInput" type="password" placeholder="비밀번호" />
          <div v-if="passwordError" class="error">{{ passwordError }}</div>
          <div class="modal-actions">
            <button @click="verifyPassword">확인</button>
            <button @click="showPasswordModal = false">취소</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 퍼스널 정보 카드 -->
    <div class="personal-card">
      <template v-if="personalForm">
        <h3>퍼스널 정보</h3>
        <div class="grid">
          <div class="item">
            <span class="label">학력</span>
            <span class="value">{{ personalForm.education }}</span>
          </div>
          <div class="item">
            <span class="label">취업상태</span>
            <span class="value">{{ personalForm.employment }}</span>
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

/* ✅ 모달 스타일 (scoped에서도 적용되도록 deep 사용) */
:deep(.modal-overlay) {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

:deep(.modal) {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 8px;
  z-index: 9999;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:deep(.modal-actions) {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.modal-actions button) {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
