<template>
  <div class="border p-3 rounded mb-3 bg-light">
    <!-- 퍼스널 정보 체크박스  -->
    <div class="filter-section">
      <div class="personal-info-toggle" :class="{ active: usePersonalInfo }">
        <div class="toggle-content">
          <div class="toggle-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div class="toggle-text">
            <span class="toggle-label">퍼스널 정보 자동 적용</span>
            <span class="toggle-description"
              >저장된 프로필 정보로 필터를 자동 설정합니다</span
            >
          </div>
        </div>
        <label class="toggle-switch">
          <input
            type="checkbox"
            v-model="usePersonalInfo"
            @change="onPersonalToggle"
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- 지역 선택 -->
    <div class="filter-section">
      <div class="filter-label">지역</div>
      <div class="d-flex align-items-center gap-2">
        <input
          class="form-control form-control-sm"
          type="text"
          :value="regionSummaryText"
          readonly
          style="max-width: 250px"
        />
        <button
          class="btn btn-sm btn-outline-dark"
          @click="showRegionModal = true"
        >
          선택
        </button>
      </div>
    </div>

    <!-- 지역 모달 연결 -->
    <RegionSelectModal
      v-if="showRegionModal"
      :initial-zip-codes="filterState.region"
      @close="showRegionModal = false"
      @apply="handleRegionApply"
    />

    <!-- 연령과 연소득을 한 줄에 배치 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">연령</div>
          <div class="input-row">
            <input
              v-model="customAge"
              type="number"
              class="form-control form-control-sm compact-input"
              placeholder="25"
              :step="1"
              min="0"
            />
            <span class="input-suffix">세</span>
          </div>
        </div>

        <div class="filter-item">
          <div class="filter-label">연소득</div>
          <div class="input-row">
            <input
              v-model="customIncome"
              type="number"
              class="form-control form-control-sm compact-input"
              placeholder="2400"
              :step="100"
              min="0"
            />
            <span class="input-suffix">만원</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 혼인 여부 -->
    <div class="filter-section">
      <div class="filter-label">혼인 여부</div>
      <div class="chip-group" role="group" aria-label="혼인 여부">
        <button
          v-for="item in maritalStatus"
          :key="item.value"
          :class="[
            'chip',
            { active: filterState.maritalStatus?.includes(item.value) },
          ]"
          :aria-pressed="filterState.maritalStatus?.includes(item.value)"
          @click="handleMaritalStatusClick(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 학력 -->
    <div class="filter-section">
      <div class="filter-label">학력</div>
      <div class="chip-group" role="group" aria-label="학력">
        <button
          v-for="item in education"
          :key="item.value"
          :class="[
            'chip',
            { active: filterState.education?.includes(item.value) },
          ]"
          :aria-pressed="filterState.education?.includes(item.value)"
          @click="handleEducationClick(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 취업 상태 -->
    <div class="filter-section">
      <div class="filter-label">취업 상태</div>
      <div class="chip-group" role="group" aria-label="취업 상태">
        <button
          v-for="item in employment"
          :key="item.value"
          :class="[
            'chip',
            { active: filterState.employment?.includes(item.value) },
          ]"
          :aria-pressed="filterState.employment?.includes(item.value)"
          @click="handleEmploymentClick(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 전공 -->
    <div class="filter-section">
      <div class="filter-label">전공 분야</div>
      <div class="chip-group" role="group" aria-label="전공 분야">
        <button
          v-for="item in major"
          :key="item.value"
          :class="['chip', { active: filterState.major?.includes(item.value) }]"
          :aria-pressed="filterState.major?.includes(item.value)"
          @click="handleMajorClick(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 기타 해당 사항 -->
    <div class="filter-section">
      <div class="filter-label">기타 해당 사항</div>
      <div class="chip-group" role="group" aria-label="특화 분야">
        <button
          v-for="item in special"
          :key="item.value"
          :class="[
            'chip',
            { active: filterState.special?.includes(item.value) },
          ]"
          :aria-pressed="filterState.special?.includes(item.value)"
          @click="handleSpecialClick(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 하단 액션 -->
    <div class="filter-actions d-flex gap-2 justify-content-end mt-3">
      <button @click="onApply" class="btn btn-primary btn-sm">적용</button>
      <button @click="onReset" class="btn btn-secondary btn-sm">초기화</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineProps, defineEmits } from 'vue';
