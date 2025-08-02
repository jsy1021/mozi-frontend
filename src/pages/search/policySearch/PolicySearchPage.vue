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
        style="font-size: 0.75rem"
      >
        {{ tag.label }}
        <button
          class="btn-close btn-close-white btn-sm ms-1"
          aria-label="Close"
          style="width: 0.7rem; height: 0.7rem"
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
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import PolicyCard from './policyCard.vue';
import policyApi from '@/api/policyApi';
import policyFilter from './policyFilter.vue';
import { getScrappedPolicyIds } from '@/api/scrapApi';

const searchKeyword = ref('');
const currentCategory = ref('전체');
const showFilter = ref(false);
const showSearch = ref(false);
const customIncome = ref('');

const categories = ['전체', '일자리', '주거', '교육', '문화', '기타'];
const policyList = ref([]);
// script setup 최상단

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

// 선택된 키워드들
const selectedTagsWithCategory = computed(() => {
  const result = [];
  for (const [category, values] of Object.entries(filterState.value)) {
    values.forEach((label) => {
      result.push({ category, label });
    });
  }
  return result;
});
const filteredList = computed(() => {
  let list = policyList.value;

  // 지역 필터링 (zipCd 기준)
  if (filterState.value.region.length > 0) {
    list = list.filter((policy) => {
      const policyZips = policy.zipCd?.split(',') || [];
      return policyZips.some((zip) => filterState.value.region.includes(zip));
    });
  }

  // 연령 필터링
  if (filterState.value.age.length > 0) {
    list = list.filter((policy) => {
      const minAge = parseInt(policy.sprtTrgtMinAge || '0', 10);
      const maxAge = parseInt(policy.sprtTrgtMaxAge || '200', 10);

      return filterState.value.age.some((selectedAge) => {
        const base = parseInt(selectedAge, 10);
        return minAge <= base + 9 && maxAge >= base;
      });
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

      console.log(
        '[소득 필터] 입력값:',
        incomeValue,
        '정책:',
        min,
        max,
        '조건코드:',
        code
      );

      // 조건 없음 or 기타조건은 무조건 통과
      if (code === '' || code === '0043001' || code === '0043003') return true;

      // 범위 조건일 때만 비교
      if (code === '0043002') {
        return incomeValue >= min && incomeValue <= max;
      }

      // 예외 처리 (알 수 없는 코드)
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

      // 하나라도 선택된 학력에 해당하거나 제한없음인 정책은 통과
      return (
        policyCodes.includes('0049010') || // 제한없음
        selectedCodes.some((code) => policyCodes.includes(code)) // 선택한 것 중 하나라도 포함
      );
    });
  }

  //  취업 상태 필터링
  if (
    filterState.value.employment.length > 0 &&
    !filterState.value.employment.includes('0013010') // 제한없음 제외
  ) {
    list = list.filter((policy) => {
      const jobCodes = policy.jobCd?.split(',') || [];
      return (
        jobCodes.includes('0013010') || // 제한없음 정책 포함
        jobCodes.some((code) => filterState.value.employment.includes(code))
      );
    });
  }

  // 전공 필터링
  if (
    filterState.value.major.length > 0 &&
    !filterState.value.major.includes('0011009') // 제한없음 제외
  ) {
    list = list.filter((policy) => {
      const majorCodes = policy.plcyMajorCd?.split(',') || [];
      return (
        majorCodes.includes('0011009') || // 제한없음 정책 포함
        majorCodes.some((code) => filterState.value.major.includes(code))
      );
    });
  }

  // 특화분야 필터링
  if (
    filterState.value.special.length > 0 &&
    !filterState.value.special.includes('0014010') // 제한없음 제외
  ) {
    list = list.filter((policy) => {
      const specialCodes = policy.sbizCd?.split(',') || [];
      return (
        specialCodes.includes('0014010') || // 제한없음 정책 포함
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

  console.log('혼인 필터 상태:', filterState.value.maritalStatus);
  console.log('전체 정책 수:', policyList.value.length);
  console.log('필터링 후 정책 수:', list.length);

  return list;
});

const toggleFilterPanel = () => {
  showFilter.value = !showFilter.value;
};
const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};
const selectCategory = (tab) => {
  currentCategory.value = tab;
};

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

const summaryTags = computed(() => {
  const grouped = {};

  for (const tag of selectedTagsWithCategory.value) {
    if (!grouped[tag.category]) grouped[tag.category] = [];
    grouped[tag.category].push(tag.label);
  }

  const summaries = [];

  // ✅ customIncome이 있으면 따로 추가
  if (customIncome.value) {
    summaries.push({
      category: 'income',
      label: `${customIncome.value}만원`,
    });
  }
  for (const category in grouped) {
    const list = grouped[category];

    const mappedList =
      category === 'age'
        ? list.map((val) => `${val}대`)
        : category === 'maritalStatus'
        ? list.map((val) => maritalStatusMap[val] || val)
        : category === 'education'
        ? list.map((val) => educationMap[val] || val)
        : category === 'employment'
        ? list.map((val) => employmentMap[val] || val)
        : category === 'major'
        ? list.map((val) => majorMap[val] || val)
        : category === 'special'
        ? list.map((val) => specialMap[val] || val)
        : list;

    if (mappedList.length === 1) {
      summaries.push({ category, label: mappedList[0] });
    } else if (mappedList.length > 1) {
      summaries.push({
        category,
        label: `${mappedList[0]} 외 ${mappedList.length - 1}`,
        originalLabels: list,
      });
    }
  }

  return summaries;
});

const removeTag = (tag) => {
  if (tag.category === 'income') {
    customIncome.value = '';
    return;
  }

  // 역변환용 map (라벨 → 코드)
  const reverseMaritalMap = {
    기혼: '0055001',
    미혼: '0055002',
    제한없음: '0055003',
  };
  const reverseEducationMap = Object.fromEntries(
    Object.entries(educationMap).map(([k, v]) => [v, k])
  );
  const reverseEmploymentMap = Object.fromEntries(
    Object.entries(employmentMap).map(([k, v]) => [v, k])
  );
  const reverseMajorMap = Object.fromEntries(
    Object.entries(majorMap).map(([k, v]) => [v, k])
  );
  const reversespecialMap = Object.fromEntries(
    Object.entries(specialMap).map(([k, v]) => [v, k])
  );

  const getValueToRemove = (label) => {
    if (tag.category === 'age') return label.replace('대', '');
    if (tag.category === 'maritalStatus')
      return reverseMaritalMap[label] || label;
    if (tag.category === 'education')
      return reverseEducationMap[label] || label;
    if (tag.category === 'employment')
      return reverseEmploymentMap[label] || label;
    if (tag.category === 'major') return reverseMajorMap[label] || label;
    if (tag.category === 'special') return reversespecialMap[label] || label;

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

watch(
  filterState,
  (newVal) => {
    sessionStorage.setItem('filterState', JSON.stringify(newVal));
  },
  { deep: true }
);

onMounted(async () => {
  const saved = sessionStorage.getItem('filterState');
  if (saved) {
    filterState.value = JSON.parse(saved);
  }

  const userId = 1; // 하드코딩

  const [data, scrappedIds] = await Promise.all([
    policyApi.getList(),
    getScrappedPolicyIds(userId),
  ]);

  // bookmarked 필드 추가
  policyList.value = data.map((p) => ({
    ...p,
    bookmarked: scrappedIds.includes(p.plcyNo),
  }));

  console.log('정책 목록:', policyList.value);
});
</script>
