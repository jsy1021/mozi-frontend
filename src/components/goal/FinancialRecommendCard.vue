<script setup>
import { ref, onMounted } from 'vue';
import { getBankLogoUrl } from '@/pages/search/financialSearch/util/bankLogo.js';
import { useRouter } from 'vue-router';
import axios from 'axios';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const router = useRouter();

const props = defineProps({
  goalId: {
    type: [String, Number],
    required: true
  }
});

const loading = ref(true);
const recommendedProducts = ref([]);
const scrapedProducts = ref([]);

const token = localStorage.getItem('accessToken');

const handleImageError = (e) => { e.target.src = '/images/banks/default.png'; };
const isScraped = (p) => scrapedProducts.value.includes(p.productId);

const toggleScrap = async (product) => {
  const productId = product.productId;
  const productType =
    product.productType === 'SAVINGS' ? 'SAVING'
    : product.productType === 'DEPOSITS' ? 'DEPOSIT'
    : product.productType;

  if (!productId || !productType) return;

  try {
    if (isScraped(product)) {
      await axios.delete('/api/scrap/finance', {
        headers: { Authorization: `Bearer ${token}` },
        params: { productType, productId },
      });
      scrapedProducts.value = scrapedProducts.value.filter(id => id !== productId);
    } else {
      await axios.post('/api/scrap/finance', null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { productType, productId },
      });
      scrapedProducts.value.push(productId);
    }
  } catch (err) {
    console.error('스크랩 오류:', err.response?.data || err.message);
    alert('스크랩 처리 중 오류가 발생했습니다.');
  }
};

const goToDetail = (product) => {
  const productType =
    product.productType === 'SAVINGS' ? 'saving'
    : product.productType === 'DEPOSITS' ? 'deposit'
    : product.productType === 'SAVING' ? 'saving' : 'deposit';
  router.push(`/financialSearch/${productType}/${product.productId}`);
};

const fetchFinancialRecommendations = async () => {
  try {
    loading.value = true;
    const res = await axios.get('/api/recommend/finance', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (Array.isArray(res.data)) {
      const currentGoal = res.data.find(g => g.goalId === Number(props.goalId));
      recommendedProducts.value = currentGoal?.recommendedProducts ?? [];
    } else {
      recommendedProducts.value = [];
    }
  } catch (e) {
    console.error('추천 조회 실패:', e);
    recommendedProducts.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchScrapedProducts = async () => {
  try {
    const res = await axios.get('/api/scrap/finance', {
      headers: { Authorization: `Bearer ${token}` },
    });
    scrapedProducts.value = Array.isArray(res.data)
      ? res.data.map(s => s.productType === 'SAVING' ? s.product?.savingId : s.product?.depositId).filter(Boolean)
      : [];
  } catch (e) {
    console.error('스크랩 목록 실패:', e);
  }
};

onMounted(async () => {
  if (!token) { loading.value = false; return; }
  await Promise.all([fetchFinancialRecommendations(), fetchScrapedProducts()]);
});
</script>

<template>
  <div class="financial-recommendations">
    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-4">
      <div class="loading-spinner"></div>
      <p>추천 상품을 불러오는 중...</p>
    </div>

    <!-- 슬라이드 -->
    <div v-else-if="recommendedProducts && recommendedProducts.length > 0">
      <Swiper
        :modules="[Pagination]"
        :slides-per-view="1"
        :space-between="16"
        :pagination="{ clickable: true }"
        class="financial-swiper"
      >
        <SwiperSlide
          v-for="product in recommendedProducts"
          :key="product.productId"
          class="slide-full"
        >
          <div class="financial-card">
            <div class="card-header">
              <img
                class="bank-logo"
                :src="getBankLogoUrl(product.bankCode)"
                alt="은행로고"
                @error="handleImageError"
              />
              <span class="product-title">{{ product.productName }}</span>

              <i
                :class="[
                  'bookmark',
                  isScraped(product) ? 'fa-solid fa-bookmark scraped' : 'fa-regular fa-bookmark'
                ]"
                @click="toggleScrap(product)"
                style="margin-left: auto; cursor: pointer;"
              ></i>
            </div>

            <div class="card-body">
              <div class="rate small-text">
                <span style="color:#888;">가입&nbsp;&nbsp;</span>
                <span style="color:#444;">{{ product.bankName }}</span><br />
                <span style="color:#888;">금리&nbsp;&nbsp;</span>
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
    </div>

    <!-- 빈 상태 -->
    <div v-else class="text-center text-muted py-4">
      <div class="empty-state">
        <i class="fa-solid fa-coins empty-icon"></i>
        <p class="empty-title"><strong>추천할 금융 상품이 없습니다</strong></p>
        <p class="empty-desc">목표 정보를 업데이트하시면<br/>더 정확한 추천을 받을 수 있어요!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.financial-recommendations { width: 100%; margin-bottom: 16px; }

/* 로딩 */
.loading-spinner {
  width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #569FFF;
  border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;
}
@keyframes spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }

/* Swiper 컨테이너/도트 간격 */
.financial-swiper { padding-bottom: 20px; } /* 카드와 도트 사이 여백 */
.slide-full { width: 100% !important; }     /* 슬라이드 폭 100% */



/* 카드 스타일 (기존 유지) */
.financial-card {
  background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px 18px 10px 18px; width: 100%; position: relative; display: flex;
  min-height: 136px; flex-direction: column; justify-content: space-between;
  margin-bottom: 16px;
}
.financial-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%;
  background: linear-gradient(to bottom, #ff9d00 0%, #83fff1 70%); opacity: 0.7;
  border-top-left-radius: 10px; border-bottom-left-radius: 10px;
}
.card-header { display: flex; align-items: center; margin-bottom: 8px; }
.bank-logo { width: 32px; height: 32px; margin-right: 8px; border-radius: 4px; object-fit: contain; }
.product-title { font-weight: bold; font-size: 14px; color: #222; flex: 1; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bookmark { color: #bdbdbd; font-size: 1.2rem; margin-left: 8px; transition: all 0.2s ease; }
.bookmark.scraped { color: #569FFF; }
.bookmark:hover { color: #569FFF; transform: scale(1.1); }
.card-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.rate { line-height: 1.4; }
.small-text { font-size: 12px; }
.max-rate { font-weight: 500; }
.button-container { margin-top: 12px; display: flex; justify-content: flex-end; }
.detail-btn {
  background: #f5f5f5; color: #aaa; border: none; border-radius: 6px;
  padding: 2px 10px; font-size: 0.85rem; min-height: 24px; cursor: pointer;
  text-decoration: none; display: inline-block; line-height: 20px; margin-left: 8px;
}

/* 빈 상태 */
.empty-state { text-align: center; }
.empty-icon { font-size: 20px; color: #ddd; margin-bottom: 6px; }
.empty-title { font-size: 14px; }
.empty-desc { color: #888; font-size: 12px; line-height: 1.4; }

.text-center { text-align: center; }
.text-muted { color: #6c757d; }
.py-4 { padding: 1.5rem 0; }

@media (max-width: 480px) {
  .financial-card { padding: 14px 16px 10px 16px; }
  .product-title { font-size: 14px; }
  .small-text { font-size: 12px; }
  .bank-logo { width: 28px; height: 28px; }
}
</style>
