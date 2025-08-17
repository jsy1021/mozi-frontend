<template>
  <div class="container py-3">
    <!-- 페이지 제목 -->
    <div class="page-header mb-3">
      <span class="back-btn" @click="goBack">
        <i class="fa-solid fa-angle-left"></i>
      </span>
      <div style="font-size: 18px; font-weight: bold; color: #757575">
        정책 탐색
      </div>
    </div>

    <!-- 검색창 + 필터 버튼 -->
    <div class="d-flex align-items-center mb-3 gap-2">
      <input
        v-model="searchKeyword"
        type="text"
        class="search-input"
        placeholder="정책명 입력"
      />
      <button
        class="btn btn-outline-secondary btn-sm filter-btn"
        @click="toggleFilterPanel"
      >
        <i class="fa-solid fa-sliders"></i>
      </button>
    </div>

    <!-- SUMMARY 필터 태그 -->
    <div v-if="summaryTags && summaryTags.length" class="filter-tags mb-2">
      <div class="filter-tags-container">
        <span
          v-for="(tag, index) in summaryTags || []"
          :key="index"
          class="filter-tag"
        >
          <span class="filter-tag-text">
            {{ tag.label }}
          </span>
          <button
            class="filter-tag-remove"
            aria-label="필터 제거"
            @click="removeTag(tag)"
          >
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- 필터 패널 -->
    <PolicyFilter
      v-if="showFilter"
      :filterState="filterState"
      :toggleFilter="toggleFilter"
      v-model:customIncome="customIncome"
      v-model:customAge="customAge"
      :regionNameMap="regionNameMap"
      :user-profile="userProfile"
      @apply="showFilter = false"
      @close-filter="showFilter = false"
      @reset="onPolicyFilterReset"
    />

    <!-- 카테고리 탭 -->
    <ul class="nav mozi-tabs mb-2">
      <li v-for="tab in categories" :key="tab" class="nav-item">
        <a
          href="#"
          class="nav-link"
          :class="{ active: currentCategory === tab }"
          @click.prevent="selectCategory(tab)"
        >
          {{ tab }}
        </a>
      </li>
    </ul>

    <!-- 카드 리스트 -->
    <transition name="slide-fade" mode="out-in">
      <div :key="currentCategory">
        <PolicyCard
          v-for="policy in filteredList"
          :key="policy.plcyNo"
          :policy="policy"
          :is-scrapped="policy.bookmarked"
          @bookmark-changed="onBookmarkChanged"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
// 기본 import
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import PolicyCard from './policyCard.vue';
import PolicyFilter from './policyFilter.vue';
import policyApi from '@/api/policyApi';
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
import { getScrappedPolicyIds } from '@/api/scrapApi';

// 상태 변수
const searchKeyword = ref('');
const currentCategory = ref('전체');
const categories = ['전체', '일자리', '주거', '교육', '문화', '기타'];
const showFilter = ref(false);
const showSearch = ref(false);
const customIncome = ref('');
const customAge = ref('');
const regionNameMap = ref({});
const policyList = ref([]);
const userProfile = ref(null);
const router = useRouter();
const scrappedNos = ref([]);

// 뒤로가기
const goBack = () => router.back();

