<template>
  <div class="card shadow-sm mb-3 policy-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <!-- 정책 이미지 + 정책명 + 중간 정보 -->
        <div class="d-flex">
          <!-- 이미지 -->
          <img
            src="/images/goal/policy.png"
            alt="정책 이미지"
            style="width: 25px; height: 25px; margin-right: 8px"
          />

          <!-- 정책명 + 중간정보 수직 정렬 -->
          <div>
            <!-- 정책명 -->
            <h6 class="fw-bold mb-2">{{ policy.plcyNm }}</h6>

            <!-- 분야, 연령, 기간 -->
            <div class="small text-muted" style="margin-left: 2px">
              <div>
                분야
                <span class="text-dark fw-semibold">{{
                  policy.mclsfNm || '-'
                }}</span>
                <!-- {{ policy.zipCd }} -->
              </div>
              <div>
                연령
                <span
                  class="text-dark fw-semibold"
                  v-if="policy.sprtTrgtMinAge || policy.sprtTrgtMaxAge"
                >
                  만 {{ policy.sprtTrgtMinAge || '?' }}세 ~ 만
                  {{ policy.sprtTrgtMaxAge || '?' }}세
                </span>
                <span class="text-dark fw-semibold" v-else>누구나</span>
              </div>
              <div>
                기간
                <span class="text-dark fw-semibold">
                  <template
                    v-if="!policy.bizPrdBgngYmd && !policy.bizPrdEndYmd"
                  >
                    상시
                  </template>
                  <template v-else>
                    {{ policy.bizPrdBgngYmd }} ~ {{ policy.bizPrdEndYmd }}
                  </template>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 북마크 -->
        <div class="text-end">
          <i
            class="fa-bookmark ms-4"
            :class="
              bookmarked ? 'fa-solid text-primary' : 'fa-regular text-secondary'
            "
            style="cursor: pointer"
            @click="toggleBookmark"
          ></i>
        </div>
      </div>

      <!-- 키워드 태그 + 상세 버튼 -->
      <div class="mt-2 d-flex justify-content-between align-items-center">
        <div class="d-flex flex-wrap gap-1">
          <span
            class="badge bg-light text-dark"
            v-for="(kw, i) in (policy.plcyKywdNm || '').split(',')"
            :key="i"
          >
            {{ kw.trim() }}
          </span>
        </div>

        <!--  상세 버튼 -->
        <RouterLink
          :to="{ name: 'policyDetail', params: { id: policy.policyId } }"
          class="btn btn-outline-primary btn-sm"
        >
          상세 보기
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
//defineProps({ policy: Object });
import { ref } from 'vue';
import { scrapPolicy, cancelScrap } from '@/api/scrapApi';

const props = defineProps({
  policy: Object,
  isScrapped: {
    type: Boolean,
    default: false,
  },
});

const bookmarked = ref(props.isScrapped);

// 하드코딩된 유저 ID
const userId = 1; // TODO: 로그인 연동 시 교체

const toggleBookmark = async () => {
  try {
    console.log('📌 북마크 클릭됨:', {
      현재상태: bookmarked.value,
      정책ID: props.policy.plcyNo,
      유저ID: userId,
    });

    if (bookmarked.value) {
      await cancelScrap(userId, props.policy.plcyNo);
      console.log('❌ 스크랩 해제 요청 보냄');
    } else {
      await scrapPolicy(userId, props.policy.plcyNo);
      console.log('✅ 스크랩 등록 요청 보냄');
    }

    bookmarked.value = !bookmarked.value;
    console.log('🔄 북마크 상태 변경 →', bookmarked.value);
  } catch (err) {
    console.error('⚠️ 스크랩 처리 오류:', err);
  }
};
</script>

<style scoped>
.policy-card {
  position: relative;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 그라디언트 왼쪽 바 - 투명도 70% */
.policy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #ff0000 0%, #000dff 55%);
  opacity: 0.7; /* 🔹 투명도 설정 */
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}
</style>
