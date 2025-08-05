<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({ username: '', loginId: '', password: '', email: '', phoneNumber: '' });
const loading = ref(false);
const error = ref('');

// GET /api/mypage/edit → 기존 정보 불러오기
onMounted(async () => {
  try {
    const res = await axios.get('/api/mypage/edit', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    const data = res.data.result;

    form.value.username = data.username;
    form.value.loginId = data.loginId;
    form.value.email = data.email;
    form.value.phoneNumber = data.phoneNumber;
    // password는 사용자가 직접 입력
  } catch (err) {
    error.value = '사용자 정보를 불러오는 데 실패했습니다.';
  }
});

// PUT /api/mypage/edit → 저장
async function onSave() {
  const updatePayload = {};
  if (form.value.password) updatePayload.password = form.value.password;
  if (form.value.email) updatePayload.email = form.value.email;
  if (form.value.phoneNumber) updatePayload.phoneNumber = form.value.phoneNumber;

  if (Object.keys(updatePayload).length === 0) {
    error.value = '변경된 항목이 없습니다.';
    return;
  }

  try {
    loading.value = true;
    await axios.put('/api/mypage/edit', updatePayload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    alert('정보가 수정되었습니다.');
    router.push({ name: 'myPage', query: { updated: 'true' } });
  } catch (err) {
    error.value = '정보 저장에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container form-edit">
    <h2>기본 정보 수정</h2>
    <label>이름</label>
    <input v-model="form.username" readonly />

    <label>아이디</label>
    <input v-model="form.loginId" readonly />

    <label>새 비밀번호</label>
    <input v-model="form.password" type="password" placeholder="새 비밀번호 입력" />

    <label>이메일</label>
    <input v-model="form.email" placeholder="이메일 입력" />

    <label>전화번호</label>
    <input v-model="form.phoneNumber" placeholder="전화번호 입력" />

    <div v-if="error" class="error-msg">{{ error }}</div>

    <button :disabled="loading" @click="onSave">{{ loading ? '저장 중...' : '저장' }}</button>
  </div>
</template>

<style scoped>
.container.form-edit {
  max-width: 400px;
  margin: 40px auto;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}
label {
  display: block;
  margin-top: 16px;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  box-sizing: border-box;
}
button {
  margin-top: 24px;
  padding: 12px 0;
  width: 100%;
  background: #36c18c;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
