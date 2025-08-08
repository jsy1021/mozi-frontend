<template>
  <div class="container py-3">
    <!-- 정책 탐색 + 검색 -->
    <div
      class="d-flex justify-content-center align-items-center mb-2 position-relative"
    >
      <h4 class="mb-0 fw-bold text-center w-100">정책 탐색</h4>
      <i
        class="fa-solid fa-magnifying-glass fa-lg"
        @click="toggleSearch"
        style="cursor: pointer"
      ></i>
    </div>

    <!-- 검색창 -->
    <div class="mb-2" v-if="showSearch">
      <input
        v-model="searchKeyword"
        type="text"
        class="form-control"
        placeholder="검색어를 입력하세요"
      />
    </div>

    <!-- 필터 버튼 -->
    <div class="d-flex justify-content-end mb-2">
      <button
        class="btn btn-outline-secondary btn-sm"
        @click="toggleFilterPanel"
      >
        <i class="fa-solid fa-sliders"></i>
      </button>
    </div>

    <!-- SUMMARY 필터 태그 UI (x 버튼 포함) -->
    <div class="mb-3" v-if="summaryTags.length">
      <span
        v-for="(tag, index) in summaryTags"
        :key="index"
        class="badge bg-secondary me-1 d-inline-flex align-items-center"
        style="font-size: 0.65rem"
      >
        {{ tag.label }}
        <button
          class="btn-close btn-close-white btn-sm ms-1"
          aria-label="Close"
          style="width: 0.4rem; height: 0.5rem"
          @click="removeTag(tag)"
        ></button>
      </span>
    </div>

    <!-- 필터 -->
    <policyFilter
      v-if="showFilter"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
      v-model:customIncome="customIncome"
      v-model:customAge="customAge"
      :regionNameMap="regionNameMap"
      :user-profile="userProfile"
    />

    <!-- 카테고리 탭 -->
    <ul
      class="nav nav-tabs justify-content-between small mb-2"
      style="font-size: 0.85rem"
    >
      <li
        v-for="tab in categories"
        :key="tab"
        class="nav-item"
        style="flex: 1; text-align: center"
      >
        <a
          href="#"
          :class="['nav-link', currentCategory === tab ? 'active' : '']"
          @click.prevent="selectCategory(tab)"
          style="padding: 6px 4px"
        >
          {{ tab }}
        </a>
      </li>
    </ul>

    <PolicyCard
      v-for="policy in filteredList"
      :key="policy.plcyNo"
      :policy="policy"
      :isScrapped="policy.bookmarked"
      @updateBookmark="handleBookmarkChange"
    />
  </div>
</template>

<script setup>
// 기본 import
import { ref, onMounted, computed, watch } from 'vue';
import PolicyCard from './policyCard.vue';
import policyApi from '@/api/policyApi';
import policyFilter from './policyFilter.vue';
import { getScrappedPolicyIds } from '@/api/scrapApi';
import {
  fetchRegionNamesByZipCodes,
  fetchZipCodesBySido,
} from '@/api/regionApi';
import { getCodeFromEnum } from './util/policyEnums';
import {
  RegionEnum,
  MaritalStatusEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
  MajorEnum,
  SpecialtyEnum,
} from './util/policyEnums';
import { profileAPI } from '@/api/profile';

// 상태 변수
const searchKeyword = ref('');
const currentCategory = ref('전체');
const showFilter = ref(false);
const showSearch = ref(false);
const customIncome = ref('');
const customAge = ref('');
const regionNameMap = ref({});
const policyList = ref([]);
const categories = ['전체', '일자리', '주거', '교육', '문화', '기타'];
const userProfile = ref(null);

// 북마크 업데이트
const handleBookmarkChange = ({ plcyNo, value }) => {
  policyList.value = policyList.value.map((p) =>
    p.plcyNo === plcyNo ? { ...p, bookmarked: value } : p
  );
};

// 필터 상태
const filterState = ref({
  region: [],
  age: [],
  maritalStatus: [],
  income: [],
  education: [],
  employment: [],
  major: [],
  special: [],
});

// 필터 toggle 함수
const toggleFilter = (type, value) => {
  const list = filterState.value[type];
  if (list.includes(value)) {
    filterState.value[type] = list.filter((v) => v !== value);
  } else {
    filterState.value[type].push(value);
  }
};

// 카테고리 선택
const selectCategory = (tab) => {
  currentCategory.value = tab;
};

// 필터 토글
const toggleFilterPanel = () => {
  showFilter.value = !showFilter.value;
};

// 검색창 토글
const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};

