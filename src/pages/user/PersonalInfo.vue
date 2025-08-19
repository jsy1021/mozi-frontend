<template>
  <div class="page">
    <header class="form-hero">
      <h2 class="form-subtitle">퍼스널 정보</h2>
      <p class="form-description">
        맞춤 정책 추천을 위한 개인정보를 입력해주세요
      </p>
    </header>

    <div class="container">
      <Transition :name="transitionName" mode="out-in">
        <div class="step-viewport" :key="currentStep">
          <!-- Step 0: 기본 정보 -->
          <div v-if="currentStep === 0" class="step">
            <h3 class="step-title">기본 정보</h3>

            <div class="form-field">
              <label for="region">관심지역</label>
              <select id="region" v-model="form.region" class="select-input">
                <option value="">지역을 선택하세요</option>
                <option
                  v-for="option in regionOptions"
                  :key="option.code"
                  :value="option.code"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label for="age">연령 (만)</label>
              <input
                id="age"
                type="number"
                v-model.number="form.age"
                placeholder="예: 24"
                min="15"
                max="65"
                step="1"
                :class="{ invalid: ageTouched && !!ageError }"
                @input="ageTouched = true"
                @blur="ageTouched = true"
              />
              <p class="error-text" v-if="ageTouched && ageError">
                {{ ageError }}
              </p>
            </div>

            <div class="form-field">
              <label>혼인여부</label>
              <div class="marital-buttons">
                <button
                  class="marital-btn"
                  :class="{
                    active: form.maritalStatus === MARITAL_STATUS.SINGLE,
                  }"
                  @click="form.maritalStatus = MARITAL_STATUS.SINGLE"
                >
                  미혼
                </button>
                <button
                  class="marital-btn"
                  :class="{
                    active: form.maritalStatus === MARITAL_STATUS.MARRIED,
                  }"
                  @click="form.maritalStatus = MARITAL_STATUS.MARRIED"
                >
                  기혼
                </button>
              </div>
            </div>

            <div class="form-field">
              <label for="income">연소득</label>
              <div class="income">
                <input
                  id="income"
                  type="number"
                  v-model.number="form.annualIncome"
                  placeholder="숫자 입력"
                  min="0"
                  step="1"
                  :class="{ invalid: incomeTouched && !!incomeError }"
                  @input="incomeTouched = true"
                  @blur="incomeTouched = true"
                />
                <span class="unit">만원</span>
              </div>
              <p class="error-text" v-if="incomeTouched && incomeError">
                {{ incomeError }}
              </p>
            </div>
          </div>

          <!-- Step 1: 학력 -->
          <div v-else-if="currentStep === 1" class="step">
            <div class="step-header">
              <h3 class="step-title">학력</h3>
              <div class="tooltip-container">
                <font-awesome-icon
                  :icon="['fas', 'circle-exclamation']"
                  class="tooltip-icon"
                  @click="toggleEducationTooltip"
                />
                <Transition name="tooltip">
                  <div
                    v-if="showEducationTooltip"
                    style="
                      background: #f8f9fa;
                      color: #495057;
                      padding: 6px 10px;
                      border-radius: 6px;
                      margin-top: 8px;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                      position: absolute;
                      top: 100%;
                      right: 0;
                      z-index: 9999;
                      white-space: nowrap;
                      border: 1px solid #dee2e6;
                      font-size: 12px;
                    "
                  >
                    정책 자격 확인시에만 사용해요!
                    <div
                      style="
                        position: absolute;
                        top: -6px;
                        right: 10px;
                        width: 0;
                        height: 0;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-bottom: 6px solid #f8f9fa;
                      "
                    ></div>
                  </div>
                </Transition>
              </div>
            </div>
            <div class="btn-group">
              <button
                v-for="opt in educationOptions"
                :key="opt.code"
                :class="{ active: form.educationLevel === opt.code }"
                @click="form.educationLevel = opt.code"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Step 2: 취업 상태 -->
          <div v-else-if="currentStep === 2" class="step">
            <h3 class="step-title">취업 상태</h3>
            <div class="btn-group">
              <button
                v-for="opt in employmentOptions"
                :key="opt.code"
                :class="{ active: form.employmentStatus === opt.code }"
                @click="form.employmentStatus = opt.code"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Step 3: 전공 계열 -->
          <div v-else-if="currentStep === 3" class="step">
            <h3 class="step-title">전공 분야</h3>
            <div class="btn-group">
              <button
                v-for="opt in majorOptions"
                :key="opt.code"
                :class="{ active: form.major === opt.code }"
                @click="form.major = opt.code"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Step 4: 기타 해당 사항 -->
          <div v-else-if="currentStep === 4" class="step">
            <h3 class="step-title">기타 해당 사항</h3>
            <div class="btn-group">
              <button
                v-for="opt in specialtyOptions"
                :key="opt.code"
                :class="{ active: form.specialty === opt.code }"
                @click="form.specialty = opt.code"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 버튼 그룹 -->
      <div class="btns">
        <button class="btn-cancel" @click="onLeftClick">
          {{ currentStep === 0 ? '취소' : '이전' }}
        </button>
        <button class="btn-next" :disabled="!stepValid" @click="onRightClick">
          {{ currentStep < 4 ? '다음' : '완료' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { profileAPI } from '@/api/profileApi.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import {
  MARITAL_STATUS,
  getRegionOptions,
  getEducationOptions,
  getEmploymentOptions,
  getMajorOptions,
  getSpecialtyOptions,
} from '@/constants/enums.js';

library.add(faCircleExclamation);

const router = useRouter();
const currentStep = ref(0);
const showEducationTooltip = ref(false);

// 툴팁 토글 함수 - 3초 후 자동으로 닫힘
const toggleEducationTooltip = () => {
  showEducationTooltip.value = !showEducationTooltip.value;

  if (showEducationTooltip.value) {
    // 3초 후 자동으로 닫기
    setTimeout(() => {
      showEducationTooltip.value = false;
    }, 3000);
  }
};

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
        employmentStatus:
          profile.employment_status || profile.employmentStatus || '',
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
    return (
      !!form.region &&
      !!form.maritalStatus &&
      !ageError.value &&
      !incomeError.value
    );
  }
  if (currentStep.value === 1) return !!form.educationLevel;
  if (currentStep.value === 2) return !!form.employmentStatus;
  if (currentStep.value === 3) return !!form.major;
  if (currentStep.value === 4) return !!form.specialty;
  return false;
});

