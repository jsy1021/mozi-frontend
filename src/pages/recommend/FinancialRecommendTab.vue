<template>
  <div class="recommendations">

    <!-- 목표가 있는 경우 -->
    <div v-if="recommendations && recommendations.length">
      <div
        v-for="(goal, index) in recommendations"
        :key="goal.goalId"
        class="goal-section"
      >
        <div class="goal-header">
          <h5 class="goal-title mb-2">{{ goal.goalName }}</h5>
        </div>

        <!-- 추천 상품이 있는 경우 -->
        <Swiper
          v-if="goal.recommendedProducts && goal.recommendedProducts.length"
          :slides-per-view="'auto'"
          :space-between="16"
          :pagination="{ clickable: true }"
          :modules="[Pagination]"
          class="financial-swiper"
        >
          <SwiperSlide
            v-for="product in goal.recommendedProducts"
            :key="product.productId"
            class="financial-slide"
          >
            <!-- 카드 UI 그대로 재사용 -->
            <div class="financial-card">
              <div class="card-header">
                <img
                  class="bank-logo"
                  :src="getBankLogoUrl(product.bankCode)"
                  alt="은행로고"
                />
                <span class="product-title">{{ product.productName }}</span>
                <i 
                  class="fa-regular fa-bookmark bookmark"
                  :class="{ 'scraped': isScraped(product) }"
                  @click="toggleScrap(product)"
                  style="margin-left: auto; cursor: pointer;"
                ></i>
              </div>

              <div class="card-body">
                <div class="rate small-text">
                  <span style="color:#888;">가입 </span>
                  <span style="color:#444;">{{ product.bankName }}</span><br />
                  <span style="color:#888;">금리 </span>
                  <span class="main-rate">{{ product.intRate }}%({{ product.saveTrm }}개월)</span>,
                  <span class="max-rate" style="color:#e74c3c;">최고 {{ product.intRate2 }}%</span>
                  ({{ product.saveTrm }}개월)
                </div>
              </div>

              <div class="button-container">
                <button class="detail-btn" @click="goToDetail(product)">자세히보기</button>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        <!-- 추천 상품이 없는 경우 -->
        <p v-else class="text-muted text-center py-3">
          추천할 상품이 없습니다.
        </p>

        <!-- 마지막 목표가 아닐 때만 구분선 출력 -->
        <hr v-if="index < recommendations.length - 1" class="goal-divider" />
      </div>
    </div>

    <!-- 목표가 없는 경우 -->
    <div v-else class="text-center text-muted py-4">
      <img src="../../../public/images/noGoal.png" alt="추천 없음" class="empty-image" />
      <p><b>아직 목표가 없어요</b></p>
      <p>목표를 세우면 더 정교한 추천을<br />받을 수 있어요!</p>
      <button class="set-goal-btn" @click="goToGoalPage">목표 세우러 가기</button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { getBankLogoUrl } from '../search/financialSearch/util/bankLogo.js';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const router = useRouter();
const recommendations = ref([]);
const scrapedProducts = ref([]);
const token = localStorage.getItem('accessToken');

// 추천 상품 불러오기
const fetchRecommendationsOnly = async () => {
  try {
    const response = await axios.get('/api/recommend/finance', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    recommendations.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('추천 상품 불러오기 실패:', error);
    recommendations.value = [];
  }
};

// 스크랩 상태 확인
const fetchScrapStatus = async () => {
  try {
    const response = await axios.get('/api/scrap/finance', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const scraps = Array.isArray(response.data) ? response.data : [];

    scrapedProducts.value = scraps
      .map(scrap =>
        scrap.productType === 'SAVING' ? scrap.product?.savingId : scrap.product?.depositId
      )
      .filter(Boolean);
  } catch (error) {
    console.error('스크랩 상태 확인 실패:', error);
    scrapedProducts.value = [];
  }
};

onMounted(async () => {
  await fetchRecommendationsOnly();
  await fetchScrapStatus();
});

const isScraped = (product) => scrapedProducts.value.includes(product.productId);

const toggleScrap = async (product) => {
  const productId = product.productId;
  const productType =
    product.productType === 'SAVINGS' ? 'SAVING'
    : product.productType === 'DEPOSITS' ? 'DEPOSIT'
    : product.productType;

  if (!productId || !productType) {
    console.error('상품 ID 또는 타입이 유효하지 않습니다.');
    return;
  }

  try {
    if (isScraped(product)) {
      await axios.delete('/api/scrap/finance', {
        headers: { Authorization: `Bearer ${token}` },
        params: { productType, productId },
      });
    } else {
      await axios.post('/api/scrap/finance', null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { productType, productId },
      });
    }
    await fetchScrapStatus();
  } catch (error) {
    console.error('스크랩 토글 중 오류 발생:', error.response?.data || error.message);
    alert('스크랩 처리 중 오류가 발생했습니다.');
  }
};

function goToDetail(product) {
  const productType = product.productType === 'SAVINGS' ? 'saving' : 'deposit';
  router.push(`/financialSearch/${productType}/${product.productId}`);
}

function goToGoalPage() {
  router.push('/goal');
}
</script>

<style scoped>
.goal-section {
  margin-bottom: 24px;
}
.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5px 12px;
}
.goal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}
.goal-divider {
  margin: 16px 0; /* 여백만 지정, 색상은 브라우저 기본값 */
}
/* financial-card 스타일 재사용 */
.financial-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 16px 18px 12px 18px;
  margin-bottom: 16px;
  width: 100%;
  position: relative;
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.bank-logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}
.product-title {
  font-weight: bold;
  font-size: 1.1rem;
  color: #222;
  flex: 1;
}
.bookmark {
  color: #bdbdbd;
  font-size: 1.2rem;
  margin-left: 8px;
  transition: all 0.2s ease;
}
.bookmark.scraped {
  color: #569FFF;
}
.bookmark.scraped::before {
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  content: "\f02e";
}
.card-body {
  font-size: 0.97rem;
  color: #444;
  margin-bottom: 8px;
}
.rate .main-rate {
  font-weight: 500;
  margin-left: 4px;
}
.rate .max-rate {
  margin-left: 4px;
}
.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.detail-btn {
  background: #f5f5f5;
  color: #aaa;
  border: none;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 0.85rem;
  min-height: 24px;
  cursor: pointer;
}
.rate.small-text span {
  font-size: 12px;
  font-weight: 600;
}
.small-text {
  font-size: 12px;
}
.empty-recommendation {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-image {
  width: 201px;
  height: auto;
  opacity: 0.8;
}
.set-goal-btn {
  background-color: #36c18c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  width: 200px;
  text-align: center;
}
.set-goal-btn:hover {
  background-color: #2fa477;
}
.financial-swiper {
  padding-bottom: 20px;
}
.financial-slide {
  width: 100%;
}
</style>