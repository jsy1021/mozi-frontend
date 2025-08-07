<template>
  <div class="modal-overlay" @click.self="close">
    <div class="my-modal" :class="{ 'modal-disabled': loading }">
      <div class="modal-header">
        <img :src="bank.logo" class="bank-logo" />
        <h2>{{ bank.name }} 연동</h2>
      </div>
      <input
        v-model="id"
        placeholder="아이디"
        class="input"
        :disabled="loading"
      />
      <input
        v-model="password"
        type="password"
        placeholder="비밀번호"
        class="input"
        :disabled="loading"
      />
      <p v-if="error" class="error">{{ error }}</p>
      <div class="badge-container">
        <span class="badge" @click="goHomPage">{{ bank.name }} 홈페이지</span>
      </div>
      <div class="modal-actions">
        <button @click="connect" class="connect-btn" :disabled="loading">
          연동
        </button>

        <button @click="close" class="cancel-btn">취소</button>
      </div>
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
const bankStore = useBankStore();
const loading = ref(false);
function close() {
  emit('close');
}
function goHomPage() {
  if (props.bank.link) {
    window.open(props.bank.link, '_blank'); // 새 창으로 열기
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
    //  실제 backend 요청
    const response = await addAccountList({
      bankCode: props.bank.code,
      userBankId: id.value,
      userBankPassword: password.value,
    });
    console.log('연동 성공:', response);
    //const connectedId = response.connectedId;
    if (!response.success) {
      error.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
      return;
    }
    // 연동 처리
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.my-modal {
  position: relative;
  background: white;
  padding: 20px;
  width: 300px;
  border-radius: 8px;
  text-align: center;
}
.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
.bank-logo {
  margin-top: 10px;
  width: 60px;
  height: 60px;
  object-fit: contain;
}
.input {
  display: block;
  width: 100%;
  margin-bottom: 5px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.error {
  color: red;
  font-size: 13px;
  margin-bottom: 10px;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
}
.connect-btn {
  background-color: #36c18c;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.2s;
}

.connect-btn:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18); /* 그림자 작게, 눌린 느낌 */
  background: #36c18c; /* 더 어둡게 */
  transform: scale(0.98); /* 살짝 작아짐 */
  transition: box-shadow 0.1s, background 0.1s, transform 0.1s;
}
.cancel-btn {
  background-color: #ddd;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}
.cancel-btn:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18); /* 그림자 작게, 눌린 느낌 */
  background: #ddd; /* 더 어둡게 */
  transform: scale(0.98); /* 살짝 작아짐 */
  transition: box-shadow 0.1s, background 0.1s, transform 0.1s;
}
.badge-container {
  display: flex;
  justify-content: flex-end; /* 또는 margin-left: auto 방식 */
  margin-bottom: 16px;
}
.badge {
  display: inline-block;
  /* margin: 0px 0 30px 150px; */
  padding: 4px 8px;
  background-color: #e0f3ff;
  color: #0077cc;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.badge:hover {
  background-color: #d0eaff;
}

.modal-disabled {
  pointer-events: none;
  /* opacity: 0.6; */
}

.modal-spinner-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  z-index: 10;
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
  font-size: 15px;
  font-weight: 450;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