import RegionSelectModal from './RegionSelectModal.vue';
import {
  fetchZipCodes,
  fetchRegionNamesByZipCodes,
  fetchZipCodesBySido,
} from '@/api/regionApi';
import { getCodeFromEnum } from './util/policyMapping';
import { profileAPI } from '@/api/profileApi';
import {
  EducationLevelEnum,
  EmploymentStatusEnum,
  MaritalStatusEnum,
  MajorEnum,
  SpecialtyEnum,
  RegionEnum,
} from './util/policyEnums';

const usePersonalInfo = ref(localStorage.getItem('usePersonalInfo') === 'true');
const serverProfile = ref(null);

// props
const props = defineProps({
  filterState: Object,
  toggleFilter: Function,
  exactAge: Number,
  regionNameMap: Object,
  userProfile: Object, // 부모에서 넘겨주면 경고 방지용
});

// 지역 선택 상태
const showRegionModal = ref(false);
const selectedRegions = ref([]);

// 연령/연소득 입력 (v-model)
const customAge = defineModel('customAge');
const customIncome = defineModel('customIncome');

// 이벤트
const emit = defineEmits(['apply', 'reset', 'close-filter']);

const onApply = () => {
  emit('apply', {
    filterState: props.filterState,
    customAge: customAge.value,
    customIncome: customIncome.value,
  });
  emit('close-filter'); // 적용 후 닫기
};

const onReset = () => {
  clearFilters();
  emit('reset');
};

// 퍼스널 토글
const onPersonalToggle = () => {
  if (!usePersonalInfo.value) {
    clearFilters();
  }
};

// 필터 초기화
const clearFilters = () => {
  Object.assign(props.filterState, {
    region: [],
    education: [],
    employment: [],
    major: [],
    special: [],
    maritalStatus: [],
  });
  customAge.value = null;
  customIncome.value = null;
};

// 퍼스널 적용
const applyUserProfile = async () => {
  try {
    const response = await profileAPI.getProfile();
    const profile = response.result;
    serverProfile.value = profile;
    if (!profile) return;

    props.filterState.education = [
      getCodeFromEnum(EducationLevelEnum, profile.education_level),
    ];
    props.filterState.employment = [
      getCodeFromEnum(EmploymentStatusEnum, profile.employment_status),
    ];
    props.filterState.maritalStatus = [
      getCodeFromEnum(MaritalStatusEnum, profile.marital_status),
    ];
    props.filterState.major = [getCodeFromEnum(MajorEnum, profile.major)];
    props.filterState.special = [
      getCodeFromEnum(SpecialtyEnum, profile.specialty),
    ];

    customAge.value = profile.age ?? null;
    customIncome.value = profile.annual_income ?? null;

    const sidoLabel = RegionEnum?.[profile.region]?.label;
    if (sidoLabel) {
      const zipCodes = await fetchZipCodesBySido(sidoLabel);
      props.filterState.region = zipCodes;
    } else {
      console.warn('⚠️ 퍼스널 지역 매핑 실패:', profile.region);
    }
  } catch (err) {
    console.error('❌ 퍼스널 정보 적용 실패:', err);
  }
};

// 필터 클릭 핸들러들
const handleMaritalStatusClick = (item) => {
  if (!props.filterState.maritalStatus) {
    props.filterState.maritalStatus = [];
  }
  props.filterState.maritalStatus = [item.value]; // 단일 선택
};

