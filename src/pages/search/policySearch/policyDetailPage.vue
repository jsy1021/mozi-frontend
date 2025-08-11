<template>
  <div class="policy-detail">
    <!-- 🔙 상단 뒤로가기 -->
    <div class="header">
      <div class="page-header mb-3">
        <span class="back-btn" @click="goBack">
          <i class="fa-solid fa-angle-left"></i>
        </span>
        <div style="font-size: 18px; font-weight: bold; color: #757575">
          정책 상세 정보
        </div>
      </div>
    </div>

    <main class="content">
      <!-- 정책 카테고리 + 스크랩 -->
      <div class="tags-row">
        <div class="tags-left">
          <span class="tag main">{{ policy.lclsfNm }}</span>
          <span class="tag sub">{{ policy.mclsfNm }}</span>
        </div>

        <i
          :class="[
            'bookmark',
            'fa-bookmark',
            isScrapped ? 'fa-solid scraped' : 'fa-regular',
          ]"
          @click="toggleScrap"
          aria-label="스크랩 토글"
        />
      </div>

      <!-- 정책명  -->

      <h1 class="title">{{ policy.plcyNm }}</h1>

      <!-- 요약 -->
      <p class="summary">{{ policy.plcyExplnCn }}</p>

      <!-- 키워드 -->
      <div class="keywords" v-if="policy.plcyKywdNm">
        <span
          v-for="(kw, i) in policy.plcyKywdNm.split(',')"
          :key="i"
          class="keyword"
        >
          #{{ kw.trim() }}
        </span>
      </div>

      <!-- 한눈에 보는 정책 -->
      <section class="section card">
        <h2>한눈에 보는 정책</h2>
        <div class="info-list">
          <div class="info-row">
            <span class="label">주관기관명</span>
            <span>{{ policy.sprvsnInstCdNm }}</span>
          </div>
          <div class="info-row">
            <span class="label">정책번호</span>
            <span>{{ policy.plcyNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">정책분야</span>
            <span>{{ policy.mclsfNm }}</span>
          </div>
          <div class="info-row">
            <span class="label">지원내용</span>
            <span>{{ policy.plcySprtCn }}</span>
          </div>
          <div class="info-row">
            <span class="label">운영기간</span>
            <span>{{
              formatPeriod(policy.bizPrdBgngYmd, policy.bizPrdEndYmd)
            }}</span>
          </div>
          <div class="info-row">
            <span class="label">신청기간</span>
            <span>{{ formatAplyPeriod(policy.aplyYmd) }}</span>
          </div>
          <div class="info-row">
            <span class="label">지원 규모(명)</span>
            <span>{{ displayOrDash(policy.sprtSclCnt) }}</span>
          </div>
        </div>
      </section>

      <!-- 신청자격 -->
      <section class="section card">
        <h2>신청자격</h2>
        <div class="info-list">
          <div class="info-row">
            <span class="label">연령</span>
            <span>{{
              formatAgeRange(policy.sprtTrgtMinAge, policy.sprtTrgtMaxAge)
            }}</span>
          </div>
          <div class="info-row">
            <span class="label">거주지역</span>
            <div class="region-text-groups">
              <div
                v-for="g in groupedRegions"
                :key="g.sido"
                class="region-text-group"
              >
                <div class="sido-line">
                  <strong class="sido">{{ g.sido }}</strong>
                  <button
                    v-if="g.guguns.length > MAX_GUGUNS"
                    class="toggle"
                    @click="toggleSido(g.sido)"
                  >
                    {{ isExpanded(g.sido) ? '접기' : '펼치기' }}
                  </button>
                </div>
                <div class="gugun-line">
                  {{ joinGuguns(g.sido, g.guguns) }}
                </div>
              </div>
            </div>
          </div>

          <div class="info-row">
            <span class="label">소득</span>
            <span>{{ convertLabel(policy.earnCndSeCd, 'income') }}</span>
          </div>
          <div
            class="info-row"
            v-if="policy.earnMinAmt || policy.earnMaxAmt || policy.earnEtcCn"
          >
            <span class="label">소득금액</span>
            <span>
              <span v-if="policy.earnMinAmt"
                >최소 {{ formatCurrency(policy.earnMinAmt) }}</span
              >
              <span v-if="policy.earnMaxAmt">
                ~ 최대 {{ formatCurrency(policy.earnMaxAmt) }}</span
              >
              <span v-if="policy.earnEtcCn"> ({{ policy.earnEtcCn }})</span>
            </span>
          </div>
          <div class="info-row">
            <span class="label">학력</span>
            <span>{{ convertLabel(policy.schoolCd, 'school') }}</span>
          </div>
          <div class="info-row">
            <span class="label">전공</span>
            <span>{{ convertLabel(policy.plcyMajorCd, 'major') }}</span>
          </div>
          <div class="info-row">
            <span class="label">취업 상태</span>
            <span>{{ convertLabel(policy.jobCd, 'job') }}</span>
          </div>
          <div class="info-row">
            <span class="label">혼인 여부</span>
            <span>{{ convertLabel(policy.mrgSttsCd, 'marriage') }}</span>
          </div>
          <div class="info-row">
            <span class="label">특화 분야</span>
            <span>{{ convertLabel(policy.sBizCd, 'specialty') }}</span>
          </div>
          <div class="info-row">
            <span class="label">참여 제한 대상</span>
            <span>{{ displayOrDash(policy.ptcpPrpTrgtCn) }}</span>
          </div>
        </div>
      </section>

      <!-- 신청 방법 -->
      <section class="section card">
        <h2>신청 방법</h2>
        <div class="info-row">
          <span class="label">신청 방법</span>
          <span>{{ displayOrDash(policy.plcyAplyMthdCn) }}</span>
        </div>
        <div class="info-row">
          <span class="label">심사 내용</span>
          <span>{{ displayOrDash(policy.srngMthdCn) }}</span>
        </div>

        <div class="info-row">
          <span class="label">신청 URL</span>
          <template v-if="policy.aplyUrlAddr">
            <a
              class="btn btn-primary"
              :href="policy.aplyUrlAddr"
              target="_blank"
              rel="noopener noreferrer"
            >
              신청하러 가기
            </a>
          </template>
          <template v-else>
            <span class="value">-</span>
          </template>
        </div>
        <div class="info-row">
          <span class="label">참고 URL</span>
          <template v-if="policy.refUrlAddr1">
            <a
              class="btn btn-secondary"
              :href="policy.refUrlAddr1"
              target="_blank"
              rel="noopener noreferrer"
            >
              자세히 보기
            </a>
          </template>
          <template v-else>
            <span class="value">-</span>
          </template>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import policyApi from '@/api/policyApi';
import { fetchRegionNamesByZipCodes } from '@/api/regionApi';
import { getScrappedPolicyIds, scrapPolicy, cancelScrap } from '@/api/scrapApi';

const route = useRoute();
const router = useRouter();
const policy = ref({});
const regionNames = ref([]);

// 북마크 상태
const isScrapped = ref(false);
let toggling = false;

onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await policyApi.get(id);
    policy.value = res;

    if (res.zipCd) {
      const zipList = res.zipCd.split(',').map((z) => z.trim());
      regionNames.value = await fetchRegionNamesByZipCodes(zipList);
    }

    // 스크랩 상태 동기화
    const list = await getScrappedPolicyIds();
    const scrappedIds = (Array.isArray(list) ? list : [])
      .map((x) => (typeof x === 'object' ? x?.plcyNo : x))
      .filter(Boolean)
      .map((x) => String(x).trim());

    const plcyNo = String(res.plcyNo ?? '').trim();
    isScrapped.value = scrappedIds.includes(plcyNo);

    console.log('🔎 상세 스크랩 동기화:', {
      plcyNo,
      scrappedIds,
      isScrapped: isScrapped.value,
    });
  } catch (err) {
    console.error('정책 상세 조회 실패:', err);
  }
});
const goBack = () => {
  router.back();
};

