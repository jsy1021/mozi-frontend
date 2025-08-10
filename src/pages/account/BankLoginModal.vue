<template>
  <div class="modal-overlay" @click.self="close">
    <div class="my-modal" :class="{ 'modal-disabled': loading }">
      <!-- 닫기 버튼 -->
      <button class="close-btn" @click="close" aria-label="닫기">×</button>

      <!-- 헤더 -->
      <div class="modal-header">
        <div class="logo-wrap">
          <img :src="bank.logo" class="bank-logo" />
        </div>
        <h2 class="modal-title">{{ bank.name }} 연동</h2>
        <p class="modal-subtitle">안전하게 계좌를 연동합니다</p>
      </div>

      <!-- 에러 표시 -->
      <p v-if="error" class="error-chip">{{ error }}</p>

      <!-- 아이디 입력 -->
      <label class="field">
        <span class="field-label">아이디</span>
        <div class="field-wrap">
          <i class="fa-regular fa-user field-icon"></i>
          <input v-model="id" placeholder="아이디를 입력하세요" :disabled="loading" />
        </div>
      </label>

      <!-- 비밀번호 입력 -->
      <label class="field">
        <span class="field-label">비밀번호</span>
        <div class="field-wrap">
          <i class="fa-solid fa-lock field-icon"></i>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="비밀번호를 입력하세요"
            :disabled="loading"
          />
          <button class="pw-toggle" type="button" @click="togglePw" :disabled="loading">
            <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
          </button>
        </div>
      </label>

      <!-- 홈페이지 버튼 -->
      <button class="ghost-btn" type="button" @click="goHomPage">
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
        <span>{{ bank.name }} 홈페이지 열기</span>
      </button>

      <!-- 액션 버튼 -->
      <div class="modal-actions">
        <button @click="connect" class="primary-btn" :disabled="loading">연동</button>
        <button @click="close" class="text-btn" type="button">취소</button>
      </div>

      <!-- 로딩 오버레이 -->
      <div v-if="loading" class="modal-spinner-wrap">
        <div class="spinner"></div>
        <p class="spinner-text">연동 중입니다...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBankStore } from '@/stores/bank';
import { addAccountList } from '@/api/accountApi.js';

const props = defineProps({
  bank: Object,
});
const emit = defineEmits(['close']);

const id = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

const bankStore = useBankStore();

function close() {
  emit('close');
}

function togglePw() {
  showPassword.value = !showPassword.value;
}

function goHomPage() {
  if (props.bank.link) {
    window.open(props.bank.link, '_blank');
  } else {
    alert('홈페이지 링크가 존재하지 않습니다.');
  }
}

async function connect() {
  if (!id.value || !password.value) {
    error.value = '아이디와 비밀번호를 입력해주세요.';
    return;
  }
  loading.value = true;
  try {
    const response = await addAccountList({
      bankCode: props.bank.code,
      userBankId: id.value,
      userBankPassword: password.value,
    });
    if (!response.success) {
      error.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
      return;
    }
    bankStore.markAsConnected(props.bank.code);
    close();
  } catch (e) {
    console.log(e);
    error.value = '연동 실패. 다시 시도해주세요.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,.45);
  z-index: 999;
  padding: 16px;
}
.my-modal {
  position: relative;
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,.12);
  padding: 20px 18px 16px;
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 10px;
  border: 0;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: #9aa4b2;
  cursor: pointer;
}
.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
}
.logo-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.bank-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.modal-title {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 700;
  color: #2d3138;
}
.modal-subtitle {
  margin: 4px 0 12px;
  font-size: 12px;
  color: #8a94a6;
}
.error-chip {
  margin: 0 0 12px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff2f2;
  color: #d14343;
  font-size: 12px;
  border: 1px solid #ffd6d6;
}
.field {
  display: block;
  margin-bottom: 12px;
}
.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7684;
}
.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #e6e9ee;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  transition: border-color .15s, box-shadow .15s;
}
.field-wrap:focus-within {
  border-color: #b6e7f3;
  box-shadow: 0 0 0 3px rgba(54,193,140,0.12);
}
.field-icon {
  margin-right: 8px;
  color: #9aa4b2;
  font-size: 14px;
}
.field-wrap input {
  flex: 1;
  border: 0;
  outline: none;
  font-size: 14px;
  background: transparent;
}
.pw-toggle {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  color: #9aa4b2;
  font-size: 14px;
}
.ghost-btn {
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin: 6px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7fbff;
  color: #1272e6;
  border: 1px solid #e1efff;
  cursor: pointer;
}
.ghost-btn:active {
  transform: scale(.98);
}
.modal-actions {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.primary-btn {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 0;
  cursor: pointer;
  background: #36c18c;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 6px 14px rgba(54,193,140,.25);
  transition: transform .08s, box-shadow .15s;
}
.primary-btn:active {
  transform: scale(.99);
  box-shadow: 0 4px 10px rgba(54,193,140,.22);
}
.text-btn {
  background: transparent;
  border: 0;
  color: #6b7684;
  cursor: pointer;
  padding: 8px;
  font-size: 14px;
}
.modal-disabled {
  pointer-events: none;
}
.modal-spinner-wrap {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #36c18c;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1.2s linear infinite;
}
.spinner-text {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3138;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
