<template>
  <div class="policy-card">
    <div class="card-header">
      <h5 class="policy-title">{{ policy.plcyNm }}</h5>
      <span class="score-badge">{{ policy.score }}점</span>
      <i
        class="fa-regular fa-bookmark bookmark"
        :class="{ scraped: bookmarked }"
        @click="toggleBookmark"
      ></i>
    </div>

    <div class="card-body">
      <div class="info-section">
        <div class="info-item">
          <span class="label">분야</span>
          <span class="value">{{ policy.mclsfNm || '정보 없음' }}</span>
        </div>
        <div class="info-item">
          <span class="label">연령</span>
          <span class="value">
            <span v-if="policy.sprtTrgtMinAge || policy.sprtTrgtMaxAge">
              만 {{ policy.sprtTrgtMinAge || '?' }}세 ~ 만
              {{ policy.sprtTrgtMaxAge || '?' }}세
            </span>
            <span v-else>누구나</span>
          </span>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <RouterLink
        :to="{ name: 'policyDetail', params: { id: policy.policyId } }"
        class="detail-btn"
      >
        자세히보기
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { scrapPolicy, cancelScrap } from '@/api/scrapApi';

const props = defineProps({
  policy: Object,
  isScrapped: Boolean,
});

const bookmarked = ref(props.isScrapped);
const userId = 1; // TODO: 로그인 연동 시 교체

const toggleBookmark = async () => {
  try {
    if (bookmarked.value) {
      await cancelScrap(userId, props.policy.plcyNo);
    } else {
      await scrapPolicy(userId, props.policy.plcyNo);
    }
    bookmarked.value = !bookmarked.value;
  } catch (err) {
    console.error('스크랩 오류', err);
  }
};
</script>

<style scoped>
.policy-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 16px 18px 12px 18px;
  margin-bottom: 16px;
  width: 100%;
  position: relative;
}

.policy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #ff0000 0%, #000dff 55%);
  opacity: 0.7;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.policy-title {
  font-weight: bold;
  font-size: 14px;
  color: #222;
  flex: 1;
}

.score-badge {
  font-size: 12px;
  font-weight: 600;
  background: #e3f2fd;
  color: #007bff;
  padding: 2px 8px;
  border-radius: 8px;
  margin-right: 8px;
}

.bookmark {
  color: #bdbdbd;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.bookmark.scraped {
  color: #569fff;
  font-weight: 900;
}

.card-body {
  font-size: 0.97rem;
  color: #444;
  margin-bottom: 8px;
}

.info-section {
  font-size: 12px;
  margin-bottom: 8px;
}

.info-item {
  margin-bottom: 2px;
}

.info-item .label {
  color: #888;
  font-weight: 600;
}

.info-item .value {
  color: #444;
  margin-left: 4px;
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.detail-btn {
  background: #f5f5f5;
  color: #aaa;
  border: none;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
}
</style>
