<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { getBankLogoUrl } from '@/pages/search/financialSearch/util/bankLogo.js';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// Props 정의
const props = defineProps({
  goalId: {
    type: [String, Number],
    required: true
  }
});

// 반응형 데이터
const loading = ref(true);
const recommendedProducts = ref([]);
const scrapedProducts = ref([]);
const activeIndex = ref(0);
const autoSlideTimer = ref(null);

// 토큰
const token = localStorage.getItem('accessToken');

// 이미지 로드 에러 처리
const handleImageError = (event) => {
  event.target.src = '/images/banks/default.png';
};

// 스크랩 상태 확인
const isScraped = (product) => {
  return scrapedProducts.value.includes(product.productId);
};

// 스크랩 토글
const toggleScrap = async (product) => {
  const productId = product.productId;
  const productType = product.productType === 'SAVINGS' ? 'SAVING' 
    : product.productType === 'DEPOSITS' ? 'DEPOSIT' 
    : product.productType;

  if (!productId || !productType) {
    console.error('상품 ID 또는 타입이 유효하지 않습니다.');
    return;
  }

  try {
    if (isScraped(product)) {
      // 스크랩 해제
      await axios.delete('/api/scrap/finance', {
        headers: { Authorization: `Bearer ${token}` },
        params: { productType, productId },
      });
      scrapedProducts.value = scrapedProducts.value.filter(id => id !== productId);
    } else {
      // 스크랩 추가
      await axios.post('/api/scrap/finance', null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { productType, productId },
      });
      scrapedProducts.value.push(productId);
    }
  } catch (error) {
    console.error('스크랩 처리 중 오류:', error.response?.data || error.message);
    alert('스크랩 처리 중 오류가 발생했습니다.');
  }
};

// 상품 상세 페이지로 이동
const goToDetail = (product) => {
  const productType = product.productType === 'SAVINGS' ? 'saving' 
    : product.productType === 'DEPOSITS' ? 'deposit'
    : product.productType === 'SAVING' ? 'saving' : 'deposit';
  router.push(`/financialSearch/${productType}/${product.productId}`);
};

// 캐러셀 인디케이터 클릭
const setActive = (index) => {
  activeIndex.value = index;
  resetAutoSlide();
};

// 자동 슬라이드 설정
const startAutoSlide = () => {
  if (recommendedProducts.value.length > 1) {
    autoSlideTimer.value = setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % recommendedProducts.value.length;
    }, 5000); // 5초마다 슬라이드
  }
};

// 자동 슬라이드 리셋
const resetAutoSlide = () => {
  if (autoSlideTimer.value) {
    clearInterval(autoSlideTimer.value);
    startAutoSlide();
  }
};

// 전체 금융 상품 추천 조회 후 현재 목표에 맞는 상품만 필터링
const fetchFinancialRecommendations = async () => {
  try {
    loading.value = true;
    
    const response = await axios.get('/api/recommend/finance', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && Array.isArray(response.data)) {
      // 현재 목표 ID에 맞는 추천만 필터링
      const currentGoal = response.data.find(goal => 
        goal.goalId === Number(props.goalId)
      );
      
      if (currentGoal && currentGoal.recommendedProducts) {
        recommendedProducts.value = currentGoal.recommendedProducts;
      } else {
        recommendedProducts.value = [];
      }
    } else {
      recommendedProducts.value = [];
    }
  } catch (error) {
    console.error('금융 상품 추천 조회 실패:', error);
    recommendedProducts.value = [];
  } finally {
    loading.value = false;
  }
};

// 스크랩된 상품 목록 조회
const fetchScrapedProducts = async () => {
  try {
    const response = await axios.get('/api/scrap/finance', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.data && Array.isArray(response.data)) {
      // 스크랩된 상품의 ID만 추출
      scrapedProducts.value = response.data
        .map(scrap => 
          scrap.productType === 'SAVING' ? scrap.product?.savingId : scrap.product?.depositId
        )
        .filter(Boolean); // null 또는 undefined 제거
    }
  } catch (error) {
    console.error('스크랩 목록 조회 실패:', error);
  }
};

// 컴포넌트 마운트 시
onMounted(async () => {
  if (token) {
    await Promise.all([
      fetchFinancialRecommendations(),
      fetchScrapedProducts()
    ]);
    startAutoSlide();
  } else {
    loading.value = false;
    console.warn('인증 토큰이 없습니다.');
  }
});

// 컴포넌트 언마운트 시 타이머 정리
onBeforeUnmount(() => {
  if (autoSlideTimer.value) {
    clearInterval(autoSlideTimer.value);
  }
});
</script>

<template>
  <div class="financial-recommendations">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-4">
      <div class="loading-spinner"></div>
      <p>추천 상품을 불러오는 중...</p>
    </div>

    <!-- 추천 상품 목록 -->
    <div v-else-if="recommendedProducts && recommendedProducts.length > 0" class="carousel-container">
      <div class="carousel">
        <div
          class="carousel-item"
          v-for="(product, index) in recommendedProducts"
          :key="product.productId"
          :class="{ active: index === activeIndex }"
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
        </div>
      </div>

      <!-- 인디케이터 (상품이 2개 이상일 때만 표시) -->
      <div v-if="recommendedProducts.length > 1" class="carousel-indicator">
        <span
          v-for="(product, index) in recommendedProducts"
          :key="index"
          :class="{ dot: true, active: index === activeIndex }"
          @click="setActive(index)"
        ></span>
      </div>
    </div>

    <!-- 추천 상품이 없을 때 -->
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
.financial-recommendations {
  width: 100%;
  margin-bottom: 16px;
}

/* 로딩 스피너 */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #569FFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 캐러셀 컨테이너 */
.carousel-container {
  position: relative;
  width: 100%;
}

.carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 136px; /* 고정 높이 */
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.5s ease-in-out;
}

.carousel-item.active {
  opacity: 1;
  transform: translateX(0);
}

/* 금융 상품 카드 스타일 */
.financial-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 18px 10px 18px;
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.financial-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #ff9d00 0%, #83fff1 70%);
  opacity: 0.7;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.bank-logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
  border-radius: 4px;
  object-fit: contain;
}

.product-title {
  font-weight: bold;
  font-size: 14px;
  color: #222;
  flex: 1;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.bookmark:hover {
  color: #569FFF;
  transform: scale(1.1);
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.rate {
  line-height: 1.4;
}

.small-text {
  font-size: 12px;
}

.main-rate {
  color: #569FFF;
  font-weight: 600;
}

.max-rate {
  font-weight: 500;
}

.button-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
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
  text-decoration: none;
  display: inline-block;
  line-height: 20px;
  margin-left: 8px;
}

/* 인디케이터 */
.carousel-indicator {
  text-align: center;
  margin-top: 4px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #ddd;
  border-radius: 50%;
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  background-color: #000;
  transform: scale(1.2);
}

.dot:hover {
  background-color: #000;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 20px;
  color: #ddd;
  margin-bottom: 6px;
}

.empty-title{
  font-size: 14px;
}

.empty-desc {
  color: #888;
  font-size: 12px;
  line-height: 1.4;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d;
}

.py-4 {
  padding: 1.5rem 0;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .financial-card {
    padding: 14px 16px 10px 16px;
  }
  
  .product-title {
    font-size: 13px;
  }
  
  .small-text {
    font-size: 12px;
  }
  
  .bank-logo {
    width: 28px;
    height: 28px;
  }
}
</style>