const handleEducationClick = (item) => {
  if (!props.filterState.education) {
    props.filterState.education = [];
  }

  const isLimitless = item.label === '제한없음';
  if (isLimitless) {
    props.filterState.education = [item.value];
  } else {
    const limitlessValue = props.filterState.education.find(
      (v) => education.find((i) => i.label === '제한없음')?.value === v
    );
    if (limitlessValue) {
      props.filterState.education = props.filterState.education.filter(
        (v) => v !== limitlessValue
      );
    }

    if (props.filterState.education.includes(item.value)) {
      props.filterState.education = props.filterState.education.filter(
        (v) => v !== item.value
      );
    } else {
      props.filterState.education.push(item.value);
    }
  }
};

const handleEmploymentClick = (item) => {
  if (!props.filterState.employment) {
    props.filterState.employment = [];
  }

  const isLimitless = item.label === '제한없음';
  if (isLimitless) {
    props.filterState.employment = [item.value];
  } else {
    const limitlessValue = props.filterState.employment.find(
      (v) => employment.find((i) => i.label === '제한없음')?.value === v
    );
    if (limitlessValue) {
      props.filterState.employment = props.filterState.employment.filter(
        (v) => v !== limitlessValue
      );
    }

    if (props.filterState.employment.includes(item.value)) {
      props.filterState.employment = props.filterState.employment.filter(
        (v) => v !== item.value
      );
    } else {
      props.filterState.employment.push(item.value);
    }
  }
};

const handleMajorClick = (item) => {
  if (!props.filterState.major) {
    props.filterState.major = [];
  }

  const isLimitless = item.label === '제한없음';
  if (isLimitless) {
    props.filterState.major = [item.value];
  } else {
    const limitlessValue = props.filterState.major.find(
      (v) => major.find((i) => i.label === '제한없음')?.value === v
    );
    if (limitlessValue) {
      props.filterState.major = props.filterState.major.filter(
        (v) => v !== limitlessValue
      );
    }

    if (props.filterState.major.includes(item.value)) {
      props.filterState.major = props.filterState.major.filter(
        (v) => v !== item.value
      );
    } else {
      props.filterState.major.push(item.value);
    }
  }
};

const handleSpecialClick = (item) => {
  if (!props.filterState.special) {
    props.filterState.special = [];
  }

  const isLimitless = item.label === '제한없음';
  if (isLimitless) {
    props.filterState.special = [item.value];
  } else {
    const limitlessValue = props.filterState.special.find(
      (v) => special.find((i) => i.label === '제한없음')?.value === v
    );
    if (limitlessValue) {
      props.filterState.special = props.filterState.special.filter(
        (v) => v !== limitlessValue
      );
    }

    if (props.filterState.special.includes(item.value)) {
      props.filterState.special = props.filterState.special.filter(
        (v) => v !== item.value
      );
    } else {
      props.filterState.special.push(item.value);
    }
  }
};

onMounted(() => {
  // noop
});

watch(usePersonalInfo, async (enabled) => {
  localStorage.setItem('usePersonalInfo', enabled);
  if (enabled) await applyUserProfile();
});

// 퍼스널 불일치 시 해제
watch(
  [
    () => props.filterState.education,
    () => props.filterState.employment,
    () => props.filterState.maritalStatus,
    () => props.filterState.major,
    () => props.filterState.special,
    () => props.filterState.region,
    () => customAge.value,
    () => customIncome.value,
  ],
  async () => {
    if (!serverProfile.value || !usePersonalInfo.value) return;

    const p = serverProfile.value;
    const zipCodes = p.region
      ? await fetchZipCodesBySido(RegionEnum[p.region]?.label)
      : [];

    const isMatch =
      JSON.stringify(props.filterState.education) ===
        JSON.stringify([
          getCodeFromEnum(EducationLevelEnum, p.education_level),
        ]) &&
      JSON.stringify(props.filterState.employment) ===
        JSON.stringify([
          getCodeFromEnum(EmploymentStatusEnum, p.employment_status),
        ]) &&
      JSON.stringify(props.filterState.maritalStatus) ===
        JSON.stringify([
          getCodeFromEnum(MaritalStatusEnum, p.marital_status),
        ]) &&
      JSON.stringify(props.filterState.major) ===
        JSON.stringify([getCodeFromEnum(MajorEnum, p.major)]) &&
      JSON.stringify(props.filterState.special) ===
        JSON.stringify([getCodeFromEnum(SpecialtyEnum, p.specialty)]) &&
      JSON.stringify(props.filterState.region) === JSON.stringify(zipCodes) &&
      customAge.value === p.age &&
      customIncome.value === p.annual_income;

    if (!isMatch) {
      usePersonalInfo.value = false;
      localStorage.setItem('usePersonalInfo', 'false');
    }
  },
  { deep: true }
);