// 선택된 태그들
const selectedTagsWithCategory = computed(() => {
  const result = [];
  for (const [category, values] of Object.entries(filterState.value)) {
    values.forEach((label) => {
      result.push({ category, label });
    });
  }
  return result;
});

// 정책 필터링
const filteredList = computed(() => {
  let list = policyList.value;

  // 지역 → 연령 → 혼인 → 소득 → 학력 → 취업 → 전공 → 특화 → 카테고리 탭 순서

  // 지역 필터링 (zipCd 기준)
  if (filterState.value.region.length > 0) {
    list = list.filter((policy) => {
      const policyZips = policy.zipCd?.split(',') || [];
      return policyZips.some((zip) => filterState.value.region.includes(zip));
    });
  }

  // 정확한 연령 필터링
  if (customAge.value) {
    const exactAge = parseInt(customAge.value, 10);

    list = list.filter((policy) => {
      const minAge = parseInt(policy.sprtTrgtMinAge || '0', 10);
      const maxAge = parseInt(policy.sprtTrgtMaxAge || '200', 10);
      return exactAge >= minAge && exactAge <= maxAge;
    });
  }

  // 혼인 여부 필터링
  if (filterState.value.maritalStatus.length === 1) {
    const status = filterState.value.maritalStatus[0];
    if (status === '0055001') {
      list = list.filter(
        (policy) =>
          policy.mrgSttsCd === '0055001' || policy.mrgSttsCd === '0055003'
      );
    } else if (status === '0055002') {
      list = list.filter(
        (policy) =>
          policy.mrgSttsCd === '0055002' || policy.mrgSttsCd === '0055003'
      );
    }
  }

  // 연소득 필터링
  if (customIncome.value) {
    const incomeValue = parseInt(customIncome.value, 10);
    list = list.filter((policy) => {
      const code = policy.earnCndSeCd || '';
      const min = Number(policy.earnMinAmt ?? 0);
      const max = Number(policy.earnMaxAmt ?? 99999999);
      if (code === '' || code === '0043001' || code === '0043003') return true;
      if (code === '0043002') {
        return incomeValue >= min && incomeValue <= max;
      }
      return false;
    });
  }

  // 학력 필터링
  if (
    filterState.value.education.length > 0 &&
    !(
      filterState.value.education.length === 1 &&
      filterState.value.education[0] === '0049010'
    )
  ) {
    const selectedCodes = filterState.value.education;
    list = list.filter((policy) => {
      const policyCodes = policy.schoolCd?.split(',') || [];
      return (
        policyCodes.includes('0049010') ||
        selectedCodes.some((code) => policyCodes.includes(code))
      );
    });
  }

  //  취업 상태 필터링
  if (
    filterState.value.employment.length > 0 &&
    !filterState.value.employment.includes('0013010')
  ) {
    list = list.filter((policy) => {
      const jobCodes = policy.jobCd?.split(',') || [];
      return (
        jobCodes.includes('0013010') ||
        jobCodes.some((code) => filterState.value.employment.includes(code))
      );
    });
  }

  // 전공 필터링
  if (
    filterState.value.major.length > 0 &&
    !filterState.value.major.includes('0011009')
  ) {
    list = list.filter((policy) => {
      const majorCodes = policy.plcyMajorCd?.split(',') || [];
      return (
        majorCodes.includes('0011009') ||
        majorCodes.some((code) => filterState.value.major.includes(code))
      );
    });
  }

  // 특화분야 필터링
  if (
    filterState.value.special.length > 0 &&
    !filterState.value.special.includes('0014010')
  ) {
    list = list.filter((policy) => {
      const specialCodes = policy.sbizCd?.split(',') || [];
      return (
        specialCodes.includes('0014010') ||
        specialCodes.some((code) => filterState.value.special.includes(code))
      );
    });
  }

  // 카테고리 필터링
  if (currentCategory.value !== '전체') {
    list = list.filter((policy) => {
      const lcl = policy.lclsfNm || '';
      const category = currentCategory.value;

      if (category === '일자리') return lcl.includes('일자리');
      if (category === '교육') return lcl.includes('교육');
      if (category === '주거') return lcl.includes('주거');
      if (category === '문화') return lcl.includes('복지문화');

      // 기타: 어떤 카테고리에도 포함되지 않은 항목
      return !(
        lcl.includes('일자리') ||
        lcl.includes('교육') ||
        lcl.includes('주거') ||
        lcl.includes('복지문화')
      );
    });
  }

  console.log('전체 정책 수:', policyList.value.length);
  console.log('필터링 후 정책 수:', list.length);

  return list;
});

// 요약 테그 매핑용
const maritalStatusMap = {
  '0055001': '기혼',
  '0055002': '미혼',
  '0055003': '제한없음',
};

