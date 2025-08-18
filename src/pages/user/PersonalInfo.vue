<template>
  <header class="form-hero">
    <h2 class="form-subtitle">퍼스널 정보</h2>
  </header>
  <div class="container">
    <Transition :name="transitionName" mode="out-in">
      <div class="step-viewport" :key="currentStep">
        <!-- Step 0: 기본 정보 -->
        <div v-if="currentStep === 0" class="step">
          <label>관심지역</label>
          <select v-model="form.region" class="select-input">
            <option value="">지역을 선택하세요</option>
            <option v-for="option in regionOptions" :key="option.code" :value="option.code">
              {{ option.label }}
            </option>
          </select>

          <label>연령 (만)</label>
          <input
            type="number"
            v-model.number="form.age"
            placeholder="예: 24"
            min="15"
            max="65"
            step="1"
            :class="{ invalid: ageTouched && !!ageError }"
            @input="ageTouched = true"
            @blur="ageTouched = true" />
          <p class="error-text" v-if="ageTouched && ageError">{{ ageError }}</p>

          <label>혼인여부</label>
          <div class="radio-group">
            <label><input type="radio" :value="MARITAL_STATUS.SINGLE" v-model="form.maritalStatus" /> 미혼</label>
            <label><input type="radio" :value="MARITAL_STATUS.MARRIED" v-model="form.maritalStatus" /> 기혼</label>
          </div>

          <label>연소득</label>
          <div class="income">
            <input
              type="number"
              v-model.number="form.annualIncome"
              placeholder="숫자 입력"
              min="0"
              step="1"
              :class="{ invalid: incomeTouched && !!incomeError }"
              @input="incomeTouched = true"
              @blur="incomeTouched = true" />
            <span>만원</span>
          </div>
          <p class="error-text" v-if="incomeTouched && incomeError">{{ incomeError }}</p>
        </div>

        <!-- Step 1: 학력 -->
        <div v-else-if="currentStep === 1" class="step">
          <label>학력</label>
          <div class="btn-group">
            <button
              v-for="opt in educationOptions"
              :key="opt.code"
              :class="{ active: form.educationLevel === opt.code }"
              @click="form.educationLevel = opt.code">
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Step 2: 취업 상태 -->
        <div v-else-if="currentStep === 2" class="step">
          <label>취업 상태</label>
          <div class="btn-group">
            <button
              v-for="opt in employmentOptions"
              :key="opt.code"
              :class="{ active: form.employmentStatus === opt.code }"
              @click="form.employmentStatus = opt.code">
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Step 3: 전공 계열 -->
        <div v-else-if="currentStep === 3" class="step">
          <label>전공 분야</label>
          <div class="btn-group">
            <button
              v-for="opt in majorOptions"
              :key="opt.code"
              :class="{ active: form.major === opt.code }"
              @click="form.major = opt.code">
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Step 4: 특화 분야 -->
        <div v-else-if="currentStep === 4" class="step">
          <label>특화 분야</label>
          <div class="btn-group">
            <button
              v-for="opt in specialtyOptions"
              :key="opt.code"
              :class="{ active: form.specialty === opt.code }"
              @click="form.specialty = opt.code">
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 왼쪽 버튼 -->
    <div class="btns">
      <button class="btn-cancel" @click="onLeftClick">
        {{ currentStep === 0 ? '취소' : '이전' }}
      </button>
      <!-- 오른쪽 버튼 -->
      <button class="btn-next" :disabled="!stepValid" @click="onRightClick">
        {{ currentStep < 4 ? '다음' : '완료' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { profileAPI } from '@/api/profile.js';
import {
  MARITAL_STATUS,
  getRegionOptions,
  getEducationOptions,
  getEmploymentOptions,
  getMajorOptions,
  getSpecialtyOptions,
} from '@/constants/enums.js';

const router = useRouter();
const currentStep = ref(0);

// enum 옵션들
const regionOptions = getRegionOptions();
const educationOptions = getEducationOptions();
const employmentOptions = getEmploymentOptions();
const majorOptions = getMajorOptions();
const specialtyOptions = getSpecialtyOptions();

// form 객체 - enum 코드로 저장
const form = reactive({
  // 기본 정보
  region: '',
  age: null,
  maritalStatus: '',
  annualIncome: null,
  // 추가 정보
  educationLevel: '',
  employmentStatus: '',
  major: '',
  specialty: '',
});

onMounted(async () => {
  try {
    const profile = await profileAPI.getProfile();

    if (profile && profile.result) {
      // BaseResponse 구조인 경우
      const data = profile.result;
      Object.assign(form, {
        region: data.region || '',
        age: data.age || null,
        maritalStatus: data.marital_status || data.maritalStatus || '',
        annualIncome: data.annual_income || data.annualIncome || null,
        educationLevel: data.education_level || data.educationLevel || '',
        employmentStatus: data.employment_status || data.employmentStatus || '',
        major: data.major || '',
        specialty: data.specialty || '',
      });
    } else if (profile) {
      // 직접 프로필 객체인 경우
      Object.assign(form, {
        region: profile.region || '',
        age: profile.age || null,
        maritalStatus: profile.marital_status || profile.maritalStatus || '',
        annualIncome: profile.annual_income || profile.annualIncome || null,
        educationLevel: profile.education_level || profile.educationLevel || '',
        employmentStatus: profile.employment_status || profile.employmentStatus || '',
        major: profile.major || '',
        specialty: profile.specialty || '',
      });
    }
  } catch (err) {
    console.log('기존 프로필 없음');
  }
});

const stepValid = computed(() => {
  if (currentStep.value === 0) {
    return !!form.region && !!form.maritalStatus && !ageError.value && !incomeError.value;
  }
  if (currentStep.value === 1) return !!form.educationLevel;
  if (currentStep.value === 2) return !!form.employmentStatus;
  if (currentStep.value === 3) return !!form.major;
  if (currentStep.value === 4) return !!form.specialty;
  return false;
});

const navDir = ref('forward');
const transitionName = computed(() => (navDir.value === 'forward' ? 'slide-left' : 'slide-right'));

function onLeftClick() {
  if (currentStep.value === 0) {
    // 첫 화면에서 취소 → 이전 페이지로
    router.back(); // 또는 router.push({ name: 'myPage' });
  } else {
    // 이전 스텝으로
    navDir.value = 'back';
    currentStep.value--;
  }
}

async function onRightClick() {
  if (!stepValid.value) {
    alert('필수 항목을 입력해주세요.');
    return;
  }

  if (currentStep.value < 4) {
    // 저장 없이 다음 스텝으로
    navDir.value = 'forward';
    currentStep.value++;
  } else {
    // 마지막 스텝이면 저장
    await saveProfile();
  }
}

async function saveProfile() {
  try {
    const profileData = {
      region: form.region,
      age: form.age,
      marital_status: form.maritalStatus,
      annual_income: form.annualIncome,
      education_level: form.educationLevel,
      employment_status: form.employmentStatus,
      major: form.major,
      specialty: form.specialty,
    };

    await profileAPI.saveProfile(profileData);
    alert('프로필이 저장되었습니다!');
    await router.push({ name: 'myPage' });
  } catch (err) {
    console.error('저장 실패:', err.response?.data);
    alert('저장에 실패했습니다: ' + (err.response?.data?.message || err.message));
  }
}
// 에러 표시용 터치 상태
const ageTouched = ref(false);
const incomeTouched = ref(false);

// 에러 메시지 계산
const ageError = computed(() => {
  const v = form.age;
  if (v === null || v === undefined || v === '') return '나이를 입력해주세요.';
  if (!Number.isFinite(v)) return '숫자만 입력해주세요.';
  if (v < 15 || v > 65) return '나이는 15~65 사이로 입력해주세요.';
  return '';
});

const incomeError = computed(() => {
  const v = form.annualIncome;
  if (v === null || v === undefined || v === '') return '연소득을 입력해주세요.';
  if (!Number.isFinite(v)) return '숫자만 입력해주세요.';
  if (v < 0) return '연소득은 0 이상만 입력 가능합니다.';
  return '';
});
</script>

<style scoped>
.container {
  max-width: 360px;
  margin: 50px auto;
  background: #fff;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step label {
  display: block;
  font-weight: 500;
  margin-top: 10px;
  margin-bottom: 20px;
}
.step > label {
  display: inline-block;
  margin: 10px 0 15px;
  padding: 4px 10px;
  line-height: 1;
  font-weight: 600;
  color: #fff;
  background-color: #36c18c;
  /*background: rgba(54, 193, 140, 0.1);*/
  border: 1px solid rgba(54, 193, 140, 0.28);
  border-radius: 8px;
}

/* 기본 정보 입력 스타일 */
input[type='number'] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 12px;
}

.select-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 12px;
  background: white;
}
.select-input:focus,
input[type='number']:focus {
  border-color: var(--primary); /* #36c18c */
  box-shadow: 0 0 0 4px rgba(54, 193, 140, 0.15);
  outline: none;
}

