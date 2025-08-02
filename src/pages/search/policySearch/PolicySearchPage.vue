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
      v-for="(policy, index) in filteredList"
      :key="index"
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
      const specialCodes = policy.sBizCd?.split(',') || [];
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

const summaryTags = computed(() => {
  const grouped = {};

  for (const tag of selectedTagsWithCategory.value) {
    if (!grouped[tag.category]) grouped[tag.category] = [];
    grouped[tag.category].push(tag.label);
  }

  const summaries = [];

  for (const category in grouped) {
    const list = grouped[category];
    if (list.length === 1) {
      summaries.push({ category, label: list[0] });
    } else if (list.length > 1) {
      summaries.push({
        category,
        label: `${list[0]} 외 ${list.length - 1}`,
        originalLabels: list,
      });
    }
  }

  return summaries;
});

const removeTag = (tag) => {
  if (tag.originalLabels) {
    // 여러 개가 묶인 경우 → 모두 제거
    tag.originalLabels.forEach((label) => {
      const list = filterState.value[tag.category];
      filterState.value[tag.category] = list.filter((v) => v !== label);
    });
  } else {
    const list = filterState.value[tag.category];
    filterState.value[tag.category] = list.filter((v) => v !== tag.label);
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
    bookmarked: scrappedIds.includes(p.policyId),
  }));

  console.log('정책 목록:', policyList.value);
});
</script>