const educationMap = {
  '0049010': '제한없음',
  '0049001': '고졸미만',
  '0049002': '고교재학',
  '0049003': '고졸예정',
  '0049004': '고교졸업',
  '0049005': '대학재학',
  '0049006': '대졸예정',
  '0049007': '대학졸업',
  '0049008': '석/박사',
  '0049009': '기타',
};

const employmentMap = {
  '0013010': '제한없음',
  '0013001': '재직자',
  '0013002': '자영업자',
  '0013003': '미취업자',
  '0013004': '프리랜서',
  '0013005': '일용근로자',
  '0013006': '(예비)창업자',
  '0013007': '단기근로자',
  '0013008': '영농종사자',
  '0013009': '기타',
};

const majorMap = {
  '0011009': '제한없음',
  '0011001': '인문계열',
  '0011002': '사회계열',
  '0011003': '상경계열',
  '0011004': '어학계열',
  '0011005': '공학계열',
  '0011006': '예체능계열',
  '0011007': '농산업계열',
  '0011008': '기타',
};

const specialMap = {
  '0014001': '중소기업',
  '0014002': '여성',
  '0014003': '기초생활수급자',
  '0014004': '한부모가정',
  '0014005': '장애인',
  '0014006': '농업인',
  '0014007': '군인',
  '0014008': '지역인재',
  '0014009': '기타',
  '0014010': '제한없음',
};

// 요약 태그 랜더링용
const summaryTags = computed(() => {
  const grouped = {};

  // 필터별 선택된 값 정리
  for (const tag of selectedTagsWithCategory.value) {
    if (!grouped[tag.category]) grouped[tag.category] = [];
    grouped[tag.category].push(tag.label);
  }

  const summaries = [];
  const orderedCategories = [
    'region',
    'age',
    'maritalStatus',
    'income',
    'education',
    'employment',
    'major',
    'special',
  ];

  // 퍼스널 정보 - 나이, 연소득 입력 목
  if (customAge.value) {
    grouped['age'] = [`${customAge.value}세`];
  }
  if (customIncome.value) {
    grouped['income'] = [`${customIncome.value}만원`];
  }

  for (const category of orderedCategories) {
    const list = grouped[category];
    if (!list || list.length === 0) continue;

    // 제한없음 필터 제거
    const filteredList = list.filter(
      (label) =>
        label !== '제한없음' &&
        label !== '0055003' && // 혼인 제한없음
        label !== '0049010' && // 학력 제한없음
        label !== '0013010' && // 취업 제한없음
        label !== '0011009' && // 전공 제한없음
        label !== '0014010' // 특화 제한없음
    );
    if (filteredList.length === 0) continue;

    // 코드 -> 라벨 매핑
    const mappedList =
      category === 'region'
        ? filteredList.map((zip) => regionNameMap.value?.[zip] || zip)
        : category === 'maritalStatus'
        ? filteredList.map((val) => maritalStatusMap[val] || val)
        : category === 'education'
        ? filteredList.map((val) => educationMap[val] || val)
        : category === 'employment'
        ? filteredList.map((val) => employmentMap[val] || val)
        : category === 'major'
        ? filteredList.map((val) => majorMap[val] || val)
        : category === 'special'
        ? filteredList.map((val) => specialMap[val] || val)
        : filteredList;

    if (mappedList.length === 1) {
      summaries.push({ category, label: mappedList[0] });
    } else if (mappedList.length > 1) {
      summaries.push({
        category,
        label: `${mappedList[0]} 외 ${mappedList.length - 1}`,
        originalLabels: filteredList,
      });
    }
  }

  return summaries;
});

// 요약 태그 제거
const removeTag = (tag) => {
  if (tag.category === 'age') {
    customAge.value = '';
    return;
  }
  if (tag.category === 'income') {
    customIncome.value = '';
    return;
  }

  const reverseRegionMap = computed(() =>
    Object.fromEntries(
      Object.entries(regionNameMap.value).map(([zip, name]) => [name, zip])
    )
  );
  const reverseMaritalMap = Object.fromEntries(
    Object.entries(maritalStatusMap).map(([k, v]) => [v, k])
  );
  const reverseEducationMap = Object.fromEntries(
    Object.entries(educationMap).map(([k, v]) => [v, k])
  );
  const reverseEmploymentMap = Object.fromEntries(
    Object.entries(employmentMap).map(([k, v]) => [v, k])
  );
  const reverseMajorMap = Object.fromEntries(
    Object.entries(majorMap).map(([k, v]) => [v, k])
  );
  const reverseSpecialMap = Object.fromEntries(
    Object.entries(specialMap).map(([k, v]) => [v, k])
  );

  const getValueToRemove = (label) => {
    if (tag.category === 'region')
      return reverseRegionMap.value[label] || label;
    if (tag.category === 'age') return label.replace('대', '');
    if (tag.category === 'maritalStatus')
      return reverseMaritalMap[label] || label;
    if (tag.category === 'education')
      return reverseEducationMap[label] || label;
    if (tag.category === 'employment')
      return reverseEmploymentMap[label] || label;
    if (tag.category === 'major') return reverseMajorMap[label] || label;
    if (tag.category === 'special') return reverseSpecialMap[label] || label;

    return label;
  };

  if (tag.originalLabels) {
    tag.originalLabels.forEach((label) => {
      const valueToRemove = getValueToRemove(label);
      filterState.value[tag.category] = filterState.value[tag.category].filter(
        (v) => v !== valueToRemove
      );
    });
  } else {
    const valueToRemove = getValueToRemove(tag.label);
    filterState.value[tag.category] = filterState.value[tag.category].filter(
      (v) => v !== valueToRemove
    );
  }
};