input[type='text']:focus,
textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(54, 193, 140, 0.15);
  outline: none;
}

.radio-group {
  margin-bottom: 12px;
}

.radio-group label {
  display: inline-block;
  margin-right: 16px;
  font-weight: normal;
}

.income {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.income input {
  flex: 1;
  margin-bottom: 0;
}

.income span {
  margin-left: 8px;
}

/* 버튼 그룹 스타일 */
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
  gap: 8px;
}

.btn-cancel {
  flex: 1;
  background: #f2f4f6;
  padding: 12px;
  color: #b0b8c1;
  border: none;
  border-radius: 10px;
}

.btn-next {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: var(--primary, #36c18c);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.22s ease, filter 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.actions button:last-child {
  margin-right: 0;
}
.actions button:first-child {
  background: #a0c4c1;
}
.actions button:last-child {
  background: #36c18c;
  color: #ffffff;
}
.actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.title {
  text-align: center;
  margin-bottom: 16px;
  color: #757575;
}
/* 잘못된 값일 때 테두리/그림자 */
input.invalid {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12) !important;
}

/* 에러 텍스트 */
.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
}
.form-subtitle {
  font-size: 20px;
  font-weight: 700;
  color: #757575;
  line-height: 1.2;
  margin: 0 0 12px;
}
.form-hero {
  width: 100%;
  max-width: 720px;
  margin: 16px auto 12px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-hero .form-subtitle {
  margin: 0;
  font-size: 25px;
  font-weight: 700;
  color: #757575;
  text-align: center;
  line-height: 1.2;
}
.container {
  margin: 0 auto 50px;
}
.step-viewport {
  min-height: 220px;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.slide-left-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.28s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.slide-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.28s ease;
}
</style>
