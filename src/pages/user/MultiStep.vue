<template>
  <div class="container">
    <h1 class="title">퍼스널 정보 입력</h1>

    <!-- Step 1: 학력 -->
    <div v-if="currentStep === 0" class="step">
      <label>학력</label>
      <div class="btn-group">
        <button
          v-for="opt in educationOptions"
          :key="opt"
          :class="{ active: form.education === opt }"
          @click="form.education = opt">
          {{ opt }}
        </button>
      </div>
    </div>

    <!-- Step 2: 취업 상태 -->
    <div v-else-if="currentStep === 1" class="step">
      <label>취업 상태</label>
      <div class="btn-group">
        <button
          v-for="opt in employmentOptions"
          :key="opt"
          :class="{ active: form.employment === opt }"
          @click="form.employment = opt">
          {{ opt }}
        </button>
      </div>
    </div>

    <!-- Step 3: 전공 계열 -->
    <div v-else-if="currentStep === 2" class="step">
      <label>전공 분야</label>
      <div class="btn-group">
        <button
          v-for="opt in majorOptions"
          :key="opt"
          :class="{ active: form.major === opt }"
          @click="form.major = opt">
          {{ opt }}
        </button>
      </div>
    </div>

    <!-- Step 4: 특화 분야 -->
    <div v-else-if="currentStep === 3" class="step">
      <label>특화 분야</label>
      <div class="btn-group">
        <button
          v-for="opt in specialtyOptions"
          :key="opt"
          :class="{ active: form.specialty === opt }"
          @click="form.specialty = opt">
          {{ opt }}
        </button>
      </div>
    </div>

    <div class="btns">
      <button class="btn-cancel" @click="onCancel">취소</button>
      <button class="btn-next" :disabled="!stepValid" @click="onNext">
        {{ currentStep < 3 ? '다음' : '완료' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentStep = ref(0);

const form = reactive({
  education: '',
  employment: '',
  major: '',
  specialty: '',
});

const educationOptions = [
  '제한없음',
  '고졸 이하',
  '고교 재학',
  '고교 졸업',
  '대학 재학',
  '대학 졸업',
  '석/박사',
  '기타',
];
const employmentOptions = [
  '제한없음',
  '재직자',
  '자영업자',
  '미취업자',
  '프리랜서',
  '일용근로자',
  '단기근로자',
  '예비창업자',
  '영농종사자',
  '기타',
];
const majorOptions = [
  '제한없음',
  '인문계열',
  '사회계열',
  '상경계열',
  '어학계열',
  '공학계열',
  '예체능계열',
  ' 농산업계열',
  '기타',
];
const specialtyOptions = [
  '제한없음',
  '중소기업',
  '여성',
  '기초생활수급자',
  '한부모가정',
  '장애인',
  '농업인',
  '군인',
  '지역인재',
  '기타',
];

const stepValid = computed(() => {
  if (currentStep.value === 0) return !!form.education;
  if (currentStep.value === 1) return !!form.employment;
  if (currentStep.value === 2) return !!form.major;
  if (currentStep.value === 3) return !!form.specialty;
  return false;
});

function onCancel() {
  Object.assign(form, {
    education: '',
    employment: '',
    major: '',
    specialty: '',
  });
  currentStep.value = 0;
  localStorage.removeItem('personalForm');
}

async function onNext() {
  if (!stepValid.value) {
    alert('선택해주세요.');
    return;
  }
  if (currentStep.value < 3) {
    currentStep.value++;
  } else {
    // 완료 시 저장 또는 라우팅
    localStorage.setItem('personalForm', JSON.stringify(form));
    await router.push({ name: 'myPage' });
  }
}
</script>

<style scoped>
.container {
  max-width: 360px;
  margin: 20px auto;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.step label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.btn-group button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fafafa;
  cursor: pointer;
}
.btn-group button.active {
  background: #36c18c;
  color: #fff;
  border-color: #36c18c;
}
.btns {
  display: flex;
}
.btn-cancel {
  flex: 1;
  background: #f2f4f6;
  padding: 12px;
  color: #b0b8c1;
  border: none;
  border-radius: 4px;
  margin-right: 8px;
}
.btn-next {
  flex: 1;
  background: #36c18c;
  padding: 12px;
  color: #fff;
  border: none;
  border-radius: 4px;
}
.btn-next:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.title {
  text-align: center;
  margin-bottom: 16px;
  color: #36c18c;
}
</style>