const navDir = ref('forward');
const transitionName = computed(() =>
  navDir.value === 'forward' ? 'slide-left' : 'slide-right'
);

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
    alert(
      '저장에 실패했습니다: ' + (err.response?.data?.message || err.message)
    );
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
  if (v === null || v === undefined || v === '')
    return '연소득을 입력해주세요.';
  if (!Number.isFinite(v)) return '숫자만 입력해주세요.';
  if (v < 0) return '연소득은 0 이상만 입력 가능합니다.';
  return '';
});
</script>

<style scoped>
.page {
  height: calc(100vh - 140px);
  background: #f5f5f7;
  padding: 16px 12px;
  overflow: hidden;
}

.container {
  max-width: 380px;
  margin: 0 auto;
  background: #fff;
  padding: 20px 16px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  overflow-y: auto;
}

.form-hero {
  text-align: center;
  margin-bottom: 16px;
}

.form-subtitle {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.2;
}

.form-description {
  margin: 0;
  font-size: 13px;
  color: #718096;
  line-height: 1.3;
}

.step-title {
  margin: 0 0 14px 0;
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.step-header .step-title {
  margin: 0;
  border-bottom: none;
  padding-bottom: 0;
  flex-shrink: 0;
}

.tooltip-container {
  position: absolute;
  right: 0;
  display: inline-block;
  flex-shrink: 0;
}

.tooltip-icon {
  color: #36c18c;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tooltip-icon:hover {
  color: #2da471;
  transform: scale(1.1);
}

.tooltip {
  position: relative;
  background: #2d3748;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  margin-top: 8px;
  display: block;
}

.tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: #2d3748;
}

.form-field {
  margin-bottom: 14px;
}

.form-field label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #4a5568;
  font-size: 12px;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 13px;
  transition: all 0.2s ease;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-field input:focus,
.form-field select:focus {
  border-color: #36c18c;
  box-shadow: 0 0 0 3px rgba(54, 193, 140, 0.15);
  outline: none;
  transform: translateY(-1px);
}

.form-field input.invalid {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.15);
}

.select-input {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 14px;
  padding-right: 40px;
  -webkit-appearance: none;
  appearance: none;
}

.marital-buttons {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.marital-btn {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #4a5568;
  font-weight: 500;
  min-height: 38px;
}

.marital-btn:hover {
  border-color: #36c18c;
  background-color: #f0fff4;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.15);
}

.marital-btn.active {
  background: #36c18c;
  color: #fff;
  border-color: #36c18c;
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.3);
  transform: translateY(-1px);
}

.radio-group {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.radio-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.radio-option:hover {
  border-color: #36c18c;
  background-color: #f0fff4;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.15);
}

.radio-option.active {
  border-color: #36c18c;
  background-color: #36c18c;
  color: #fff;
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.3);
}

.radio-option input[type='radio'] {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #36c18c;
}

.income {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 4px;
}

.income input {
  flex: 1;
}

.unit {
  color: #718096;
  font-weight: 600;
  font-size: 13px;
  padding: 10px 14px;
  background: #f7fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  white-space: nowrap;
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.income input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.btn-group button {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  transition: all 0.2s ease;
  min-height: 38px;
}

.btn-group button:hover {
  border-color: #36c18c;
  background-color: #f0fff4;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.15);
}

.btn-group button.active {
  background: #36c18c;
  color: #fff;
  border-color: #36c18c;
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.3);
  transform: translateY(-1px);
}

.btns {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  flex: 1;
  background: #f7fafc;
  padding: 10px 14px;
  color: #718096;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #edf2f7;
  color: #4a5568;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-next {
  flex: 1;
  border: none;
  border-radius: 8px;
  background: #36c18c;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  padding: 10px 14px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(54, 193, 140, 0.3);
}

.btn-next:hover:not(:disabled) {
  background: #2da471;
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(54, 193, 140, 0.4);
}

.btn-next:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.step-viewport {
  min-height: 240px;
}

.error-text {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

/* 슬라이드 애니메이션 */
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
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
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
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .page {
    padding: 12px 10px;
  }

  .container {
    padding: 18px 14px;
  }

  .form-subtitle {
    font-size: 18px;
  }

  .form-description {
    font-size: 13px;
  }

  .btn-group {
    grid-template-columns: 1fr;
  }

  .radio-group {
    flex-direction: column;
  }
}

/* 툴팁 애니메이션 */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.3s ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

.tooltip-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.tooltip-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}
</style>