// 스크랩
const onBookmarkChanged = ({ plcyNo, bookmarked }) => {
  const i = policyList.value.findIndex((x) => x.plcyNo === plcyNo);
  if (i !== -1) policyList.value[i].bookmarked = bookmarked;
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
const selectCategory = (tab) => (currentCategory.value = tab);

// 필터 토글
const toggleFilterPanel = () => (showFilter.value = !showFilter.value);

// 검색창 토글
const toggleSearch = () => (showSearch.value = !showSearch.value);

// 선택된 태그들
const selectedTagsWithCategory = computed(() => {
  const result = [];
  for (const [category, values] of Object.entries(filterState.value)) {
    (values || []).forEach((label) => {
      result.push({ category, label });
    });
  }
  return result;
});

// 정책 필터링
const filteredList = computed(() => {
  let list = Array.isArray(policyList.value) ? policyList.value : [];

  // 신청 마감된 정책 제외
  const today = new Date();
  const todayYMD = Number(
    today.getFullYear().toString() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0')
  );

  list = list.filter((policy) => {
    const raw = String(policy.aplyYmd || '').trim();
    if (!raw) return true;
    let end = raw;
    if (raw.includes('~')) {
      end = raw.split('~').pop().trim();
    }

    // yyyyMMdd 형식인지 체크
    if (/^\d{8}$/.test(end)) {
      const endYMD = Number(end);
      return endYMD >= todayYMD; // 오늘 이후만 포함
    }

    return true;
  });

  const kw = searchKeyword.value.trim().toLowerCase();
  if (kw) {
    list = list.filter((p) => {
      const fields = [p.plcyNm, p.plcyKywdNm, p.mclsfNm, p.lclsfNm];
      return fields.some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(kw)
      );
    });
  }

  // 지역
  if (filterState.value.region.length > 0) {
    list = list.filter((policy) => {
      const policyZips = policy.zipCd?.split(',') || [];
      return policyZips.some((zip) => filterState.value.region.includes(zip));
    });
  }

  // 정확한 연령
  if (customAge.value) {
    const exactAge = parseInt(customAge.value, 10);
    list = list.filter((policy) => {
      const minAge = parseInt(policy.sprtTrgtMinAge || '0', 10);
      const maxAge = parseInt(policy.sprtTrgtMaxAge || '200', 10);
      return exactAge >= minAge && exactAge <= maxAge;
    });
  }

  // 혼인
  if (filterState.value.maritalStatus.length === 1) {
    const status = filterState.value.maritalStatus[0];
    if (status === '0055001') {
      list = list.filter(
        (p) => p.mrgSttsCd === '0055001' || p.mrgSttsCd === '0055003'
      );
    } else if (status === '0055002') {
      list = list.filter(
        (p) => p.mrgSttsCd === '0055002' || p.mrgSttsCd === '0055003'
      );
    }
  }

  // 연소득
  if (customIncome.value) {
    const incomeValue = parseInt(customIncome.value, 10);
    list = list.filter((policy) => {
      const code = policy.earnCndSeCd || '';
      const min = Number(policy.earnMinAmt ?? 0);
      const max = Number(policy.earnMaxAmt ?? 99999999);
      if (code === '' || code === '0043001' || code === '0043003') return true;
      if (code === '0043002') return incomeValue >= min && incomeValue <= max;
      return false;
    });
  }

  // 학력
  if (
    filterState.value.education.length > 0 &&
    !(
      filterState.value.education.length === 1 &&
      filterState.value.education[0] === '0049010'
    )
  ) {
    const selectedCodes = filterState.value.education;
    list = list.filter((p) => {
      const policyCodes = p.schoolCd?.split(',') || [];
      return (
        policyCodes.includes('0049010') ||
        selectedCodes.some((code) => policyCodes.includes(code))
      );
    });
  }

  // 취업
  if (
    filterState.value.employment.length > 0 &&
    !filterState.value.employment.includes('0013010')
  ) {
    list = list.filter((p) => {
      const jobCodes = p.jobCd?.split(',') || [];
      return (
        jobCodes.includes('0013010') ||
        jobCodes.some((code) => filterState.value.employment.includes(code))
      );
    });
  }

  // 전공
  if (
    filterState.value.major.length > 0 &&
    !filterState.value.major.includes('0011009')
  ) {
    list = list.filter((p) => {
      const majorCodes = p.plcyMajorCd?.split(',') || [];
      return (
        majorCodes.includes('0011009') ||
        majorCodes.some((code) => filterState.value.major.includes(code))
      );
    });
  }

  // 특화
  if (
    filterState.value.special.length > 0 &&
    !filterState.value.special.includes('0014010')
  ) {
    list = list.filter((p) => {
      const specialCodes = p.sbizCd?.split(',') || [];
      return (
        specialCodes.includes('0014010') ||
        specialCodes.some((code) => filterState.value.special.includes(code))
      );
    });
  }

  // 카테고리 탭
  if (currentCategory.value !== '전체') {
    list = list.filter((p) => {
      const lcl = p.lclsfNm || '';
      const category = currentCategory.value;
      if (category === '일자리') return lcl.includes('일자리');
      if (category === '교육') return lcl.includes('교육');
      if (category === '주거') return lcl.includes('주거');
      if (category === '문화') return lcl.includes('복지문화');
      return !(
        lcl.includes('일자리') ||
        lcl.includes('교육') ||
        lcl.includes('주거') ||
        lcl.includes('복지문화')
      );
    });
  }

  return Array.isArray(list) ? list : [];
});

// 요약 매핑
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

// 요약 태그
const summaryTags = computed(() => {
  const grouped = {};
  for (const tag of selectedTagsWithCategory.value) {
    if (!grouped[tag.category]) grouped[tag.category] = [];
    grouped[tag.category].push(tag.label);
  }
  const summaries = [];
  const ordered = [
    'region',
    'age',
    'maritalStatus',
    'income',
    'education',
    'employment',
    'major',
    'special',
  ];

  if (customAge.value) grouped['age'] = [`${customAge.value}세`];
  if (customIncome.value) grouped['income'] = [`${customIncome.value}만원`];

  for (const category of ordered) {
    const list = grouped[category];
    if (!list || list.length === 0) continue;

    const filteredList = list.filter(
      (label) =>
        ![
          '제한없음',
          '0055003',
          '0049010',
          '0013010',
          '0011009',
          '0014010',
        ].includes(label)
    );
    if (filteredList.length === 0) continue;

    const mapped =
      category === 'region'
        ? filteredList.map((zip) => regionNameMap.value?.[zip] || zip)
        : category === 'maritalStatus'
        ? filteredList.map((v) => maritalStatusMap[v] || v)
        : category === 'education'
        ? filteredList.map((v) => educationMap[v] || v)
        : category === 'employment'
        ? filteredList.map((v) => employmentMap[v] || v)
        : category === 'major'
        ? filteredList.map((v) => majorMap[v] || v)
        : category === 'special'
        ? filteredList.map((v) => specialMap[v] || v)
        : filteredList;

    if (mapped.length === 1) summaries.push({ category, label: mapped[0] });
    else if (mapped.length > 1)
      summaries.push({
        category,
        label: `${mapped[0]} 외 ${mapped.length - 1}`,
        originalLabels: filteredList,
      });
  }
  return Array.isArray(summaries) ? summaries : [];
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
      const v = getValueToRemove(label);
      filterState.value[tag.category] = filterState.value[tag.category].filter(
        (x) => x !== v
      );
    });
  } else {
    const v = getValueToRemove(tag.label);
    filterState.value[tag.category] = filterState.value[tag.category].filter(
      (x) => x !== v
    );
  }
};