// 지역 코드 → 지역명 표시
watch(
  () => props.filterState.region,
  async (zipCodes) => {
    if (!zipCodes || zipCodes.length === 0) {
      selectedRegions.value = [];
      return;
    }
    const regionNames = await fetchRegionNamesByZipCodes(zipCodes);
    selectedRegions.value = regionNames;
  },
  { immediate: true }
);

// 지역 모달 apply 처리
const handleRegionApply = async ({ regionNames }) => {
  const zipCodes = await fetchZipCodes(regionNames);
  props.filterState.region = zipCodes;
  selectedRegions.value = regionNames;
  showRegionModal.value = false;
};

// 지역 텍스트 요약
const regionSummaryText = computed(() => {
  const regions = selectedRegions.value;
  if (regions.length === 0) return '선택된 지역 없음';
  if (regions.length === 1) return regions[0];
  return `${regions[0]} 외 ${regions.length - 1}개`;
});

// 옵션 리스트
const maritalStatus = [
  { label: '제한없음', value: '0055003' },
  { label: '미혼', value: '0055002' },
  { label: '기혼', value: '0055001' },
];
const education = [
  { label: '제한없음', value: '0049010' },
  { label: '고졸미만', value: '0049001' },
  { label: '고교재학', value: '0049002' },
  { label: '고졸예정', value: '0049003' },
  { label: '고교졸업', value: '0049004' },
  { label: '대학재학', value: '0049005' },
  { label: '대졸예정', value: '0049006' },
  { label: '대학졸업', value: '0049007' },
  { label: '석/박사', value: '0049008' },
  { label: '기타', value: '0049009' },
];
const employment = [
  { label: '제한없음', value: '0013010' },
  { label: '재직자', value: '0013001' },
  { label: '자영업자', value: '0013002' },
  { label: '미취업자', value: '0013003' },
  { label: '프리랜서', value: '0013004' },
  { label: '일용근로자', value: '0013005' },
  { label: '(예비)창업자', value: '0013006' },
  { label: '단기근로자', value: '0013007' },
  { label: '영농종사자', value: '0013008' },
  { label: '기타', value: '0013009' },
];
const major = [
  { label: '제한없음', value: '0011009' },
  { label: '인문계열', value: '0011001' },
  { label: '사회계열', value: '0011002' },
  { label: '상경계열', value: '0011003' },
  { label: '어학계열', value: '0011004' },
  { label: '공학계열', value: '0011005' },
  { label: '예체능계열', value: '0011006' },
  { label: '농산업계열', value: '0011007' },
  { label: '기타', value: '0011008' },
];
const special = [
  { label: '제한없음', value: '0014010' },
  { label: '중소기업', value: '0014001' },
  { label: '여성', value: '0014002' },
  { label: '기초생활수급자', value: '0014003' },
  { label: '한부모가정', value: '0014004' },
  { label: '장애인', value: '0014005' },
  { label: '농업인', value: '0014006' },
  { label: '군인', value: '0014007' },
  { label: '지역인재', value: '0014008' },
  { label: '기타', value: '0014009' },
];
</script>

<style scoped>
:root {
  --accent: #3182f6;
  --bg-muted: #f7f8fa;
  --border: #e5e8eb;
  --text: #222;
  --text-muted: #6b7684;
}

.filter-section {
  margin-bottom: 12px; /* 16px에서 12px로 줄임 */
}

