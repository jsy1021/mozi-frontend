<template>
  <div class="container py-4">
    <!-- 뒤로가기 버튼 -->
    <div class="d-flex align-items-center mb-3">
      <button class="btn btn-outline-secondary me-2" @click="router.back()">
        ←
      </button>
    </div>
    <!-- 🔹 상단: 제목 + 태그 -->
    <div class="mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <span class="badge bg-secondary me-1">{{ policy.lclsfNm }}</span>
          <span class="badge bg-danger">{{ policy.mclsfNm }}</span>
        </div>
      </div>
      <h4 class="fw-bold">{{ policy.plcyNm }}</h4>
    </div>

    <!-- 🔹 정책 요약 설명 -->
    <div class="alert alert-light small">
      {{ policy.plcyExplnCn }}
    </div>

    <!-- 🔹 키워드 -->
    <div class="mb-3">
      <span
        class="badge bg-light text-dark border me-1"
        v-for="(kw, i) in (policy.plcyKywdNm || '').split(',')"
        :key="i"
      >
        #{{ kw.trim() }}
      </span>
    </div>

    <!-- 🔹 한 눈에 보는 정책 요약 -->
    <div class="border p-3 rounded mb-4 bg-white">
      <h6 class="fw-bold mb-3">한 눈에 보는 정책 요약</h6>
      <ul class="list-unstyled mb-0 small">
        <li><strong>정책번호:</strong> {{ policy.plcyNo }}</li>
        <li><strong>정책분야:</strong> {{ policy.mclsfNm }}</li>
        <li><strong>지원내용:</strong> {{ policy.plcySprtCn }}</li>
        <li>
          <strong>신청기간:</strong>
          {{ formatPeriod(policy.bizPrdBgngYmd, policy.bizPrdEndYmd) }}
        </li>
      </ul>
    </div>

    <!-- 🔹 신청자격 -->
    <div class="border p-3 rounded mb-4 bg-white">
      <h6 class="fw-bold mb-3">신청자격</h6>
      <div class="small">
        <div class="mb-1">
          <strong>연령:</strong> {{ policy.sprtTrgtMinAge }}세 ~
          {{ policy.sprtTrgtMaxAge }}세
        </div>
        <div class="mb-1"><strong>거주지역:</strong> {{ formatZipCode() }}</div>
        <div class="mb-1">
          <strong>소득조건:</strong>
          {{ convertLabel(policy.earnCndSeCd, 'income') }}
        </div>
        <div
          class="mb-1"
          v-if="policy.earnMinAmt || policy.earnMaxAmt || policy.earnEtcCn"
        >
          <strong>소득금액:</strong>
          <span v-if="policy.earnMinAmt"
            >최소 {{ policy.earnMinAmt }}만원
          </span>
          <span v-if="policy.earnMaxAmt"
            >~ 최대 {{ policy.earnMaxAmt }}만원
          </span>
          <span v-if="policy.earnEtcCn">({{ policy.earnEtcCn }})</span>
        </div>
        <div class="mb-1">
          <strong>학력:</strong> {{ convertLabel(policy.schoolCd, 'school') }}
        </div>
        <div class="mb-1">
          <strong>전공:</strong> {{ convertLabel(policy.plcyMajorCd, 'major') }}
        </div>
        <div class="mb-1">
          <strong>취업 상태:</strong> {{ convertLabel(policy.jobCd, 'job') }}
        </div>
        <div class="mb-1">
          <strong>혼인 여부:</strong>
          {{ convertLabel(policy.mrgSttsCd, 'marriage') }}
        </div>
        <div>
          <strong>특화 분야:</strong>
          {{ convertLabel(policy.sBizCd, 'specialty') }}
        </div>
      </div>
    </div>

    <!-- 신청 정보 -->
    <div class="border p-3 rounded bg-white">
      <h6 class="fw-bold mb-3">📎 신청 정보</h6>
      <p class="small">
        <strong>신청 URL:</strong>
        <a :href="policy.aplyUrlAddr" target="_blank" rel="noopener noreferrer">
          {{ policy.aplyUrlAddr }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import policyApi from '@/api/policyApi';
import { fetchRegionNamesByZipCodes } from '@/api/regionApi';

const route = useRoute();
const router = useRouter();
const policy = ref({});
const regionNames = ref([]); // 지역명 목록

onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await policyApi.get(id);
    policy.value = res;

    // zipCd → 지역명 변환
    if (res.zipCd) {
      const zipList = res.zipCd.split(',').map((z) => z.trim());
      const names = await fetchRegionNamesByZipCodes(zipList);
      regionNames.value = names;
    }
  } catch (err) {
    console.error('정책 상세 조회 실패:', err);
  }
});
// 날짜 포맷
const formatPeriod = (start, end) => {
  if (!start && !end) return '상시';
  return `${start || '미정'} ~ ${end || '미정'}`;
};

const formatZipCode = () => {
  if (!regionNames.value || regionNames.value.length === 0) return '제한 없음';
  return regionNames.value.join(', ');
};

const convertLabel = (code, type) => {
  const map = {
    school: {
      '0049001': '고졸 미만',
      '0049002': '고교 재학',
      '0049003': '고졸 예정',
      '0049004': '고교 졸업',
      '0049005': '대학 재학',
      '0049006': '대졸 예정',
      '0049007': '대학 졸업',
      '0049008': '석/박사',
      '0049009': '기타',
      '0049010': '제한없음',
    },
    job: {
      '0013001': '재직자',
      '0013002': '자영업자',
      '0013003': '미취업자',
      '0013004': '프리랜서',
      '0013005': '일용근로자',
      '0013006': '(예비)창업자',
      '0013007': '단기근로자',
      '0013008': '영농종사자',
      '0013009': '기타',
      '0013010': '제한없음',
    },
    marriage: {
      '0055001': '기혼',
      '0055002': '미혼',
      '0055003': '제한없음',
    },
    specialty: {
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
    },
    major: {
      '0011001': '인문계열',
      '0011002': '사회계열',
      '0011003': '상경계열',
      '0011004': '어학계열',
      '0011005': '공학계열',
      '0011006': '예체능계열',
      '0011007': '농산업계열',
      '0011008': '기타',
      '0011009': '제한 없음',
    },
    income: {
      '0043001': '소득무관',
      '0043002': '소득기준 있음',
      '0043003': '기타',
    },
  };
  return map[type]?.[code] || '제한없음';
};
</script>

<style scoped>
h6 {
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.4rem;
  margin-bottom: 1rem;
}

.small > div {
  margin-bottom: 0.5rem;
}
</style>