// filterState 변경 감시 → 세션스토리지 저장
watch(
  filterState,
  (newVal) => {
    sessionStorage.setItem('filterState', JSON.stringify(newVal));
  },
  { deep: true }
);

// 지역 필터(region) → 지역 이름 자동 매핑
watch(
  () => filterState.value.region,
  async (zipCodes) => {
    if (!zipCodes || zipCodes.length === 0) return;
    const names = await fetchRegionNamesByZipCodes(zipCodes);
    regionNameMap.value = Object.fromEntries(
      zipCodes.map((z, i) => [z, names[i]])
    );
  },
  { immediate: true }
);

// 초기 데이터 fetch 및 퍼스널 필터 자동 적용
onMounted(async () => {
  const saved = sessionStorage.getItem('filterState');
  if (saved) {
    filterState.value = JSON.parse(saved);
  }

  try {
    // 모든 데이터 병렬 로딩
    const [profile, data, scrappedIds] = await Promise.all([
      profileAPI.getProfile(),
      policyApi.getList(),
      getScrappedPolicyIds(),
    ]);

    userProfile.value = profile;

    // 퍼스널 필터 자동 적용
    if (userProfile.value) {
      const regionLabel = RegionEnum?.[userProfile.value.region]?.label;
      if (regionLabel) {
        try {
          const zipCodes = await fetchZipCodesBySido(regionLabel);
          filterState.value.region = zipCodes;
        } catch (e) {
          console.error('퍼스널 지역 zipCode 불러오기 실패', e);
        }
      }
      if (userProfile.value.age) customAge.value = userProfile.value.age;

      const mrgSttsCode = getCodeFromEnum(
        MaritalStatusEnum,
        userProfile.value.marital_status
      );
      if (mrgSttsCode) filterState.value.maritalStatus = [mrgSttsCode];

      if (userProfile.value.annual_income) {
        customIncome.value = String(userProfile.value.annual_income);
      }

      const educationCode = getCodeFromEnum(
        EducationLevelEnum,
        userProfile.value.education_level
      );
      if (educationCode) filterState.value.education = [educationCode];

      const employmentCode = getCodeFromEnum(
        EmploymentStatusEnum,
        userProfile.value.employment_status
      );
      if (employmentCode) filterState.value.employment = [employmentCode];

      const majorCode = getCodeFromEnum(MajorEnum, userProfile.value.major);
      if (majorCode) filterState.value.major = [majorCode];

      const specialtyCode = getCodeFromEnum(
        SpecialtyEnum,
        userProfile.value.specialty
      );
      if (specialtyCode) filterState.value.special = [specialtyCode];
    } else {
      console.warn('[경고] userProfile 없음: 퍼스널 정보 자동 필터 생략');
    }

    // 스크랩 ID 양쪽 다 trim 해서 비교
    const cleanScrappedIds = scrappedIds.map((id) => String(id).trim());
    policyList.value = data.map((p) => ({
      ...p,
      bookmarked: cleanScrappedIds.includes(String(p.plcyNo).trim()),
    }));

    console.log('✅ 초기 로드 완료', {
      스크랩목록: cleanScrappedIds,
      정책수: policyList.value.length,
    });
  } catch (e) {
    console.error('❌ 초기 데이터 로딩 실패:', e);
  }
});
</script>

<style scoped>
.summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 6px;
  height: 22px;
  line-height: 20px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
}
.summary-chip--active {
  background: #36c18c;
  border-color: #36c18c;
  color: #fff;
}
.chip-close {
  font-size: 10px;
  line-height: 1;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
  margin-left: 2px;
  cursor: pointer;
}
.summary-chip:active {
  transform: scale(0.98);
}
</style>
