<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CustomDropdown from '../user/CustomDropdown.vue';

const router = useRouter();
const regions = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '제주',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
];

const form = reactive({
  region: '',
  age: null,
  married: '',
  income: null,
});

onMounted(() => {
  const saved = localStorage.getItem('formData');
  if (saved) Object.assign(form, JSON.parse(saved));
});

// watch(form, (val) => localStorage.setItem('formData', JSON.stringify(val)), { deep: true });

const isValid = computed(() => form.region && form.age >= 0 && form.married && form.income >= 0);

function onCancel() {
  localStorage.removeItem('formData');
  Object.assign(form, { region: '', age: null, married: '', income: null });
  alert('초기화되었습니다.');
}

async function goMultiStep() {
  if (!isValid.value) {
    alert('필수 항목을 모두 입력해주세요.');
    return;
  }
  localStorage.setItem('formData', JSON.stringify(form));
  await router.push({ name: 'MultiStep' }).catch((err) => {
    /*오류 무시 */
  });
}

// if (router.currentRoute.value.name !== 'MultiStep') {
//   await router.push({ name: 'MultiStep' }).catch((err) => {
//     // 중복 에러 무시
//   });
// }
</script>

<template>
  <h1 class="title">퍼스널 정보 입력</h1>
  <div class="form">
    <label>관심지역</label>
    <CustomDropdown v-model="form.region" :options="regions" />

    <label>연령 (만)</label>
    <input type="number" v-model.number="form.age" placeholder="예: 24" min="0" />

    <label>혼인여부</label>
    <div class="radio-group">
      <label><input type="radio" value="미혼" v-model="form.married" /> 미혼</label>
      <label><input type="radio" value="기혼" v-model="form.married" /> 기혼</label>
    </div>

    <label>연소득</label>
    <div class="income">
      <input type="number" v-model.number="form.income" placeholder="숫자 입력" min="0" />
      <span>만원대</span>
    </div>

    <div class="actions">
      <button @click="onCancel">취소</button>
      <button :disabled="!isValid" @click="goMultiStep">저장</button>
    </div>
  </div>
</template>

<style scoped>
.form {
  max-width: 360px;
  margin: auto;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
label {
  display: block;
  margin: 12px 0 4px;
  font-weight: 600;
}
input[type='number'] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.radio-group label {
  margin-right: 16px;
}
.income {
  display: flex;
  align-items: center;
}
.income input {
  flex: 1;
}
.income span {
  margin-left: 8px;
}
.actions {
  display: flex;
  margin-top: 16px;
}
.actions button {
  flex: 1;
  padding: 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 1rem;
}
.actions button:last-child {
  margin-right: 0;
}
.actions button:first-child {
  background: #a0c4c1;
}
.actions button:last-child {
  background: #398f80;
}
.actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.title {
  text-align: center;
  font-size: 1.5rem;
  margin: 16px 0;
}
</style>