.filter-row {
  display: flex;
  gap: 16px; /* 항목 사이 간격 */
}

.filter-item {
  flex: 1; /* 항목이 동일한 너비를 가지도록 */
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px; /* 8px에서 6px로 줄임 */
}

.chip-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 6px;
  max-width: 100%;
}

.chip {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--bg-muted);
  color: var(--text);
  border-radius: 9999px;
  padding: 6px 12px;
  font-size: 13px;
  line-height: 1.2;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease, transform 0.05s ease;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip:hover {
  background: #f2f4f6;
  border-color: #dfe3e8;
}

.chip:active {
  transform: translateY(1px);
}

.chip.active {
  background: #eef4ff;
  border-color: var(--accent);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
}

/* 특정 카테고리별 그리드 최적화 */
.chip-group[aria-label='학력'] {
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
}

.chip-group[aria-label='취업 상태'] {
  grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
}

.chip-group[aria-label='전공 분야'] {
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
}

.chip-group[aria-label='특화 분야'] {
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
}

.chip-group[aria-label='혼인 여부'] {
  grid-template-columns: repeat(3, 1fr);
  max-width: 200px;
}

/* 반응형 그리드 조정 */
@media (max-width: 768px) {
  .filter-section {
    margin-bottom: 10px; /* 모바일에서 더 줄임 */
  }

  .filter-label {
    margin-bottom: 5px; /* 모바일에서 더 줄임 */
  }

  .chip-group {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 5px;
  }

  .chip {
    padding: 5px 10px;
    font-size: 12px;
    min-height: 28px;
  }

  .personal-info-toggle {
    padding: 10px 12px;
  }

  .toggle-content {
    gap: 8px;
  }

  .toggle-icon {
    width: 28px;
    height: 28px;
  }

  .toggle-label {
    font-size: 13px;
  }

  .toggle-description {
    font-size: 11px;
  }

  .toggle-switch {
    width: 44px;
    height: 22px;
  }

  .toggle-slider:before {
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(22px);
  }
}

@media (max-width: 480px) {
  .filter-section {
    margin-bottom: 8px; /* 작은 모바일에서 더 줄임 */
  }

  .filter-label {
    margin-bottom: 4px; /* 작은 모바일에서 더 줄임 */
  }

  .chip-group {
    grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
    gap: 4px;
  }

  .chip {
    padding: 4px 8px;
    font-size: 11px;
    min-height: 26px;
  }
}

.filter-actions {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

/* 퍼스널 정보 토글 스타일 */
.personal-info-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.personal-info-toggle:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 8px;
  color: white;
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.toggle-description {
  font-size: 12px;
  color: #64748b;
  line-height: 1.2;
}

/* 토글 스위치 스타일 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-switch:hover .toggle-slider {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* 활성 상태일 때 추가 효과 */
.personal-info-toggle.active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
}

.personal-info-toggle.active .toggle-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* 반응형 조정 */
@media (max-width: 768px) {
  .personal-info-toggle {
    padding: 10px 12px;
  }

  .toggle-content {
    gap: 8px;
  }

  .toggle-icon {
    width: 28px;
    height: 28px;
  }

  .toggle-label {
    font-size: 13px;
  }

  .toggle-description {
    font-size: 11px;
  }

  .toggle-switch {
    width: 44px;
    height: 22px;
  }

  .toggle-slider:before {
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(22px);
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 5px; /* 입력칸과 단위 사이 간격 */
}

.compact-input {
  width: 80px; /* 고정 너비로 공간 제한 */
  min-width: 80px; /* 최소 너비 보장 */
  max-width: 80px; /* 최대 너비 제한 */
  padding: 4px 8px; /* 패딩 줄이기 */
  text-align: right; /* 숫자 오른쪽 정렬 */
  font-size: 13px; /* 폰트 크기 줄이기 */
}

.input-suffix {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  margin-left: 2px; /* 단위와의 간격 조정 */
}
</style>