// 스크랩
const toggleScrap = async () => {
  if (toggling) return;
  const plcyNo = String(policy.value?.plcyNo ?? '').trim();
  if (!plcyNo) return;

  const prev = isScrapped.value;
  isScrapped.value = !prev;
  try {
    toggling = true;
    if (prev) await cancelScrap(plcyNo);
    else await scrapPolicy(plcyNo);
  } catch (e) {
    console.error('스크랩 토글 실패:', e);
    isScrapped.value = prev;
  } finally {
    toggling = false;
  }
};

const toDotDate = (s) => {
  if (!s) return '';
  const digits = String(s).replace(/\D/g, '');
  if (digits.length === 8)
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  if (digits.length === 6) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}`;
  return String(s).replace(/[\/\-]/g, '.');
};

const formatAplyPeriod = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s) return '-';
  if (/상시/i.test(s)) return '상시';
  const parts = s.split(/\s*(?:~|–|—|to)\s*/i).filter(Boolean);
  if (parts.length === 2)
    return `${toDotDate(parts[0])} ~ ${toDotDate(parts[1])}`;
  return toDotDate(s);
};

const formatAgeRange = (min, max) => {
  // 둘 다 숫자 0이면 "누구나"
  if ((Number(min) || 0) === 0 && (Number(max) || 0) === 0) {
    return '누구나';
  }
  return `${min ?? '-'}세 ~ ${max ?? '-'}세`;
};

// 데이터 없을 때 '-'로 대체
const displayOrDash = (val) => {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'string' && val.trim() === '') return '-';
  return val;
};

const MAX_GUGUNS = 5; // 기본으로 보여줄 개수
const expanded = ref({});

const isExpanded = (sido) => !!expanded.value[sido];
const toggleSido = (sido) => (expanded.value[sido] = !expanded.value[sido]);

const groupedRegions = computed(() => {
  const list = regionNames.value || [];
  const map = new Map();

  list.forEach((full) => {
    const parts = String(full).trim().split(/\s+/);
    if (parts.length < 2) return;
    const sido = parts[0];
    const gugun = parts.slice(1).join(' ');
    if (!map.has(sido)) map.set(sido, new Set());
    map.get(sido).add(gugun);
  });

  return Array.from(map.entries()).map(([sido, set]) => ({
    sido,
    guguns: Array.from(set),
  }));
});

const joinGuguns = (sido, arr) => {
  if (arr.length <= MAX_GUGUNS) return arr.join(', ');

  const list = isExpanded(sido) ? arr : arr.slice(0, MAX_GUGUNS);
  const remain = arr.length - list.length;
  const text = list.join(', ');
  return isExpanded(sido) ? text : `${text}, 외 ${remain}개`;
};

const formatPeriod = (start, end) => {
  if (!start && !end) return '상시';
  const format = (date) => date?.replace(/-/g, '.') || '미정';
  return `${format(start)} ~ ${format(end)}`;
};

const formatZipCode = () => {
  if (!regionNames.value || regionNames.value.length === 0) return '제한 없음';
  return regionNames.value.join(', ');
};

const formatCurrency = (value) => `${value}만원`;

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
/* 헤더 */
.header {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #f2f3f5;
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
.policy-detail {
  background: #f9fafb;
  min-height: 100vh;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
}

.content {
  padding: 1rem;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}

.tags-left {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}

.tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.tag.main {
  background: #f2f4f6;
  color: #333;
}

.tag.sub {
  background: #e6f0ff;
  color: #007bff;
}

.title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.summary {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.keyword {
  font-size: 0.75rem;
  color: #007bff;
  background: #f5f9ff;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}

.section.card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.section h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.9rem;
  color: #333;
}

.label {
  font-size: 0.8rem;
  color: #888;
}

.link a {
  color: #007bff;
  font-size: 0.9rem;
  text-decoration: none;
}

.bookmark {
  color: #bdbdbd;
  font-size: 1.2rem;
  margin-left: 8px;
  transition: all 0.2s ease;
}

.bookmark.scraped {
  color: #569fff;
  font-weight: 900;
}

.btn-primary {
  background-color: #36c18c;
  border-color: #36c18c;
  color: #fff;
}

.btn-primary:hover {
  background-color: #2fa879;
  border-color: #2fa879;
}

.btn-secondary {
  background-color: #36c18c;
  border-color: #36c18c;
  color: #fff;
}

.btn-secondary:hover {
  background-color: #2fa879;
  border-color: #2fa879;
}

/* 시·도 제목 + 구/군 텍스트 스타일 */
.region-text-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.region-text-group .sido-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.region-text-group .sido {
  font-size: 0.85rem;
  font-weight: 600;
  color: #222;
}

.region-text-group .toggle {
  background: transparent;
  border: 0;
  color: #36c18c;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
}

.region-text-group .gugun-line {
  font-size: 0.82rem;
  font-weight: 400;
  color: #666;
  line-height: 1.6;
  word-break: keep-all;
  white-space: normal;
}
</style>
