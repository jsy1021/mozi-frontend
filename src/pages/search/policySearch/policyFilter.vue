<template>
  <div class="border p-3 rounded mb-3 bg-light">
    <!-- 상단 체크박스 추가 -->
    <div class="d-flex justify-content-end mb-2 align-items-center">
      <input
        type="checkbox"
        id="personalInfo"
        class="form-check-input me-1"
        v-model="usePersonalInfo"
      />
      <label
        for="personalInfo"
        class="form-check-label small"
        style="font-size: 0.75rem"
      >
        퍼스널 정보
      </label>
    </div>

    <div class="mb-3">
      <label class="fw-bold small d-block mb-1">지역</label>
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

    <!-- 연령 -->
    <FilterLayout
      label="연령"
      :items="ages"
      category="age"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
    />

    <!-- 혼인 여부 -->
    <FilterLayout
      label="혼인 여부"
      :items="maritalStatus"
      category="maritalStatus"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
      :radioMode="true"
      :single="true"
    />

    <!-- 연소득
    <FilterLayout
      label="연소득"
      :items="income"
      category="income"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
    /> -->

    <!-- 연소득 입력 필터 -->
    <div class="mb-3">
      <label class="fw-bold small d-block mb-1">연소득 (만원)</label>
      <input
        v-model="customIncome"
        type="number"
        class="form-control form-control-sm"
        placeholder="예: 2400"
        :step="100"
        min="0"
      />
    </div>
    <!-- 학력 -->
    <FilterLayout
      label="학력"
      :items="education"
      category="education"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
    />

    <!-- 취업 상태 -->
    <FilterLayout
      label="취업 상태"
      :items="employment"
      category="employment"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
    />
    <FilterLayout
      label="전공 분야"
      :items="major"
      category="major"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
    />

    <!-- 특화 분야 -->
    <FilterLayout
      label="특화 분야"
      :items="special"
      category="special"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import FilterLayout from './FilterLayout.vue';
import { ref, computed, watch } from 'vue';
import RegionSelectModal from './RegionSelectModal.vue';
import { fetchZipCodes, fetchRegionNamesByZipCodes } from '@/api/regionApi';

const usePersonalInfo = ref(true); //체크 상태

// props
const props = defineProps({
  filterState: Object,
  toggleFilter: Function,
  exactAge: Number,
  regionNameMap: Object,
});

// 지역 선택 상태
const showRegionModal = ref(false);
const selectedRegions = ref([]);

// // apply 함수 정의
// const handleRegionApply = ({ zipCodes, regionNames }) => {
//   console.log('받은 지역명:', regionNames);
//   props.filterState.region = zipCodes;
//   selectedRegions.value = regionNames;
// };

// 🔥 filterState.region 변경될 때 지역명으로 변환해서 selectedRegions에 세팅
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

// 🧠 수정된 handleRegionApply
const handleRegionApply = async ({ regionNames }) => {
  const zipCodes = await fetchZipCodes(regionNames); // 🔥 지역명 → zipCode 변환

  props.filterState.region = zipCodes;
  selectedRegions.value = regionNames;
  showRegionModal.value = false; // 모달 닫기
};

// 지역명 요약 텍스트
const regionSummaryText = computed(() => {
  const regions = selectedRegions.value;
  const count = regions.length;

  if (count === 0) return '선택된 지역 없음';
  if (count === 1) return regions[0];
  return `${regions[0]} 외 ${count - 1}개`;
});

const ages = [
  { label: '10대', value: '10' },
  { label: '20대', value: '20' },
  { label: '30대', value: '30' },
  { label: '40대', value: '40' },
];

// 혼인 여부 코드 매핑
const maritalStatus = [
  { label: '제한없음', value: '0055003' },
  { label: '미혼', value: '0055002' },
  { label: '기혼', value: '0055001' },
];

// const income = [
//   { label: '소득 무관', value: '0043001' },
//   { label: '기타 입력', value: 'custom' },
// ];

// script setup 최상단에
const customIncome = defineModel('customIncome');

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