// filterState 변경 → 세션 저장
watch(
  filterState,
  (v) => {
    sessionStorage.setItem('filterState', JSON.stringify(v));
  },
  { deep: true }
);

// 지역 코드 → 지역명 매핑
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

const CATEGORY_KEY = 'policy.currentCategory';

// 초기 로딩
onMounted(async () => {
  const saved = sessionStorage.getItem('filterState');

  // 카테고리 탭 복원
  const savedCategory = sessionStorage.getItem(CATEGORY_KEY);
  if (savedCategory && categories.includes(savedCategory)) {
    currentCategory.value = savedCategory;
  }

  if (saved) {
    const EMPTY = {
      region: [],
      age: [],
      maritalStatus: [],
      income: [],
      education: [],
      employment: [],
      major: [],
      special: [],
    };
    filterState.value = { ...EMPTY, ...JSON.parse(saved) };
  }

  try {
    const [profile, policies, scrapped] = await Promise.all([
      profileAPI.getProfile(),
      policyApi.getList(),
      getScrappedPolicyIds(),
    ]);

    userProfile.value = profile;
    scrappedNos.value = (scrapped ?? []).map((no) => String(no).trim());

    // 퍼스널 자동 적용
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
    }

    policyList.value = (Array.isArray(policies) ? policies : []).map((p) => {
      const plcyNo = String(p.plcyNo ?? '').trim();
      const bookmarked = scrappedNos.value.includes(plcyNo);
      return { ...p, plcyNo, bookmarked };
    });
  } catch (e) {
    console.error('❌ 초기 데이터 로딩 실패:', e);
  }
});

watch(currentCategory, (v) => {
  if (categories.includes(v)) {
    sessionStorage.setItem(CATEGORY_KEY, v);
  }
});
// 초기화 후처리
const onPolicyFilterReset = () => {
  sessionStorage.removeItem('filterState');
};
</script>

<style scoped>
/* ✅ 탭 콘텐츠 전환 (슬라이드 + 페이드) */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

/* ✅ 공용 탭 유틸 (scoped에서도 Bootstrap보다 강하게) */
.mozi-tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ddd;
}
.mozi-tabs .nav-item {
  flex: 1;
  text-align: center;
}
.mozi-tabs .nav-link {
  width: 100%;
  text-align: center;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  background: transparent !important;
  color: #6b7684 !important;
  font-weight: 500;
  padding: 6px 4px;
  /* 탭 버튼 전환도 부드럽게 */
  transition: color 0.18s ease, border-bottom-color 0.18s ease,
    background-color 0.18s ease;
}
.mozi-tabs .nav-link.active {
  border: none !important;
  border-bottom: 2px solid #36c18c !important;
  background: transparent !important;
  color: #6b7684 !important;
}

.search-input {
  flex: 1;
  height: 36px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.search-input:focus {
  border-color: #36c18c;
  box-shadow: 0 0 0 3px rgba(54, 193, 140, 0.15);
}

.filter-btn {
  height: 36px;
  width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: center; /* 제목을 중앙 */
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  cursor: pointer;
  font-size: 1.2rem;
  color: #757575;
  padding: 4px 8px; /* 클릭 영역 확보 */
}

.page-title {
  margin: 0;
  font-weight: bold;
  text-align: center;
}

/* 🔍 필터 태그 스타일 */
.filter-tags {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.filter-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  padding: 4px 8px;
  font-size: 12px;
  color: #475569;
  transition: all 0.15s ease;
}

.filter-tag:hover {
  border-color: #94a3b8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-tag-text {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 4px;
}

.filter-tag-remove {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease;
  line-height: 1;
}

.filter-tag-remove:hover {
  background: #f1f5f9;
  color: #64748b;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .filter-tags {
    padding: 10px;
  }

  .filter-tags-container {
    gap: 4px;
  }

  .filter-tag {
    font-size: 11px;
    padding: 3px 6px;
  }

  .filter-tag-remove {
    width: 14px;
    height: 14px;
    font-size: 12px;
  }
}
</style>
